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


const validateString = (value, fieldName) => {
    if (!value || typeof value !== 'string') {
        throw (`${fieldName} must be a non-empty string`);
    }
};

const validateNumber = (value, fieldName) => {
    if (!value || typeof value!== 'number' || isNaN(value)) {
        throw (`${fieldName} must be a valid number`);
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


const constructPauseLogTemplateData = async (receiverName, logName, pausedBy, pausedTime, statusVerb,cc, reason) => {
    try {
        const data = {
            receiverName, logName, pausedBy, pausedTime, statusVerb, cc, reason
        };
        return validatePauseLogEmailTemplatedata(data);
    }
    catch (error) {
        throw ("Failed to construct log pause email template:", error);
    }
}

const sendPauseLogEmail = async (to, subject, data) => {
    try {
        const templatePath = path.join(__dirname, "./", "pauseLogEmailTemplate.html");
        const templateStr = await fs.readFile(templatePath, "utf8");
        const template = Handlebars.compile(templateStr);
        const validatedPauseLogEmailTemplateData = await validatePauseLogEmailTemplatedata(data);
        const emailHtml = template(validatedPauseLogEmailTemplateData);
        
        // Store email in MongoDB before sending
        const emailDeliveryRecord = await EmailDeliveryStatus.create({
            to: to,
            subject: subject,
            htmlContent: emailHtml,
            cc: data.cc || [],
            attachments: data.attachments || [],
            type: 'PAUSE_LOG',
            originalData: validatedPauseLogEmailTemplateData,
            status: 'PENDING'
        });
        
        try {
            // Try to send the email
            await sendEmail(to, subject, emailHtml, { 
                attachments: data.attachments || [], 
                cc: data.cc || [] 
            });
            
            // Update email status to sent if successful
            await EmailDeliveryStatus.findByIdAndUpdate(emailDeliveryRecord._id, {
                status: 'SENT',
                sentAt: new Date()
            });
        } catch (sendError) {
            console.log("Email sending failed, saved to database for later sending:", sendError);
            // Update with error message
            await EmailDeliveryStatus.findByIdAndUpdate(emailDeliveryRecord._id, {
                errorMessage: sendError.message || String(sendError)
            });
        }
    } catch (error) {
        console.error("Failed to prepare or store pause log email:", error);
        throw ("Failed to send or store pause log email:", error);
    }
}

const validatePauseLogEmailTemplatedata = async (data) => { 
    try {
        let { receiverName, logName, pausedBy, pausedTime,statusVerb, cc, reason} = data;
        const constructedData = {};

        validateString(receiverName, 'Receiver Name');
        constructedData.receiverName = receiverName;
           

        validateString(logName, `Log Name`);
        constructedData.logName = logName;

        validateString(pausedBy, `Paused By`);
        constructedData.pausedBy = pausedBy;

        validateString(reason, `Reason`);
        constructedData.reason = reason;
        
        pausedTime = validateDate(pausedTime, `Paused Time`);
        constructedData.pausedTime = pausedTime;

        // if (attachments?.length > 0) {
        //     constructedData.attachments = attachments.map((attachment, index) => {
        //         validateString(attachment.filename, `Attachment Filename at index ${index}`);
        //         if (!attachment.content) {
        //             throw new Error(`Missing content for attachment ${attachment.filename} at index ${index}`);
        //         }
        //         if (!Buffer.from(attachment.content, 'base64').toString('ascii')) {
        //             throw new Error(`Invalid base64 content for attachment ${attachment.filename} at index ${index}`);
        //         }
        //         return {
        //             filename: attachment.filename,
        //             content: attachment.content
        //         };
        //     });
        // }
        constructedData.statusVerb = statusVerb
        constructedData.cc = cc || [];

        return constructedData;
    } catch (error) {
        throw new Error(`Failed to validate log pause email template: ${error}`);
    }
};




module.exports = {
    sendPauseLogEmail,
    constructPauseLogTemplateData
};