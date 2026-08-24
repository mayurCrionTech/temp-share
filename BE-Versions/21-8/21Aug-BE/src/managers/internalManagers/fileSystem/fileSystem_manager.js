const {
	BlobServiceClient,
	StorageSharedKeyCredential,
	generateBlobSASQueryParameters,
	BlobSASPermissions,
} = require("@azure/storage-blob");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { fileStorageConfig, authConfig } = require("../../../configs");
const paginationHandler = require("../../common/paginationHandler_manager");
const File = require("../../../models/mongoDB/fileSystem/fileSystem_model");
const Model = File;
const { mongoDbManager } = require("../../dBManagers");
const { default: mongoose } = require("mongoose");
// const { fileTypeFromFile } = require('file-type');


const azureContainerName = fileStorageConfig.AZURE_CONTAINER_NAME;

const storageProvider = fileStorageConfig.STORAGE_PROVIDER;


const sharedKeyCredential = new StorageSharedKeyCredential(
	fileStorageConfig.AZURE_ACCOUNT_NAME,
	fileStorageConfig.AZURE_ACCOUNT_KEY
);
const blobServiceClient = new BlobServiceClient(
	`https://${fileStorageConfig.AZURE_ACCOUNT_NAME}.blob.core.windows.net`,
	sharedKeyCredential
);


async function createFileRecord({ name, extension, mimetype, size, filePath, moduleName, moduleId, userId, businessUnit }) {
	const now = new Date();

	const createdFile = new Model({
		name: name || path.basename(filePath, `.${extension}`),
		extension,
		contentType: mimetype,
		size,
		storageLocation: {
			provider: storageProvider,
			path: filePath
		},
		moduleName: moduleName || null,
		moduleId: moduleId || null,
		businessUnit: businessUnit,
		createdAt: now,
		updatedAt: now,
		createdBy: userId,
		updatedBy: userId,
		metadata: {}
	});

	await createdFile.save();
	return createdFile;
}

// Helper function to handle storage upload
async function handleStorageUpload(createdFile, filePath, fileName, moduleName, moduleId) {
	if (storageProvider === "azure") {
		const containerName = azureContainerName;
		const blobPath = getBlobPath(moduleName, moduleId, createdFile._id, fileName, filePath);
		const fileExtension = path.extname(filePath).substring(1);
		const mimetype = getMimeType(fileExtension);
		await uploadToAzure(containerName, blobPath, filePath,mimetype);
		createdFile.storageLocation.path = blobPath;
	} else {
		const directoryPath = await createDirectoryStructure(
			moduleName,
			moduleId,
			createdFile._id,
			fileName,
			filePath
		);
		createdFile.storageLocation.path = directoryPath;
	}

	await createdFile.save();
}

// Main function for uploading file
async function uploadFile(file, name, moduleName, moduleId, userId, businessUnit) {
	try {
		if (!file) throw new Error("File not provided");
		if (!moduleName && moduleId) throw new Error("Both moduleName and moduleId must be provided together");
		if (!userId) throw new Error("User id not provided");

		let originalExtension = file.originalname.split(".").pop();
		let fileName = name ? `${name}.${originalExtension}` : file.originalname;

		const createdFile = await createFileRecord({
			name: name || file.originalname.replace(`.${originalExtension}`, ""),
			extension: originalExtension,
			mimetype: file.mimetype,
			size: file.size,
			filePath: file.path,
			moduleName,
			moduleId,
			userId,
			businessUnit
		});

		await handleStorageUpload(createdFile, file.path, fileName, moduleName, moduleId);

		return createdFile;
	} catch (err) {
		fs.unlink(file.path, (error) => {
			if (error) {
				console.error(`Failed to delete file ${file.path}: ${error.message}`);
			}
		});
		throw err;
	}
}

// Main function for internal file upload
async function uploadFileInternal(filePath, businessUnit, name, moduleName, moduleId, userId) {
	try {
		// Check if the file exists
		if (!fs.existsSync(filePath)) throw new Error("File not found");

		// Get file extension and name
		const fileExtension = path.extname(filePath).substring(1);
		const fileName = name ? `${name}.${fileExtension}` : path.basename(filePath);
		const fileSize = fs.statSync(filePath).size;
		const mimetype = getMimeType(fileExtension);

		// Validate moduleName and moduleId
		if (!moduleName && moduleId) throw new Error("Both moduleName and moduleId must be provided together");

		if (!isValidFileExtensionAndSize(fileExtension, fileSize)) {
			throw new Error(isValidFileExtensionAndSize(fileExtension, fileSize).message);
		}
		// console.log("businessUnit", businessUnit)
		// Create file record
		const createdFile = await createFileRecord({
			name: name || path.basename(filePath, `.${fileExtension}`),
			extension: fileExtension,
			mimetype,
			size: fileSize,
			filePath,
			moduleName,
			moduleId,
			userId,
			businessUnit
		});

		// Handle storage upload
		await handleStorageUpload(createdFile, filePath, fileName, moduleName, moduleId);

		return createdFile;
	} catch (err) {
		// Handle and throw errors with a clear message
		throw new Error(`File upload failed: ${err.message}`);
	}
}


// Helper function to determine MIME type
function getMimeType(extension) {
	const mimeTypes = {
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		pdf: "application/pdf",
		fbx: "application/octet-stream",
		xls: "application/vnd.ms-excel",
   	 	xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	};
	return mimeTypes[extension] || "application/octet-stream";
}

async function updateFilePath(fileObj, id, moduleName, moduleId, userId) {
	try {
		if (!moduleName && moduleId) throw new Error("Both moduleName and moduleId must be provided together");

		if (!fileObj) {
			fileObj = await mongoDbManager.findOne(Model, { _id: id });
			if (!fileObj) throw new Error("File not found");
		} else if (!fileObj && !id) {
			throw new Error("Id not provided");
		}

		let storagePath = fileObj.storageLocation.path;

		if (fileObj.storageLocation.provider === "azure") {
			const newFilePath = getNewFilePath(moduleName, moduleId, fileObj._id, fileObj.name, fileObj.extension);
			await updateAzurePath(fileObj, moduleName, moduleId, newFilePath, userId);
		} else if (fileObj.storageLocation.provider === "local") {
			const newFilePath = getNewFilePath(moduleName, moduleId, fileObj._id, fileObj.name, fileObj.extension);
			await updateLocalPath(fileObj, moduleName, moduleId, newFilePath);
		} else {
			throw new Error("Unsupported storage provider");
		}
		return;
	} catch (error) {
		throw error;
	}
}

async function updateFilePaths(fileObjs, ids, moduleName, moduleId, userId) {
	try {
		// Validate input
		if (!moduleName && moduleId) throw new Error("Both moduleName and moduleId must be provided together");

		// If fileObjs is not provided, get it from the database using id

		if (!ids) {
			throw new Error("Id not provided");
		}

		fileObjs = await mongoDbManager.findMany(Model, { _id: { $in: ids } });
		if (!fileObjs.length) throw new Error("File(s) not found");


		// Iterate through each file object
		for (let fileObj of fileObjs) {
			let storagePath = fileObj.storageLocation.path;

			if (fileObj.storageLocation.provider === "azure") {
				const newFilePath = getNewFilePath(moduleName, moduleId, fileObj._id, fileObj.name, fileObj.extension);
				await updateAzurePath(fileObj, moduleName, moduleId, newFilePath, userId);
			} else if (fileObj.storageLocation.provider === "local") {
				const newFilePath = getNewFilePath(moduleName, moduleId, fileObj._id, fileObj.name, fileObj.extension);
				await updateLocalPath(fileObj, moduleName, moduleId, newFilePath);
			} else {
				throw new Error("Unsupported storage provider");
			}
		}
		return;
	} catch (error) {
		throw error;
	}
}

async function getFile(id, action, businessUnit, reqHost, reqProtocol) {
	try {
		const file = await mongoDbManager.findOne(Model, { _id: id, isDeleted: false, businessUnit: businessUnit });
		if (file) {
			return transformFileObj(file, action, reqHost, reqProtocol);
		} else return null;
	} catch (err) {
		throw err;
	}
}

async function transformFileObj(file, action, reqHost, reqProtocol) {
	if (action == "internal") {
		return file;
	}

	if (action && reqHost && reqProtocol) {
		const token = jwt.sign({ fileId: file._id }, authConfig.SECRET, { expiresIn: "1h" });
		const fileUrl =
			file.storageLocation.provider === "local"
				? `${reqProtocol}://${reqHost}/api/v1/files/${file._id}/actions/${action}?token=${token}`
				: await getAzureFileUrl(file);

		file.url = fileUrl;
		return {
			id: file._id,
			name: file.name,
			extension: file.extension,
			contentType: file.contentType,
			url: fileUrl,
			size: file.size,
			moduleName: file.moduleName,
			moduleId: file.moduleId
		};
	}
	return {
		id: file._id,
		name: file.name,
		extension: file.extension,
		contentType: file.contentType,
		size: file.size,
		moduleName: file.moduleName,
		moduleId: file.moduleId
	};
}

async function getFiles(ids, action, businessUnit, reqHost, reqProtocol, createdBeforeDate, storagePathRegex, page = 1, limit) {
	try {
		let query = { isDeleted: false , businessUnit: new mongoose.Types.ObjectId(businessUnit)};

		if (ids?.length > 0) {
			query._id = { $in: ids };
		}

		if (createdBeforeDate) {
			query.createdAt = { $lt: createdBeforeDate };
		}

		if (storagePathRegex) {
			query["storageLocation.path"] = { $regex: storagePathRegex };
		}

		const countData = await mongoDbManager.count(Model, query);

		// Default pagination values if not provided
		page = parseInt(page) ?? 1;
		// make page to number if string
		limit = limit ?? (countData || 1);

		const sortOrder = { createdAt: 1 }; // Sort by createdAt in ascending order
		const skip = (page - 1) * limit;

		let files = await mongoDbManager.findManyWithPopulate(Model, query, limit, skip, sortOrder, [
			"_id",
			"name",
			"extension",
			"contentType",
			"size",
			"storageLocation",
			"createdAt",
			"updatedAt",
			"deletedAt",
			"isDeleted",
			"moduleName",
			"moduleId"
		]);

		if (files.length > 0) {
			if (action === "internal") {
				return files;
			}

			const data = await Promise.all(
				files.map(async (file) => {
					let fileData = {
						id: file._id,
						name: file.name,
						extension: file.extension,
						contentType: file.contentType,
						size: file.size,
						moduleName: file.moduleName,
						moduleId: file.moduleId
					};

					if (action && ["stream", "download", "view"].includes(action) && reqProtocol && reqHost) {
						const token = jwt.sign({ fileId: file._id }, authConfig.SECRET, { expiresIn: "1h" });
						fileData.url =
							file.storageLocation.provider === "local"
								? `${reqProtocol}://${reqHost}/api/v1/files/${file._id}/actions/${action}?token=${token}`
								: await getAzureFileUrl(file);
					}

					return fileData;
				})
			);

			const totalPages = countData === 0 ? 0 : Math.ceil(countData / limit);
			return paginationHandler.paginationResObj(page, totalPages, countData, data);
		} else {
			return [];
		}
	} catch (err) {
		throw err;
	}
}


async function copyToLocation(fileObjs, userId, destination, fileIds) {
	try {
	  let idsToFetch = [];
	  const newFileRecords = [];
	  const fileObjMap = {};
  
	  // Validate input
	  if (fileObjs) {
		if (!Array.isArray(fileObjs) || fileObjs.length === 0) {
		  throw new Error("fileObjs must be a non-empty array");
		}
		// Collect IDs to fetch from fileObjs
		idsToFetch = fileObjs
		  .filter((fileObj) => fileObj && fileObj.id && !fileObj.fileObj)
		  .map((fileObj) => fileObj.id);
	  }
  
	  if (!fileObjs && fileIds) {
		if (!Array.isArray(fileIds) || fileIds.length === 0) {
		  throw new Error("fileIds must be a non-empty array");
		}
		// Use fileIds directly when fileObjs is null
		idsToFetch = fileIds;
	  }
  
	  // Fetch files if IDs are provided
	  if (idsToFetch.length > 0) {
		const fetchedFiles = await mongoDbManager.findMany(Model, {
		  _id: { $in: idsToFetch },
		});
		fetchedFiles.forEach((file) => {
		  fileObjMap[file._id.toString()] = file;
		});
	  }
  
	  // Prepare records for bulk insert
	  const filesToProcess = fileObjs || idsToFetch.map((id) => ({ id }));
	  for (const fileObj of filesToProcess) {
		const actualFileObj = fileObj.fileObj || fileObjMap[fileObj.id] || fileObj;
		if (!actualFileObj) {
		  throw new Error(`File not found for id: ${fileObj.id}`);
		}
  
		const destinationPath = `${destination}/${actualFileObj.name}.${actualFileObj.extension}`;
		newFileRecords.push({
		  name: actualFileObj.name,
		  extension: actualFileObj.extension,
		  contentType: actualFileObj.contentType,
		  size: actualFileObj.size,
		  moduleName: null,
		  moduleId: null,
		  businessUnit: actualFileObj.businessUnit,
		  createdBy: userId,
		  updatedBy: userId,
		  storageLocation: {
			provider: actualFileObj.storageLocation.provider,
			path: destinationPath,
		  },
		  createdAt: new Date(),
		  updatedAt: new Date(),
		  metadata: {},
		});
	  }
  
	  // Perform bulk insert
	  const insertedFiles = await mongoDbManager.insertMany(Model, newFileRecords);
  
	  // Copy files and update paths in parallel
	  const bulkUpdateOps = [];
	  await Promise.all(
		insertedFiles.map(async (newFileRecord, index) => {
		  const actualFileObj = fileObjs
			? fileObjs[index]
			: fileObjMap[idsToFetch[index]];
  
		  if (!actualFileObj) {
			throw new Error(`File details missing for: ${newFileRecord._id}`);
		  }
  		 
		  if (newFileRecord.storageLocation.provider === "azure") {
			const fileName = `${newFileRecord.name}.${newFileRecord.extension}`;
			const newPath = getBlobPath(
			  null,
			  null,
			  newFileRecord._id,
			  fileName,
			  newFileRecord.storageLocation.path
			);
			await copyFileInAzure(actualFileObj.storageLocation.path, newPath);
			newFileRecord.storageLocation.path = newPath;
		  await newFileRecord.save(); 
		  } else if (newFileRecord.storageLocation.provider === "local") {
			const moduleName = newFileRecord.moduleName;
			const moduleId = newFileRecord.moduleId;
			const fileId = `${newFileRecord._id}.${newFileRecord.extension}`;
			const now = new Date();
			const newPath = moduleName
			  ? moduleId
				? `${fileStorageConfig.LOCAL_UPLOADS_DIRECTORY}/modules/${moduleName}/${moduleId}/${fileId}`
				: `${fileStorageConfig.LOCAL_UPLOADS_DIRECTORY}/modules/${moduleName}/common/${fileId}`
			  : `${fileStorageConfig.LOCAL_UPLOADS_DIRECTORY}/temp/${now.getFullYear()}/${String(
				  now.getMonth() + 1
				).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${fileId}`;
			await copyFileLocally(actualFileObj.storageLocation.path, newPath);
			newFileRecord.storageLocation.path = newPath;
		  	await newFileRecord.save(); 
		  } else {
			throw new Error("Unsupported storage provider");
		  }		  
		})
	  );  
	  return insertedFiles;
	} catch (error) {
	  console.error("Error copying multiple files:", error);
	  throw error;
	}
  }
  
  
  
  
  async function copyFileInAzure(sourcePath, destinationPath) {
	console.log("destinationPath", destinationPath);
	const containerClient = blobServiceClient.getContainerClient(azureContainerName);
	const sourceBlobClient = containerClient.getBlobClient(sourcePath);
	const destinationBlobClient = containerClient.getBlobClient(destinationPath);
	
	const sasOptions = {
		containerName: azureContainerName,
		blobName: sourcePath,
		permissions: BlobSASPermissions.parse("r"),
		startsOn: new Date(),
		expiresOn: new Date(new Date().valueOf() + 60 * 60 * 1000)
	};
	const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
	const sourceUrl = `${sourceBlobClient.url}?${sasToken}`;

	const poller = await destinationBlobClient.beginCopyFromURL(sourceUrl);
	await poller.pollUntilDone();
	
	console.log(`File copied from Azure path: ${sourcePath} to ${destinationPath}`);
  }

async function copyFileLocally(sourcePath, destinationPath) {
  const destinationDir = path.dirname(destinationPath);

  // Ensure the destination directory exists
  await fs.mkdir(destinationDir, { recursive: true });

  // Copy the file
  await fs.copyFile(sourcePath, destinationPath);

  console.log(`File copied from local path: ${sourcePath} to ${destinationPath}`);
}

// async function fileAction (req, res) {
// 	try {
// 	const action = req.params.action;

// 	const file = req.fileObj;

// 	const filePath = path.resolve(file.storageLocation.path);
// 	await fs.promises.access(filePath, fs.constants.F_OK);

// 	switch (action) {
// 		case "download":
// 			return sendFile(res, filePath, file.name, "attachment");
// 		case "view":
// 			return sendFile(res, filePath, file.name, "inline");
// 		case "stream":
// 			return streamFile(req, res, filePath, file.contentType);
// 		default:
// 			throw new Error("Invalid action");
//         }
//     }
//     catch (err) {
//         throw err;
//     }
// };
async function moveToRecycleBin(fileObj, id, userId) {

	try {

		if (!fileObj) {
			fileObj = await mongoDbManager.findOne(Model, { _id: id });
			if (!fileObj) throw new Error("File not found");
		} else if (!fileObj && !id) {
			throw new Error("Id not provided");
		}
		let storagePath = fileObj.storageLocation.path;
		let originalStoragePath = storagePath;

		// Clean the storage path to ensure no nested recycleBin segments
		if (storagePath.startsWith("uploads\\recycleBin\\") || storagePath.startsWith("recycleBin\\")) {
			storagePath = storagePath.replace(/^uploads\\recycleBin\\/, "").replace(/^recycleBin\\/, "");
		} else if (storagePath.startsWith("recycleBin/")) {
			storagePath = storagePath.replace(/^recycleBin\//, "");
		}

		let recycleBinPath = `recycleBin/${storagePath.replace("uploads\\", "")}`;

		if (fileObj.storageLocation.provider === "azure") {
			await moveToAzureRecycleBin(fileObj, recycleBinPath, originalStoragePath, userId);
		} else if (fileObj.storageLocation.provider === "local") {
			await moveToLocalRecycleBin(fileObj, recycleBinPath, userId);
		} else {
			throw new Error("Unsupported storage provider");
		}

		return fileObj;
	} catch (error) {
		throw error;
	}
};

async function returnValidFileObjAndInvalidFileIds(ids) {
	try {
		let invalidFileIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

		if (invalidFileIds.length > 0) {
			return { invalidFileIds };
		}

		const query = {
			_id: { $in: ids },
			isDeleted: false
		};

		const validFileObj = await mongoDbManager.findMany(Model, query);

		const existingFileIds = validFileObj.map((asset) => asset._id.toString());

		invalidFileIds.push(...ids.filter((id) => !existingFileIds.includes(id)));

		let result = {
			validFileObj: validFileObj,
			invalidFileIds: Array.from(new Set(invalidFileIds))
		};
		return result
	} catch (error) {
		throw error;
	}
};

async function deleteTemporaryFiles(filesObj, userId) {
	try {
		const filesToDelete = filesObj;

		for (const file of filesToDelete) {
			if (file.storageLocation.provider === "azure") {
				await deleteAzureBlob(file, userId);
			} else if (file.storageLocation.provider === "local") {
				await deleteLocalFile(file, userId);
			}
		}
	} catch (error) {
		throw error;
	}
};

async function deleteFile(fileObj, userId) {
	try {
		const file = fileObj;
		if (file.storageLocation.provider === "azure") {
			await deleteAzureBlob(file, userId);
		} else if (file.storageLocation.provider === "local") {
			await deleteLocalFile(file, userId);
		}
	} catch (err) {
		throw err;
	}
};
const getBlobPath = (moduleName, moduleId, fileId, fileName) => {
	const now = new Date();
	return moduleName && moduleId
		? `modules/${moduleName}/${moduleId}/${fileId}/${fileName}`
		: moduleName
			? `modules/${moduleName}/common/${fileId}/${fileName}`
			: `temp/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(
				now.getDate()
			).padStart(2, "0")}/${fileId}/${fileName}`;
};

// const uploadToAzure = async (containerName, blobPath, localFilePath) => {
// 	const containerClient = blobServiceClient.getContainerClient(containerName);
// 	const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
// 	await blockBlobClient.uploadFile(localFilePath);
// 	fs.unlinkSync(localFilePath);
// };

const uploadToAzure = async (containerName,blobPath,localFilePath,mimetype) => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient =containerClient.getBlockBlobClient(blobPath);
  await blockBlobClient.uploadFile(localFilePath, {
    blobHTTPHeaders: {
      blobContentType: mimetype,
      blobContentDisposition: "inline"
    }
  });
  fs.unlinkSync(localFilePath);
};


// const uploadToAzure = (containerName, blobPath, localFilePath) => {
//   return new Promise((resolve, reject) => {
//     // Automatically detect the MIME type
// 	const contentType = type ? type.mime : 'application/pdf';
//     // const contentType = mime.lookup(localFilePath) || 'application/pdf';
// 	console.log("localFilePath", localFilePath)
// 	console.log("contentType", contentType)
//     blobService.createBlockBlobFromLocalFile(
//       containerName,
//       blobPath,
//       localFilePath,
//       {
//         contentSettings: {
//           contentType,                // e.g., image/png, application/pdf, text/plain
//           contentDisposition: 'inline' // ensures browser displays instead of downloads
//         }
//       },
//       (error, result, response) => {
//         try {
//           if (error) return reject(error);
//           fs.unlinkSync(localFilePath); // remove local temp file
//           resolve(result);
//         } catch (err) {
//           reject(err);
//         }
//       }
//     );
//   });
// };
const createDirectoryStructure = (moduleName, moduleId, fileId, fileName, filePath) => {
	return new Promise((resolve, reject) => {
		let directoryPath;
		if (moduleName && moduleId) {
			directoryPath = `${fileStorageConfig.LOCAL_UPLOADS_DIRECTORY}/modules/${moduleName}/${moduleId}/${fileId}`;
		} else if (moduleName) {
			directoryPath = `${fileStorageConfig.LOCAL_UPLOADS_DIRECTORY}/modules/${moduleName}/common/${fileId}`;
		} else {
			const now = new Date();
			directoryPath = `${fileStorageConfig.LOCAL_UPLOADS_DIRECTORY
				}/temp/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(
					now.getDate()
				).padStart(2, "0")}/${fileId}`;
		}

		fs.mkdir(directoryPath, { recursive: true }, (err) => {
			if (err) return reject(err);
			const destinationPath = path.join(directoryPath, fileName);
			fs.rename(filePath, destinationPath, (error) => {
				if (error) return reject(error);
				resolve(destinationPath);
			});
		});
	});
};

const getNewFilePath = (moduleName, moduleId, fileId, fileName, extension) => {
	if (fileName) {
		return moduleName && moduleId
			? `modules/${moduleName}/${moduleId}/${fileId}/${fileName}.${extension}`
			: `modules/${moduleName}/common/${fileId}/${fileName}.${extension}`;
	} else {
		return moduleName && moduleId
			? `modules/${moduleName}/${moduleId}/${fileId}.${extension}`
			: `modules/${moduleName}/common/${fileId}.${extension}`;
	}
};

const updateAzurePath = async (file, moduleName, moduleId, newFilePath, userId) => {
	const oldFilePath = file.storageLocation.path;
	const containerName = azureContainerName;
	let deleteBlobFile = false;
	if (newFilePath !== oldFilePath) {
		deleteBlobFile = true;
	}

	const containerClient = blobServiceClient.getContainerClient(containerName);
	const sourceBlobClient = containerClient.getBlobClient(oldFilePath);
	const destinationBlobClient = containerClient.getBlobClient(newFilePath);

	const sasOptions = {
		containerName,
		blobName: oldFilePath,
		permissions: BlobSASPermissions.parse("rw"),
		startsOn: new Date(),
		expiresOn: new Date(new Date().getTime() + 60 * 60 * 1000)
	};
	const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
	const sourceUrl = `${sourceBlobClient.url}?${sasToken}`;

	const poller = await destinationBlobClient.beginCopyFromURL(sourceUrl);
	await poller.pollUntilDone();

	const id = file._id;
	await mongoDbManager.updateOne(
		Model,
		{ _id: id },
		{
			$set: {
				moduleName: moduleName,
				moduleId: moduleId,
				updatedAt: new Date(),
				updatedBy: userId,
				"storageLocation.path": newFilePath
			}
		}
	);

	if (deleteBlobFile) {
		await sourceBlobClient.deleteIfExists();
	}
};

const updateLocalPath = (file, moduleName, moduleId, newFilePath, userId) => {
	return new Promise((resolve, reject) => {
		const oldFilePath = file.storageLocation.path;
		const newDirectoryPath = path.join(fileStorageConfig.LOCAL_UPLOADS_DIRECTORY, newFilePath);
		const newFileFullPath = path.join(newDirectoryPath, path.basename(oldFilePath));

		fs.mkdir(newDirectoryPath, { recursive: true }, (err) => {
			if (err) {
				console.error("Error creating directory:", err);
				return reject(err);
			}

			fs.rename(oldFilePath, newFileFullPath, async (error) => {
				if (error) {
					console.error("Error renaming file:", error);
					return reject(error);
				}

				try {
					const id = file._id;
					await mongoDbManager.updateOne(
						Model,
						{ _id: id },
						{
							$set: {
								moduleName: moduleName,
								moduleId: moduleId,
								updatedAt: new Date(),
								updatedBy: userId,
								"storageLocation.path": newFileFullPath
							}
						}
					);
					resolve();
				} catch (updateError) {
					console.error("Error updating file record in database:", updateError);
					reject(updateError);
				}
			});
		});
	});
};

const getAzureFileUrl = async (file) => {
	const containerName = azureContainerName;
	const blobName = file.storageLocation.path;
	
	const sasOptions = {
		containerName,
		blobName,
		permissions: BlobSASPermissions.parse("r"),
		startsOn: new Date(),
		expiresOn: new Date(Date.now() + 60 * 60 * 1000)
	};

	const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
	const containerClient = blobServiceClient.getContainerClient(containerName);
	const blobClient = containerClient.getBlobClient(blobName);
	return `${blobClient.url}?${sasToken}`;
};

// const getAzureFileUrl = (file) => {
// 	const containerName = azureContainerName;
// 	const blobName = file.storageLocation.path;
// 	const sasToken = blobService.generateSharedAccessSignature(containerName, blobName, {
// 		AccessPolicy: {
// 			Permissions: azureStorage.BlobUtilities.SharedAccessPermissions.READ,
// 			Expiry: new Date(Date.now() + 60 * 60 * 1000)
// 		}
// 	});
// 	const url = blobService.getUrl(containerName, blobName, sasToken, true) +
//     '&response-content-disposition=inline';
// 	return url;
// };

const sendFile = (res, filePath, fileName, dispositionType) => {
	res.setHeader("Content-Disposition", `${dispositionType}; filename="${fileName}"`);
	return res.sendFile(filePath);
};

const streamFile = (req, res, filePath, contentType) => {
	const stat = fs.statSync(filePath);
	const fileSize = stat.size;
	const range = req.headers.range;

	if (range) {
		const parts = range.replace(/bytes=/, "").split("-");
		const start = parseInt(parts[0], 10);
		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

		if (start >= fileSize) {
			res.status(416).send("Requested range not satisfiable\n" + start + " >= " + fileSize);
			return;
		}

		const chunksize = end - start + 1;
		const file = fs.createReadStream(filePath, { start, end });
		const head = {
			"Content-Range": `bytes ${start}-${end}/${fileSize}`,
			"Accept-Ranges": "bytes",
			"Content-Length": chunksize,
			"Content-Type": contentType
		};

		res.writeHead(206, head);
		file.pipe(res);
	} else {
		const head = {
			"Content-Length": fileSize,
			"Content-Type": contentType
		};
		res.writeHead(200, head);
		fs.createReadStream(filePath).pipe(res);
	}
};

const moveToAzureRecycleBin = async (file, recycleBinPath, storagePath, userId) => {
	console.log("Moving file to Azure recycle bin..., recycleBinPath:", recycleBinPath);
	const containerName = azureContainerName;
	let deleteBlobFile = false;
	if (recycleBinPath !== storagePath) {
		deleteBlobFile = true;
	}

	const containerClient = blobServiceClient.getContainerClient(containerName);
	const sourceBlobClient = containerClient.getBlobClient(storagePath);
	const destinationBlobClient = containerClient.getBlobClient(recycleBinPath);

	const sasOptions = {
		containerName,
		blobName: storagePath,
		permissions: BlobSASPermissions.parse("rw"),
		startsOn: new Date(),
		expiresOn: new Date(new Date().getTime() + 60 * 60 * 1000)
	};
	const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
	const sourceUrl = `${sourceBlobClient.url}?${sasToken}`;

	const poller = await destinationBlobClient.beginCopyFromURL(sourceUrl);
	await poller.pollUntilDone();

	try {
		await mongoDbManager.updateOne(
			Model,
			{ _id: file._id },
			{
				$set: {
					isSentToRecycleBin: true,
					updatedAt: new Date(),
					updatedBy: userId,
					"storageLocation.path": recycleBinPath,
					clearRecycleBinAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days later
				}
			}
		);

		console.log("recycleBinPath:", recycleBinPath, "storagePath:", storagePath);
		if (deleteBlobFile) {
			await sourceBlobClient.deleteIfExists();
		}
	} catch (updateError) {
		console.error("Error updating file record in database:", updateError);
		throw updateError;
	}
};

const moveToLocalRecycleBin = (file, recycleBinPath, userId) => {
	return new Promise((resolve, reject) => {
		const oldFilePath = file.storageLocation.path;
		const newDirectoryPath = path.join(
			fileStorageConfig.LOCAL_UPLOADS_DIRECTORY,
			path.dirname(recycleBinPath)
		);
		const newFilePath = path.join(newDirectoryPath, path.basename(oldFilePath));

		console.log("Old file path:", oldFilePath);
		console.log("New directory path:", newDirectoryPath);
		console.log("New file path:", newFilePath);

		fs.mkdir(newDirectoryPath, { recursive: true }, (err) => {
			if (err) {
				console.error("Error creating directory:", err);
				return reject(err);
			}

			fs.rename(oldFilePath, newFilePath, async (error) => {
				if (error) {
					console.error("Error renaming file:", error);
					return reject(error);
				}

				try {
					await mongoDbManager.updateOne(
						Model,
						{ _id: file._id },
						{
							$set: {
								isSentToRecycleBin: true,
								updatedAt: new Date(),
								updatedBy: userId,
								"storageLocation.path": newFilePath,
								clearRecycleBinAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days later
							}
						}
					);
					resolve();
				} catch (updateError) {
					console.error("Error updating file record in database:", updateError);
					reject(updateError);
				}
			});
		});
	});
};

const deleteAzureBlob = async (file, userId) => {
	const containerName = azureContainerName;
	const blobPath = file.storageLocation.path;
	
	const containerClient = blobServiceClient.getContainerClient(containerName);
	const blobClient = containerClient.getBlobClient(blobPath);
	await blobClient.deleteIfExists();

	await mongoDbManager.updateOne(
		Model,
		{ _id: file._id },
		{
			$set: {
				isDeleted: true,
				updatedAt: new Date(),
				updatedBy: userId
			}
		}
	);
};

const deleteLocalFile = (file, userId) => {
	return new Promise((resolve, reject) => {
		const filePath = file.storageLocation.path;
		fs.unlink(filePath, async (err) => {
			if (err) return reject(err);
			await mongoDbManager.updateOne(
				Model,
				{ _id: file._id },
				{
					$set: {
						isDeleted: true,
						updatedAt: new Date(),
						updatedBy: userId
					}
				}
			);
			resolve();
		});
	});
};


const isValidFileType = (mimetype) => {
	const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "application/octet-stream"];
	return allowedTypes.includes(mimetype);
};

const isValidExtension = (fileExtension) => {
	const allowedExtensions = ["jpg", "jpeg", "png", "pdf", "fbx"];
	return allowedExtensions.includes(fileExtension);
};

const isValidFileSize = (fileExtension, size) => {
	const sizeLimits = {
		"jpg": 6 * 1024 * 1024, // 6MB for JPEG images
		"jpeg": 6 * 1024 * 1024, // 6MB for JPEG images
		"png": 6 * 1024 * 1024, // 6MB for PNG images
		"pdf": 6 * 1024 * 1024, // 6MB for PDF files
		"fbx": 20 * 1024 * 1024 // 20MB for FBX files
	};


	if (!sizeLimits[fileExtension]) {
		return { valid: false, message: "Unsupported file extension" };
	}

	if (size > sizeLimits[fileExtension]) {
		return {
			valid: false,
			message: `File size exceeds limit for ${fileExtension.toUpperCase()} files.`,
			maxSize: `${sizeLimits[fileExtension] / 1024 / 1024} MB`,
			fileSize: `${size / 1024 / 1024} MB`
		};
	}

	return { valid: true };
};

const isValidFileExtensionAndSize = (fileExtension, size) => {
	const fileConfigs = Model.fileExtensionAndSizeConfigs;
	const fileConfig = fileConfigs[fileExtension];

	if (!fileConfig) {
		return { valid: false, message: "Invalid file extension" };
	}

	if (size > fileConfig.maxSize) {
		return {
			valid: false,
			message: `File size exceeds limit for ${fileExtension.toUpperCase()} files.`,
			maxSize: `${fileConfig.maxSize / 1024 / 1024} MB`,
			fileSize: `${size / 1024 / 1024} MB`
		};
	}

	return { valid: true };
};



const fileManager = {
	uploadFile: uploadFile,
	updateFilePath,
	getFile: getFile,
	getFiles: getFiles,
	// fileAction: fileAction,
	returnValidFileObjAndInvalidFileIds,
	updateFilePaths,
	sendFile,
	streamFile,
	isValidFileExtensionAndSize,
	transformFileObj,
	moveToRecycleBin: moveToRecycleBin,
	deleteFile: deleteFile,
	deleteTemporaryFiles: deleteTemporaryFiles,
	uploadFileInternal,
	isValidFileSize,
	isValidExtension,
	isValidFileType,
	copyToLocation,

};
module.exports = fileManager;
