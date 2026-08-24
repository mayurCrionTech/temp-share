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

const sendLogSetpointLimitBreachEmail = async (to, subject, data) => {
    try {
        const templatePath = path.join(__dirname, "./", "logSetpointLimitBreachEmailTemplate.html");
        const templateStr = await fs.readFile(templatePath, "utf8");
        const template = Handlebars.compile(templateStr);
        const validatedLogSetpointLimitBreachEmailTemplateDataFormat = await validateLogSetpointLimitBreachEmailTemplatedata(data);
        const emailHtml = template(validatedLogSetpointLimitBreachEmailTemplateDataFormat);
        
        // Store email in MongoDB before sending
        const emailDeliveryRecord = await EmailDeliveryStatus.create({
            to: to,
            subject: subject,
            htmlContent: emailHtml,
            cc: data.cc || [],
            attachments: data.attachments || [],
            type: 'SETPOINT_LIMIT_BREACH',
            originalData: validatedLogSetpointLimitBreachEmailTemplateDataFormat,
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
        console.error("Failed to prepare or store email:", error);
        throw ("Failed to send or store setpoint limit breach email:", error);
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

const validateNumber = (value, fieldName) => {
    if (value === undefined || value === null || typeof value !== 'number' || isNaN(value)) {
        throw (`${fieldName} must be a valid number`);
    }
};

const validateLogSetpointLimitBreachEmailTemplatedata = async (data) => { 
    try {
        const { receiverName, setPointBreachedEntries, attachments, cc} = data;

        const constructedData = {};

        validateString(receiverName, 'Receiver Name');
        constructedData.receiverName = receiverName;

        if (!Array.isArray(setPointBreachedEntries) || setPointBreachedEntries.length === 0) {
            throw new Error('setPointBreachedEntries must be a non-empty array.');
        }

        constructedData.setPointBreachedEntries = setPointBreachedEntries.map((setPointBreachedEntry, index) => {
            const limitType = setPointBreachedEntry.limitType;
            const logName = setPointBreachedEntry.logName;
            const fieldName = setPointBreachedEntry.fieldName;
            const severity = setPointBreachedEntry.severity;
            const currentValue = setPointBreachedEntry.currentValue;
            const setpointLimit = setPointBreachedEntry.setpointLimit;
            const detectedBy = setPointBreachedEntry.detectedBy;
            let breachTime = setPointBreachedEntry.entryEnteredAt?.toISOString();
            if (!breachTime) {
            const currentDate = new Date();
            breachTime = currentDate.toISOString();
            }

            validateString(limitType, 'Limit Type');
            validateString(logName, 'Log Name');
            validateString(fieldName, 'Field Name');
            // validateString(severity, 'Severity');
            validateNumber(currentValue, 'Current Value');
            validateNumber(setpointLimit, 'Setpoint Limit');
            breachTime = validateDate(breachTime, 'Breach Time');
            validateString(detectedBy, 'Detected By');

            if (attachments?.length > 0) {
            constructedData.attachments = attachments.map(attachment => {
                validateString(attachment.filename, 'Attachment Filename');
                if (!attachment.content) {
                    throw (`Missing content for attachment for the file ${attachment.filename} and index ${attachment.index}`);
                }
                if (!Buffer.from(attachment.content, 'base64').toString('ascii')) {
                    throw (`Invalid base64 content for attachment for the file ${attachment.filename} and index ${attachment.index}`);
                }

                return {
                    filename: attachment.filename,
                    content: attachment.content
                };
            });
        }
            return {
                limitType: limitType,
                logName: logName,
                fieldName: fieldName,
                severity: severity,
                currentValue: currentValue,
                setpointLimit: setpointLimit,
                breachTime: breachTime,
                detectedBy: detectedBy
            };
        });
        if (attachments?.length > 0) {
            constructedData.attachments = attachments.map((attachment, index) => {
                validateString(attachment.filename, `Attachment Filename at index ${index}`);
                if (!attachment.content) {
                    throw new Error(`Missing content for attachment ${attachment.filename} at index ${index}`);
                }
                if (!Buffer.from(attachment.content, 'base64').toString('ascii')) {
                    throw new Error(`Invalid base64 content for attachment ${attachment.filename} at index ${index}`);
                }
                return {
                    filename: attachment.filename,
                    content: attachment.content
                };
            });
        }
        constructedData.attachments = attachments || [];
        constructedData.cc = cc || [];

        return constructedData;
    } catch (error) {
        throw new Error(`Failed to validate set point breach email template: ${error}`);
    }
};

const constructLogSetpointLimitBreachTemplateData = async (receiverName, setPointBreachedEntries, attachments, cc) => {
    try {
        const data = {
            receiverName, setPointBreachedEntries, attachments, cc
        };
        return validateLogSetpointLimitBreachEmailTemplatedata(data);
    }
    catch (error) {
        throw ("Failed to construct log setpoint breach email template:", error);
    }
}


module.exports = {
    sendLogSetpointLimitBreachEmail,
    constructLogSetpointLimitBreachTemplateData
};