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
    if (value === undefined || value === null || typeof value !== 'number' || isNaN(value)) {
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


const constructLogSpareMinimumThresholdTemplateData = async (receiverName, lowStockSpares, cc) => {
    try {
        const data = {
            receiverName, lowStockSpares, cc
        };
        return validateSpareMinimumLimitBreachEmailTemplatedata(data);
    }
    catch (error) {
        throw ("Failed to construct log setpoint breach email template:", error);
    }
}

const sendSpareMinimumLimitBreachEmail = async (to, subject, data) => {
    try {
        const templatePath = path.join(__dirname, "./", "spareMinimumThresholdEmailTemplate.html");
        const templateStr = await fs.readFile(templatePath, "utf8");
        const template = Handlebars.compile(templateStr);
        const validatedSpareMinimumLimitBreachEmailTemplateData = await validateSpareMinimumLimitBreachEmailTemplatedata(data);
        const emailHtml = template(validatedSpareMinimumLimitBreachEmailTemplateData);
        
        // Store email in MongoDB before sending
        const emailDeliveryRecord = await EmailDeliveryStatus.create({
            to: to,
            subject: subject,
            htmlContent: emailHtml,
            cc: data.cc || [],
            attachments: data.attachments || [],
            type: 'SPARE_MINIMUM_LIMIT_BREACH',
            originalData: validatedSpareMinimumLimitBreachEmailTemplateData,
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
        console.error("Failed to prepare or store spare minimum limit breach email:", error);
        throw ("Failed to send or store spare minimum limit breach email:", error);
    }
};

const validateSpareMinimumLimitBreachEmailTemplatedata = async (data) => { 
    try {
        const { receiverName, lowStockSpares, cc} = data;
        const constructedData = {};

        validateString(receiverName, 'Receiver Name');
        constructedData.receiverName = receiverName;

        if (!Array.isArray(lowStockSpares) || lowStockSpares.length === 0) {
            throw new Error('Low stock spares must be a non-empty array.');
        }
        
        constructedData.lowStockSpares = lowStockSpares.map((spare, index) => {
            const name = spare.name || spare.spareName;
            const quantity = spare.quantity ?? spare.currentQuantity
            const minimumRequirement = spare.minimumRequiredQuantity || spare.thresholdQuantity;

            validateString(name, `Spare Name at index ${index}`);
            validateNumber(quantity, `Current Quantity at index ${index}`);
            validateNumber(minimumRequirement, `Minimum Spare Quantity at index ${index}`);
            const validatedLastUpdated = validateDate(new Date().toISOString(), `Last Updated at index ${index}`);

            return {
                spareName: name,
                currentQuantity: quantity,
                thresholdQuantity: minimumRequirement,
                lastUpdated: validatedLastUpdated
            };
        });
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

        constructedData.cc = cc || [];

        return constructedData;
    } catch (error) {
        throw new Error(`Failed to validate spare minimum limit breach email template: ${error}`);
    }
};




module.exports = {
    sendSpareMinimumLimitBreachEmail,
    constructLogSpareMinimumThresholdTemplateData
};