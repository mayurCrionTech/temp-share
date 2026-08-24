const sgMail = require('@sendgrid/mail');
const EmailDeliveryStatus = require('../../models/mongoDB/emailSystem/emailDelivertStatus_model');
const logger = require('../logger');
const axios = require('axios');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "info@criontech.com";

const validateString = (value, fieldName) => {
    if (!value || typeof value !== 'string') {
        throw new Error(`${fieldName} must be a non-empty string`);
    }
};

const validateStringArray = (value, fieldName) => {
    if (!Array.isArray(value) || !value.every(item => typeof item === 'string')) {
        throw new Error(`${fieldName} must be an array of strings`);
    }
};

async function sendEmail(to, subject, html, options = {}) {
    try {
        // Validate required parameters
        validateStringArray(to, 'To');
        validateString(subject, 'Subject');

        // Prepare email message
        const msg = {
            to,
            subject,
            from: options.from || FROM_EMAIL
        };
        // Handle template-based emails
        if (options.cc) {
            validateStringArray(options.cc, 'CC');
            msg.cc = options.cc;
        }
        if (options.templateId) {
            validateString(options.templateId, 'Template ID');

            if (html) {
                throw new Error('Cannot provide HTML when using a template ID');
            }

            msg.templateId = options.templateId;

            if (options.dynamicTemplateData) {
                msg.dynamicTemplateData = options.dynamicTemplateData;
            }
        } else {
            validateString(html, 'HTML');
            msg.html = html;
        }

        // Handle optional parameters
        if (options.cc) {
            validateStringArray(options.cc, 'CC');
            msg.cc = options.cc;
        }

        if (options.bcc) {
            validateStringArray(options.bcc, 'BCC');
            msg.bcc = options.bcc;
        }

        // Handle attachments
        if (options.attachments?.length) {
            msg.attachments = options.attachments.map(attachment => ({
                content: attachment.content.toString('base64'),
                filename: attachment.filename,
                disposition: 'attachment'
            }));
        }

        // Validate 'from' email
        validateString(msg.from, 'From');

        // Set up SendGrid
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        // Send email
        const response = await sgMail.send(msg);
        return response;
    } catch (error) {
        console.error('Email sending error:', {
            message: error.message,
            stack: error.stack,
            sendGridDetails: error.response?.body
        });

        if (error.response) {
            const sendGridError = new Error('SendGrid Email Sending Failed');
            sendGridError.details = error.response.body;
            throw sendGridError;
        }

        throw error;
    }
}

const resendPendingEmails = async () => {
    try {
        const pendingEmails = await EmailDeliveryStatus.find({ status: 'PENDING'});
        logger.info({}, `Found ${pendingEmails.length} pending emails to send`);
        
        for (const email of pendingEmails) {
            try {
                // Rebuild attachments from file paths stored in DB
                const attachments = [];
                for (const att of (email.attachments || [])) {
                    if (att.filePath) {
                        try {
                            const content = require('fs').readFileSync(att.filePath);
                            attachments.push({ content, filename: att.filename });
                        } catch (fileErr) {
                            console.warn(`Attachment file not found: ${att.filePath}, skipping`);
                        }
                    } else if (att.content) {
                        attachments.push(att);
                    }
                }

                await sendEmail(
                    email.to, 
                    email.subject, 
                    email.htmlContent, 
                    { 
                        attachments,
                        cc: email.cc || [] 
                    }
                );
                
                // Update status to sent
                await EmailDeliveryStatus.findByIdAndUpdate(email._id, {
                    status: 'SENT',
                    sentAt: new Date(),
                    retryCount: email.retryCount + 1,
                    lastRetryAt: new Date()
                });
                logger.info({}, `Successfully sent pending email ID: ${email._id}`);
            } catch (error) {
                logger.error(error, `Failed to send pending email ID: ${email._id}`);                
                // Update status to failed if retry limit reached, otherwise keep as pending
                const newStatus = email.retryCount >= 3 ? 'FAILED' : 'PENDING';
                
                await EmailDeliveryStatus.findByIdAndUpdate(email._id, {
                    status: newStatus,
                    retryCount: email.retryCount + 1,
                    lastRetryAt: new Date(),
                    errorMessage: error.message || String(error)
                });
            }
        }

        // Fetch updated statuses
        const updatedEmails = await EmailDeliveryStatus.find({ _id: { $in: pendingEmails.map(e => e._id) } });

        logger.info({ 
            success: true, 
            total: updatedEmails.length,
            sent: updatedEmails.filter(email => email.status === 'SENT').length,
            failed: updatedEmails.filter(email => email.status === 'FAILED').length,
            pending: updatedEmails.filter(email => email.status === 'PENDING').length
        }, `Resend pending emails summary`);
        
        return;
    } catch (error) {
        console.error("Error in resendPendingEmails:", error);
        return { success: false, error: error.message };
    }
};



async function checkSendGridStatus() {
    try {
        const response = await axios.get('https://api.sendgrid.com/v3/user/account', {
            headers: {
                'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
            }
        });

        // If the response is successful, it means the API is working
        console.log('SendGrid API is working:', response.status);
        return true;
    } catch (error) {
        // Handle any errors (invalid API key, quota issues, etc.)
        console.error('SendGrid API error:', error.response?.data || error.message);
        return false;
    }
}
async function testSendEmail() {
    try {
        const to = [process.env.FROM_EMAIL || "derin@criontech.com"]; // Sending to your own email
        const subject = "Test Email - SendGrid Check";
        const html = "<p>This is a test email to check SendGrid service availability.</p>";

        // You can add a specific "test" header if needed
        await sendEmail(to, subject, html, { from: process.env.FROM_EMAIL });

        console.log("SendGrid test email sent successfully.");
        return true;
    } catch (err) {
        console.error("SendGrid test email failed:", err.message, err.details || '');
        return false;
    }
}
async function checkAndResendPendingEmails() {
    // const isSendGridWorking = await checkSendGridStatus();
    const isSendGridWorking = await testSendEmail();

    if (isSendGridWorking) {
        console.log("SendGrid is up. Calling resendPendingEmails...");
        await resendPendingEmails();
    } else {
        console.error("Skipping resendPendingEmails because SendGrid API is down or unauthorized.");
    }
}

module.exports = {
    sendEmail,
    checkAndResendPendingEmails
};


// const sgMail = require('@sendgrid/mail');
// const EmailDeliveryStatus = require('../../models/mongoDB/emailSystem/emailDelivertStatus_model');
// const logger = require('../logger');
// const axios = require('axios');

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const FROM_EMAIL = process.env.FROM_EMAIL || "info@criontech.com";

// const validateString = (value, fieldName) => {
//     if (!value || typeof value !== 'string') {
//         throw new Error(`${fieldName} must be a non-empty string`);
//     }
// };

// const validateStringArray = (value, fieldName) => {
//     if (!Array.isArray(value) || !value.every(item => typeof item === 'string')) {
//         throw new Error(`${fieldName} must be an array of strings`);
//     }
// };

// async function sendEmail(to, subject, html, options = {}) {
//     try {
//         // Validate required parameters
//         validateStringArray(to, 'To');
//         validateString(subject, 'Subject');

//         // Prepare email message
//         const msg = {
//             to,
//             subject,
//             from: options.from || FROM_EMAIL
//         };
//         // Handle template-based emails
//         if (options.cc) {
//             validateStringArray(options.cc, 'CC');
//             msg.cc = options.cc;
//         }
//         if (options.templateId) {
//             validateString(options.templateId, 'Template ID');

//             if (html) {
//                 throw new Error('Cannot provide HTML when using a template ID');
//             }

//             msg.templateId = options.templateId;

//             if (options.dynamicTemplateData) {
//                 msg.dynamicTemplateData = options.dynamicTemplateData;
//             }
//         } else {
//             validateString(html, 'HTML');
//             msg.html = html;
//         }

//         // Handle optional parameters
//         if (options.cc) {
//             validateStringArray(options.cc, 'CC');
//             msg.cc = options.cc;
//         }

//         if (options.bcc) {
//             validateStringArray(options.bcc, 'BCC');
//             msg.bcc = options.bcc;
//         }

//         // Handle attachments
//         if (options.attachments?.length) {
//             msg.attachments = options.attachments.map(attachment => ({
//                 content: attachment.content.toString('base64'),
//                 filename: attachment.filename,
//                 disposition: 'attachment'
//             }));
//         }

//         // Validate 'from' email
//         validateString(msg.from, 'From');

//         // Set up SendGrid
//         sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//         // Send email
//         const response = await sgMail.send(msg);
//         return response;
//     } catch (error) {
//         console.error('Email sending error:', {
//             message: error.message,
//             stack: error.stack,
//             sendGridDetails: error.response?.body
//         });

//         if (error.response) {
//             const sendGridError = new Error('SendGrid Email Sending Failed');
//             sendGridError.details = error.response.body;
//             throw sendGridError;
//         }

//         throw error;
//     }
// }

// const resendPendingEmails = async () => {
//     try {
//         // Find all pending emails
//         const pendingEmails = await EmailDeliveryStatus.find({ status: 'PENDING'});
//         logger.info({}, `Found ${pendingEmails.length} pending emails to send`);
        
//         for (const email of pendingEmails) {
//             try {
//                 // Try to send the email
//                 await sendEmail(
//                     email.to, 
//                     email.subject, 
//                     email.htmlContent, 
//                     { 
//                         attachments: email.attachments || [], 
//                         cc: email.cc || [] 
//                     }
//                 );
                
//                 // Update status to sent
//                 await EmailDeliveryStatus.findByIdAndUpdate(email._id, {
//                     status: 'SENT',
//                     sentAt: new Date(),
//                     retryCount: email.retryCount + 1,
//                     lastRetryAt: new Date()
//                 });
//                 logger.info({}, `Successfully sent pending email ID: ${email._id}`);
//             } catch (error) {
//                 logger.error(error, `Failed to send pending email ID: ${email._id}`);                
//                 // Update status to failed if retry limit reached, otherwise keep as pending
//                 const newStatus = email.retryCount >= 3 ? 'FAILED' : 'PENDING';
                
//                 await EmailDeliveryStatus.findByIdAndUpdate(email._id, {
//                     status: newStatus,
//                     retryCount: email.retryCount + 1,
//                     lastRetryAt: new Date(),
//                     errorMessage: error.message || String(error)
//                 });
//             }
//         }

//         // Fetch updated statuses
//         const updatedEmails = await EmailDeliveryStatus.find({ _id: { $in: pendingEmails.map(e => e._id) } });

//         logger.info({ 
//             success: true, 
//             total: updatedEmails.length,
//             sent: updatedEmails.filter(email => email.status === 'SENT').length,
//             failed: updatedEmails.filter(email => email.status === 'FAILED').length,
//             pending: updatedEmails.filter(email => email.status === 'PENDING').length
//         }, `Resend pending emails summary`);
        
//         return;
//     } catch (error) {
//         console.error("Error in resendPendingEmails:", error);
//         return { success: false, error: error.message };
//     }
// };



// async function checkSendGridStatus() {
//     try {
//         const response = await axios.get('https://api.sendgrid.com/v3/user/account', {
//             headers: {
//                 'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
//             }
//         });

//         // If the response is successful, it means the API is working
//         console.log('SendGrid API is working:', response.status);
//         return true;
//     } catch (error) {
//         // Handle any errors (invalid API key, quota issues, etc.)
//         console.error('SendGrid API error:', error.response?.data || error.message);
//         return false;
//     }
// }
// async function testSendEmail() {
//     try {
//         const to = [process.env.FROM_EMAIL || "derin@criontech.com"]; // Sending to your own email
//         const subject = "Test Email - SendGrid Check";
//         const html = "<p>This is a test email to check SendGrid service availability.</p>";

//         // You can add a specific "test" header if needed
//         await sendEmail(to, subject, html, { from: process.env.FROM_EMAIL });

//         console.log("SendGrid test email sent successfully.");
//         return true;
//     } catch (err) {
//         console.error("SendGrid test email failed:", err.message, err.details || '');
//         return false;
//     }
// }
// async function checkAndResendPendingEmails() {
//     // const isSendGridWorking = await checkSendGridStatus();
//     const isSendGridWorking = await testSendEmail();

//     if (isSendGridWorking) {
//         console.log("SendGrid is up. Calling resendPendingEmails...");
//         await resendPendingEmails();
//     } else {
//         console.error("Skipping resendPendingEmails because SendGrid API is down or unauthorized.");
//     }
// }

// module.exports = {
//     sendEmail,
//     checkAndResendPendingEmails
// };