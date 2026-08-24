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


const constructSpareRequestTemplateData = async (receiverName, spareName, requestedQuantity, requestedBy, workOrderName, requestedDate, cc) => {
    try {
        const data = {
            receiverName, spareName, requestedQuantity, requestedBy, workOrderName, requestedDate, cc
        };
        return validateSpareRequestEmailTemplatedata(data);
    }
    catch (error) {
        throw ("Failed to construct Spare Request email template:", error);
    }
}

const sendSpareRequestEmail = async (to, subject, data) => {
    try {
        const templatePath = path.join(__dirname, "./", "spareRequestEmailTemplate.html");
        const templateStr = await fs.readFile(templatePath, "utf8");
        const template = Handlebars.compile(templateStr);
        const validatedSpareMinimumLimitBreachEmailTemplateData = await validateSpareRequestEmailTemplatedata(data);
        const emailHtml = template(validatedSpareMinimumLimitBreachEmailTemplateData);
        
        // Store email in MongoDB before sending
        const emailDeliveryRecord = await EmailDeliveryStatus.create({
            to: to,
            subject: subject,
            htmlContent: emailHtml,
            cc: data.cc || [],
            attachments: data.attachments || [],
            type: 'SPARE_REQUEST',
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

const validateSpareRequestEmailTemplatedata = async (data) => { 
    try {
        const { receiverName, spareName, requestedQuantity, requestedBy, workOrderName, requestedDate, cc} = data;
        // const constructedData = {};

        // validateString(receiverName, 'Receiver Name');
        // constructedData.receiverName = receiverName;
        
        // constructedData.spareRequest = spareRequest.map((request, index) => {
        //     const spareName = request.spare || request.spareName;
        //     const requestedQuantity = request.requestedQuantity ?? request.currentQuantity
        //     const requestedBy = request.requestedBy || request.thresholdQuantity;
        //     const workOrder = request.workOrder || request.thresholdQuantity;
        //     const requestedDate = request.requestedDate


        //     validateString(spareName, `Spare Name at index ${index}`);
        //     validateNumber(requestedQuantity, `Current Quantity at index ${index}`);
        //     validateString(requestedBy, `Requested By at index ${index}`);
        //     validateString(workOrder, `workOrder at index ${index}`);
        //     const validatedLastUpdated = validateDate(new Date(requestedDate).toISOString(), `Last Updated at index ${index}`);

        //     return {
        //         spareName: spareName,
        //         workOrder: workOrder,
        //         requestedQuantity: requestedQuantity,
        //         requestedBy: requestedBy,
        //         requestedDate: validatedLastUpdated
        //     };
        // });
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

    const constructedData = {};

        // Validate required string and number fields
        validateString(receiverName, 'Receiver Name');
        constructedData.receiverName = receiverName;

        validateString(spareName, 'Spare Name');
        constructedData.spareName = spareName;

        validateNumber(requestedQuantity, 'Requested Quantity');
        constructedData.requestedQuantity = requestedQuantity;

        validateString(requestedBy, 'Requested By');
        constructedData.requestedBy = requestedBy;

        validateString(workOrderName, 'Work Order Name');
        constructedData.workOrderName = workOrderName;

        const validatedRequestedDate = validateDate(new Date(requestedDate).toISOString(), 'Requested Date');
        constructedData.requestedDate = validatedRequestedDate;

        constructedData.cc = Array.isArray(cc) ? cc : [];

        return constructedData;

    } catch (error) {
        throw new Error(`Failed to validate spare request email template: ${error}`);
    }
};




module.exports = {
    sendSpareRequestEmail,
    constructSpareRequestTemplateData
};