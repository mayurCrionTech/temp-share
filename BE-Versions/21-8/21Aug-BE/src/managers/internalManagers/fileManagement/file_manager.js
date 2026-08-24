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
const File = require("../../../models/mongoDB/fileManagement/file_model");
const Model = File;
const { mongoDbManager } = require("../../dBManagers");



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


async function uploadFile(file, name, moduleName, moduleId, userId) {
	try {

		if (!file) throw new Error("File not provided");

		if (!moduleName && moduleId) throw new Error("Both moduleName and moduleId must be provided together");

		if (!userId) throw new Error("User id not provided");

		let fileName = name ? `${name}.${file.originalname.split(".").pop()}` : file.originalname;
		const now = new Date();

		const createdFile = new Model({
			name: fileName,
			extension: fileName.split(".").pop(),
			contentType: file.mimetype,
			size: file.size,
			storageLocation: {
				provider: storageProvider,
				path: file.path
			},
			moduleName: moduleName || null,
			moduleId: moduleId || null,
			createdAt: now,
			updatedAt: now,
			createdBy: userId,
			updatedBy: userId,
			metadata: {}
		});

		await createdFile.save();

		if (storageProvider === "azure") {
			const containerName = azureContainerName;
			const blobPath = getBlobPath(moduleName, moduleId, createdFile._id, fileName, file.path);
			await uploadToAzure(containerName, blobPath, file.path);
			createdFile.storageLocation.path = blobPath;
		} else {
			const directoryPath = await createDirectoryStructure(
				moduleName,
				moduleId,
				createdFile._id,
				fileName,
				file.path
			);
			createdFile.storageLocation.path = directoryPath;
		}

		await createdFile.save();
		return createdFile;
	} catch (err) {
		throw err;
	}
}

async function updateFilePath(fileObj, id, moduleName, moduleId, userId) {
	try {

		if (!moduleName && moduleId)
			throw new Error("Both moduleName and moduleId must be provided together");

		if (!fileObj)  {
			fileObj = await mongoDbManager.findOne(Model, { _id: id });
			if (!fileObj) throw new Error("File not found");
		} else if (!fileObj && !id) {
			throw new Error ("Id not provided") 
		}

		let storagePath = fileObj.storageLocation.path;

		if (fileObj.storageLocation.provider === "azure") {
			const newFilePath = getNewFilePath(moduleName, moduleId, fileObj._id, fileObj.name, storagePath);
			await updateAzurePath(fileObj, moduleName, moduleId, newFilePath, userId);
		} else if (fileObj.storageLocation.provider === "local") {
			const newFilePath = getNewFilePath(moduleName, moduleId, fileObj._id, userId);
			await updateLocalPath(fileObj, moduleName, moduleId, newFilePath);
		} else {
			throw new Error("Unsupported storage provider");
		}
		return;
	} catch (error) {
		throw error;
	}
}

async function getFile(id, action, req) {
	try {
		const file = await mongoDbManager.findOne(Model, { _id: id, isDeleted: false });

		if (file) {
			if (action == "internal") {
				return file;
			}

			if (action && req && req.protocol && req.get("host")) {
				const token = jwt.sign({ fileId: file._id }, authConfig.SECRET, { expiresIn: "1h" });
				const fileUrl =
					file.storageLocation.provider === "local"
						? `${req.protocol}://${req.get("host")}/api/v1/files/${
								file._id
						  }/actions/${action}?token=${token}`
						: await getAzureFileUrl(file);

				file.url = fileUrl;
				return {
					id: file._id,
					name: file.name,
					extension: file.extension,
					contentType: file.contentType,
					url: fileUrl,
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
		} else return null;
	} catch (err) {
		throw err;
	}
}

async function getFiles(ids, action, req) {
	try {
		let files = [];
		if (ids.length > 0) {
			files = await mongoDbManager.findMany(Model, { _id: { $in: ids }, isDeleted: false });
		} else {
			files = await mongoDbManager.findMany(Model, { isDeleted: false });
		}

		if (files.length > 0) {
			if (action == "internal") {
				return files;
			}

			const processedFiles = await Promise.all(
				files.map(async (file) => {
					if (action && (action == "stream" || action == "download" || action == "view") && req && req.protocol && req.get("host")) {
						const token = jwt.sign({ fileId: file._id }, authConfig.SECRET, { expiresIn: "1h" });
						const fileUrl =
							file.storageLocation.provider === "local"
								? `${req.protocol}://${req.get("host")}/api/v1/files/${file._id}/actions/${action}?token=${token}`
								: await getAzureFileUrl(file);

						return {
							id: file._id,
							name: file.name,
							extension: file.extension,
							contentType: file.contentType,
							url: fileUrl,
							moduleName: file.moduleName,
							moduleId: file.moduleId
						};
					} else {
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
				})
			);

			return processedFiles;
		} else {
			return [];
		}
	} catch (err) {
		throw err;
	}
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
async function moveToRecycleBin (fileObj, id, userId) {

	try {
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
		? `${moduleName}/${moduleId}/${fileId}/${fileName}`
		: moduleName
		? `${moduleName}/common/${fileId}/${fileName}`
		: `temp/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(
				now.getDate()
		  ).padStart(2, "0")}/${fileId}/${fileName}`;
};

const uploadToAzure = async (containerName, blobPath, localFilePath) => {
	const containerClient = blobServiceClient.getContainerClient(containerName);
	const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
	await blockBlobClient.uploadFile(localFilePath);
	fs.unlinkSync(localFilePath);
};

const createDirectoryStructure = (moduleName, moduleId, fileId, fileName, filePath) => {
	return new Promise((resolve, reject) => {
		let directoryPath;
		if (moduleName && moduleId) {
			directoryPath = `${fileStorageConfig.LOCAL_UPLOADS_DIRECTORY}/modules/${moduleName}/${moduleId}/${fileId}`;
		} else if (moduleName) {
			directoryPath = `${fileStorageConfig.LOCAL_UPLOADS_DIRECTORY}/modules/${moduleName}/common/${fileId}`;
		} else {
			const now = new Date();
			directoryPath = `${
				fileStorageConfig.LOCAL_UPLOADS_DIRECTORY
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

const getNewFilePath = (moduleName, moduleId, fileId, fileName) => {
	if (fileName) {
		return moduleName && moduleId
			? `modules/${moduleName}/${moduleId}/${fileId}/${fileName}`
			: `modules/${moduleName}/common/${fileId}/${fileName}`;
	} else {
		return moduleName && moduleId
			? `modules/${moduleName}/${moduleId}/${fileId}`
			: `modules/${moduleName}/common/${fileId}`;
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



const fileMiddleware = {
	uploadFile: uploadFile,
	updateFilePath,
	getFile: getFile,
	getFiles: getFiles,
	// fileAction: fileAction,
	moveToRecycleBin: moveToRecycleBin,
	deleteFile: deleteFile,
	deleteTemporaryFiles: deleteTemporaryFiles
};
module.exports = fileMiddleware;
