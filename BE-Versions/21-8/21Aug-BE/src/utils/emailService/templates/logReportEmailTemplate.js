const { sendEmail } = require('../emailService');
const Handlebars = require('handlebars');
const path = require('path');
const EmailDeliveryStatus = require('../../../models/mongoDB/emailSystem/emailDelivertStatus_model');
const fs = require('fs').promises;

Handlebars.registerHelper("formatDate", (dateString) => {
    const date = new Date(dateString);
    const convertedDate =  date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: 'Asia/Kolkata'
    });
 return `${convertedDate} IST`;
});
Handlebars.registerHelper('round', function (value, decimals) {
    return Number(value).toFixed(decimals);
});

Handlebars.registerHelper('formatTime', function(minutes) {
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        let remainingMinutes = Math.floor(minutes % 60);
        let seconds = Math.round((minutes % 1) * 60); // Round seconds to the nearest whole number

        // Handle rounding if seconds exceed 60
        if (seconds === 60) {
            seconds = 0;
            remainingMinutes += 1;
        }

        return `${hours}h ${remainingMinutes}m ${seconds}s`;
    }

    let remainingMinutes = Math.floor(minutes);
    let seconds = Math.round((minutes % 1) * 60); // Round seconds to the nearest whole number

    return `${remainingMinutes}m ${seconds}s`;
});



const sendLogReportEmail = async (to, subject, data) => {
    try {
        const templatePath = path.join(__dirname, "./", "logReportEmailTemplate.html");
        const templateStr = await fs.readFile(templatePath, "utf8");
        const template = Handlebars.compile(templateStr);
        const validatedLogReportTemplateData = await validateLogReportEmailTemplatedata(data);
        const emailHtml = template(validatedLogReportTemplateData);
        
        // Store only file paths (not raw Buffers) in MongoDB to avoid
        // BSON 16MB limit. The actual content is read from disk when sending.
        const attachmentRefs = (data.attachments || []).map(a => ({
            filename: a.filename,
            filePath: a.filePath || null,
        }));

        const emailDeliveryRecord = await EmailDeliveryStatus.create({
            to: to,
            subject: subject,
            htmlContent: emailHtml,
            cc: data.cc || [],
            attachments: attachmentRefs,
            type: 'LOG_REPORT',
            status: 'PENDING'
        });
        
        try {
            await sendEmail(to, subject, emailHtml, { 
                attachments: data.attachments || [], 
                cc: data.cc || [] 
            });
            
            await EmailDeliveryStatus.findByIdAndUpdate(emailDeliveryRecord._id, {
                status: 'SENT',
                sentAt: new Date()
            });
        } catch (sendError) {
            console.log("Email sending failed, saved to database for later sending:", sendError);
            await EmailDeliveryStatus.findByIdAndUpdate(emailDeliveryRecord._id, {
                errorMessage: sendError.message || String(sendError)
            });
        }
    } catch (error) {
        console.error("Failed to prepare or store log report email:", error);
        throw ("Failed to send or store log report email:", error);
    }
};

const validateString = (value, fieldName) => {
    if (!value || typeof value !== 'string') {
        throw (`${fieldName} must be a non-empty string`);
    }
};

const validateDate = (value, fieldName) => {
    if (!value) {
        throw new Error(`${fieldName} is required and cannot be null or undefined.`);
    }

    // Handle ISO date string
    if (typeof value === 'string') {
        if (!Date.parse(value)) {
            throw new Error(`${fieldName} must be a valid date string in the format YYYY-MM-DDTHH:MM:SS`);
        }
        return new Date(value).toISOString(); // Normalize to ISO string
    }

    // Handle DateTime-like objects
    if (typeof value === 'object' && 'ts' in value && 'zone' in value) {
        return new Date(value.ts).toISOString(); // Extract timestamp and normalize
    }

    throw new Error(`${fieldName} must be a valid ISO date string or a DateTime object.`);
};

const validateLogReportEmailTemplatedata = async (data) => { 
    let { receiverOrGroupName, reportType, logName, reportPeriod, generationDate, overDueLogEntries, thresholdLimits, performanceMetricsTimersData, attachments } = data;
   
    try {
        const constructedData = {}

        validateString(receiverOrGroupName, 'Receiver Or GroupName');
        constructedData.receiverOrGroupName = receiverOrGroupName;

        validateString(reportType, 'Report Type');
        constructedData.reportType = reportType;

        validateString(logName, 'Log Name');
        constructedData.logName = logName;

        if (reportPeriod && reportPeriod.start && reportPeriod.end) { 
            reportPeriod.start = validateDate(reportPeriod.start, 'Report Period Start Date');
            reportPeriod.end = validateDate(reportPeriod.end, 'Report Period End Date');
            constructedData.reportPeriod = {
                start: reportPeriod.start,
                end: reportPeriod.end
            };
        }
        else {
            throw ('reportPeriod must be an object with start and end properties');
        }
        validateDate(generationDate, "Generation Date");
        constructedData.generationDate = generationDate;

        if (overDueLogEntries?.length > 0) {
            constructedData.hasOverdueEntries = true;
            constructedData.overDueLogEntries = overDueLogEntries;
        }
        if (thresholdLimits?.length > 0) {
            constructedData.hasThresholdViolations = true;
            constructedData.thresholdLimits = thresholdLimits;
        }
        if (performanceMetricsTimersData) {
            constructedData.hasPerformanceMetricsTimersData = true;
            constructedData.performanceMetricsTimersData = performanceMetricsTimersData;
        }
        if (attachments?.length > 0) {

            constructedData.attachments = attachments.map(attachment => {
                validateString(attachment.filename, 'Attachment Filename');
                if (!attachment.content) {
                    throw new Error(`Missing content for attachment for the file ${attachment.filename} and index ${attachment.index}`);
                }
                if (!Buffer.from(attachment.content, 'base64').toString('ascii')) {
                    throw new Error(`Invalid base64 content for attachment for the file ${attachment.filename} and index ${attachment.index}`);
                }

                return {
                    filename: attachment.filename,
                    content: attachment.content
                };
            });
        }
        console.log("constructedData", constructedData)
return constructedData;
    } catch (error) {
        throw ("Failed on validate log report email template:", error);
    }
};

const constructLogReportTemplateData = async (receiverOrGroupName, reportType, logName, reportPeriod, generationDate, overDueLogEntries, thresholdLimits, performanceMetricsTimersData, attachments) => {
    try {
        const constructedData = {
            receiverOrGroupName,
            reportType,
            logName,
            reportPeriod,
            generationDate,
            overDueLogEntries,
            thresholdLimits,
            performanceMetricsTimersData,
            attachments
        };
        return validateLogReportEmailTemplatedata(constructedData); // Return the constructedData;
    } catch (error) {
        throw ("Failed to construct log report email template:", error);
    }
}

const constructPackingReportTemplateData = async (
    receiverOrGroupName, 
    reportType, 
    logName, 
    reportPeriod, 
    generationDate, 
    attachments
) => {
    try {
        const constructedData = {
            receiverOrGroupName,
            reportType,
            logName,
            reportPeriod,
            generationDate,
            attachments
        };
        return validatePackingReportEmailTemplateData(constructedData);
    } catch (error) {
        throw new Error("Failed to construct packing report email template: " + error);
    }
}

const validatePackingReportEmailTemplateData = async (data) => { 
    let { 
        receiverOrGroupName, 
        reportType, 
        logName, 
        reportPeriod, 
        generationDate, 
        attachments 
    } = data;
   
    try {
        const constructedData = {};
       
        validateString(receiverOrGroupName, 'Receiver Or GroupName');
        constructedData.receiverOrGroupName = receiverOrGroupName;
        
        validateString(reportType, 'Report Type');
        constructedData.reportType = reportType;
        
        validateString(logName, 'Log Name');
        constructedData.logName = logName;
       
        if (reportPeriod && reportPeriod.start && reportPeriod.end) { 
            reportPeriod.start = validateDate(reportPeriod.start, 'Report Period Start Date');
            reportPeriod.end = validateDate(reportPeriod.end, 'Report Period End Date');
            constructedData.reportPeriod = {
                start: reportPeriod.start,
                end: reportPeriod.end
            };
          
        } else {
            throw new Error('reportPeriod must be an object with start and end properties');
        }
         
        validateDate(generationDate, "Generation Date");
        constructedData.generationDate = generationDate;
        
        if (attachments?.length > 0) {
            constructedData.attachments = attachments.map(attachment => {
                validateString(attachment.filename, 'Attachment Filename');
                if (!attachment.content) {
                    throw new Error(`Missing content for attachment for the file ${attachment.filename}`);
                }
                return {
                    filename: attachment.filename,
                    content: attachment.content
                };
            });
        }
        
        console.log("constructedData", constructedData);
        return constructedData;
    } catch (error) {
        throw new Error("Failed on validate packing report email template: " + error);
    }
};

const sendPackingReportEmail = async (to, subject, data) => {
    try {
        const templatePath = path.join(__dirname, "./", "logPackingReportEmailTemplate.html");
        const templateStr = await fs.readFile(templatePath, "utf8");
        const template = Handlebars.compile(templateStr);
        const validatedLogPackingReportReportTemplateData = await validatePackingReportEmailTemplateData(data);
        const emailHtml = template(validatedLogPackingReportReportTemplateData);
        
        const attachmentRefs = (data.attachments || []).map(a => ({
            filename: a.filename,
            filePath: a.filePath || null,
        }));

        const emailDeliveryRecord = await EmailDeliveryStatus.create({
            to: to,
            subject: subject,
            htmlContent: emailHtml,
            cc: data.cc || [],
            attachments: attachmentRefs,
            type: 'LOG_PACKING_PERFORMANCE_REPORT',
            status: 'PENDING'
        });
        
        try {
            await sendEmail(to, subject, emailHtml, { 
                attachments: data.attachments || [], 
                cc: data.cc || [] 
            });
            
            await EmailDeliveryStatus.findByIdAndUpdate(emailDeliveryRecord._id, {
                status: 'SENT',
                sentAt: new Date()
            });
        } catch (sendError) {
            console.log("Email sending failed, saved to database for later sending:", sendError);
            await EmailDeliveryStatus.findByIdAndUpdate(emailDeliveryRecord._id, {
                errorMessage: sendError.message || String(sendError)
            });
        }
    } catch (error) {
        console.error("Failed to prepare or store log report email:", error);
        throw ("Failed to send or store log report email:", error);
    }
};

module.exports = {
    sendLogReportEmail,
    constructLogReportTemplateData,
    constructPackingReportTemplateData,
    sendPackingReportEmail
};


// const { sendEmail } = require('../emailService');
// const Handlebars = require('handlebars');
// const path = require('path');
// const EmailDeliveryStatus = require('../../../models/mongoDB/emailSystem/emailDelivertStatus_model');
// const fs = require('fs').promises;

// Handlebars.registerHelper("formatDate", (dateString) => {
//     const date = new Date(dateString);
//     const convertedDate =  date.toLocaleString("en-GB", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: false,
//         timeZone: 'Asia/Kolkata'
//     });
//  return `${convertedDate} IST`;
// });
// Handlebars.registerHelper('round', function (value, decimals) {
//     return Number(value).toFixed(decimals);
// });

// Handlebars.registerHelper('formatTime', function(minutes) {
//     if (minutes >= 60) {
//         const hours = Math.floor(minutes / 60);
//         let remainingMinutes = Math.floor(minutes % 60);
//         let seconds = Math.round((minutes % 1) * 60); // Round seconds to the nearest whole number

//         // Handle rounding if seconds exceed 60
//         if (seconds === 60) {
//             seconds = 0;
//             remainingMinutes += 1;
//         }

//         return `${hours}h ${remainingMinutes}m ${seconds}s`;
//     }

//     let remainingMinutes = Math.floor(minutes);
//     let seconds = Math.round((minutes % 1) * 60); // Round seconds to the nearest whole number

//     return `${remainingMinutes}m ${seconds}s`;
// });



// const sendLogReportEmail = async (to, subject, data) => {
//     try {
//         const templatePath = path.join(__dirname, "./", "logReportEmailTemplate.html");
//         const templateStr = await fs.readFile(templatePath, "utf8");
//         const template = Handlebars.compile(templateStr);
//         const validatedLogReportTemplateData = await validateLogReportEmailTemplatedata(data);
//         const emailHtml = template(validatedLogReportTemplateData);
        
//         // Store email in MongoDB before sending
//         const emailDeliveryRecord = await EmailDeliveryStatus.create({
//             to: to,
//             subject: subject,
//             htmlContent: emailHtml,
//             cc: data.cc || [],
//             attachments: data.attachments || [],
//             type: 'LOG_REPORT',
//             originalData: validatedLogReportTemplateData,
//             status: 'PENDING'
//         });
        
//         try {
//             // Try to send the email
//             await sendEmail(to, subject, emailHtml, { 
//                 attachments: data.attachments || [], 
//                 cc: data.cc || [] 
//             });
            
//             // Update email status to sent if successful
//             await EmailDeliveryStatus.findByIdAndUpdate(emailDeliveryRecord._id, {
//                 status: 'SENT',
//                 sentAt: new Date()
//             });
//         } catch (sendError) {
//             console.log("Email sending failed, saved to database for later sending:", sendError);
//             // Update with error message
//             await EmailDeliveryStatus.findByIdAndUpdate(emailDeliveryRecord._id, {
//                 errorMessage: sendError.message || String(sendError)
//             });
//         }
//     } catch (error) {
//         console.error("Failed to prepare or store log report email:", error);
//         throw ("Failed to send or store log report email:", error);
//     }
// };

// const validateString = (value, fieldName) => {
//     if (!value || typeof value !== 'string') {
//         throw (`${fieldName} must be a non-empty string`);
//     }
// };

// const validateDate = (value, fieldName) => {
//     if (!value) {
//         throw new Error(`${fieldName} is required and cannot be null or undefined.`);
//     }

//     // Handle ISO date string
//     if (typeof value === 'string') {
//         if (!Date.parse(value)) {
//             throw new Error(`${fieldName} must be a valid date string in the format YYYY-MM-DDTHH:MM:SS`);
//         }
//         return new Date(value).toISOString(); // Normalize to ISO string
//     }

//     // Handle DateTime-like objects
//     if (typeof value === 'object' && 'ts' in value && 'zone' in value) {
//         return new Date(value.ts).toISOString(); // Extract timestamp and normalize
//     }

//     throw new Error(`${fieldName} must be a valid ISO date string or a DateTime object.`);
// };

// const validateLogReportEmailTemplatedata = async (data) => { 
//     let { receiverOrGroupName, reportType, logName, reportPeriod, generationDate, overDueLogEntries, thresholdLimits, performanceMetricsTimersData, attachments } = data;
   
//     try {
//         const constructedData = {}

//         validateString(receiverOrGroupName, 'Receiver Or GroupName');
//         constructedData.receiverOrGroupName = receiverOrGroupName;

//         validateString(reportType, 'Report Type');
//         constructedData.reportType = reportType;

//         validateString(logName, 'Log Name');
//         constructedData.logName = logName;

//         if (reportPeriod && reportPeriod.start && reportPeriod.end) { 
//             reportPeriod.start = validateDate(reportPeriod.start, 'Report Period Start Date');
//             reportPeriod.end = validateDate(reportPeriod.end, 'Report Period End Date');
//             constructedData.reportPeriod = {
//                 start: reportPeriod.start,
//                 end: reportPeriod.end
//             };
//         }
//         else {
//             throw ('reportPeriod must be an object with start and end properties');
//         }
//         validateDate(generationDate, "Generation Date");
//         constructedData.generationDate = generationDate;

//         if (overDueLogEntries?.length > 0) {
//             constructedData.hasOverdueEntries = true;
//             constructedData.overDueLogEntries = overDueLogEntries;
//         }
//         if (thresholdLimits?.length > 0) {
//             constructedData.hasThresholdViolations = true;
//             constructedData.thresholdLimits = thresholdLimits;
//         }
//         if (performanceMetricsTimersData) {
//             constructedData.hasPerformanceMetricsTimersData = true;
//             constructedData.performanceMetricsTimersData = performanceMetricsTimersData;
//         }
//         if (attachments?.length > 0) {

//             constructedData.attachments = attachments.map(attachment => {
//                 validateString(attachment.filename, 'Attachment Filename');
//                 if (!attachment.content) {
//                     throw new Error(`Missing content for attachment for the file ${attachment.filename} and index ${attachment.index}`);
//                 }
//                 if (!Buffer.from(attachment.content, 'base64').toString('ascii')) {
//                     throw new Error(`Invalid base64 content for attachment for the file ${attachment.filename} and index ${attachment.index}`);
//                 }

//                 return {
//                     filename: attachment.filename,
//                     content: attachment.content
//                 };
//             });
//         }
//         console.log("constructedData", constructedData)
// return constructedData;
//     } catch (error) {
//         throw ("Failed on validate log report email template:", error);
//     }
// };

// const constructLogReportTemplateData = async (receiverOrGroupName, reportType, logName, reportPeriod, generationDate, overDueLogEntries, thresholdLimits, performanceMetricsTimersData, attachments) => {
//     try {
//         const constructedData = {
//             receiverOrGroupName,
//             reportType,
//             logName,
//             reportPeriod,
//             generationDate,
//             overDueLogEntries,
//             thresholdLimits,
//             performanceMetricsTimersData,
//             attachments
//         };
//         return validateLogReportEmailTemplatedata(constructedData); // Return the constructedData;
//     } catch (error) {
//         throw ("Failed to construct log report email template:", error);
//     }
// }

// const constructPackingReportTemplateData = async (
//     receiverOrGroupName, 
//     reportType, 
//     logName, 
//     reportPeriod, 
//     generationDate, 
//     attachments
// ) => {
//     try {
//         const constructedData = {
//             receiverOrGroupName,
//             reportType,
//             logName,
//             reportPeriod,
//             generationDate,
//             attachments
//         };
//         return validatePackingReportEmailTemplateData(constructedData);
//     } catch (error) {
//         throw new Error("Failed to construct packing report email template: " + error);
//     }
// }

// const validatePackingReportEmailTemplateData = async (data) => { 
//     let { 
//         receiverOrGroupName, 
//         reportType, 
//         logName, 
//         reportPeriod, 
//         generationDate, 
//         attachments 
//     } = data;
   
//     try {
//         const constructedData = {};
       
//         validateString(receiverOrGroupName, 'Receiver Or GroupName');
//         constructedData.receiverOrGroupName = receiverOrGroupName;
        
//         validateString(reportType, 'Report Type');
//         constructedData.reportType = reportType;
        
//         validateString(logName, 'Log Name');
//         constructedData.logName = logName;
       
//         if (reportPeriod && reportPeriod.start && reportPeriod.end) { 
//             reportPeriod.start = validateDate(reportPeriod.start, 'Report Period Start Date');
//             reportPeriod.end = validateDate(reportPeriod.end, 'Report Period End Date');
//             constructedData.reportPeriod = {
//                 start: reportPeriod.start,
//                 end: reportPeriod.end
//             };
          
//         } else {
//             throw new Error('reportPeriod must be an object with start and end properties');
//         }
         
//         validateDate(generationDate, "Generation Date");
//         constructedData.generationDate = generationDate;
        
//         if (attachments?.length > 0) {
//             constructedData.attachments = attachments.map(attachment => {
//                 validateString(attachment.filename, 'Attachment Filename');
//                 if (!attachment.content) {
//                     throw new Error(`Missing content for attachment for the file ${attachment.filename}`);
//                 }
//                 return {
//                     filename: attachment.filename,
//                     content: attachment.content
//                 };
//             });
//         }
        
//         console.log("constructedData", constructedData);
//         return constructedData;
//     } catch (error) {
//         throw new Error("Failed on validate packing report email template: " + error);
//     }
// };

// const sendPackingReportEmail = async (to, subject, data) => {
//     try {
//         const templatePath = path.join(__dirname, "./", "logPackingReportEmailTemplate.html");
//         const templateStr = await fs.readFile(templatePath, "utf8");
//         const template = Handlebars.compile(templateStr);
//         const validatedLogPackingReportReportTemplateData = await validatePackingReportEmailTemplateData(data);
//         const emailHtml = template(validatedLogPackingReportReportTemplateData);
        
//         // Store email in MongoDB before sending
//         const emailDeliveryRecord = await EmailDeliveryStatus.create({
//             to: to,
//             subject: subject,
//             htmlContent: emailHtml,
//             cc: data.cc || [],
//             attachments: data.attachments || [],
//             type: 'LOG_PACKING_PERFORMANCE_REPORT',
//             originalData: validatedLogPackingReportReportTemplateData,
//             status: 'PENDING'
//         });
        
//         try {
//             // Try to send the email
//             await sendEmail(to, subject, emailHtml, { 
//                 attachments: data.attachments || [], 
//                 cc: data.cc || [] 
//             });
            
//             // Update email status to sent if successful
//             await EmailDeliveryStatus.findByIdAndUpdate(emailDeliveryRecord._id, {
//                 status: 'SENT',
//                 sentAt: new Date()
//             });
//         } catch (sendError) {
//             console.log("Email sending failed, saved to database for later sending:", sendError);
//             // Update with error message
//             await EmailDeliveryStatus.findByIdAndUpdate(emailDeliveryRecord._id, {
//                 errorMessage: sendError.message || String(sendError)
//             });
//         }
//     } catch (error) {
//         console.error("Failed to prepare or store log report email:", error);
//         throw ("Failed to send or store log report email:", error);
//     }
// };

// module.exports = {
//     sendLogReportEmail,
//     constructLogReportTemplateData,
//     constructPackingReportTemplateData,
//     sendPackingReportEmail
// };