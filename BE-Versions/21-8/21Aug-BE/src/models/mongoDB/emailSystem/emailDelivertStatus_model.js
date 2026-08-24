const mongoose = require("mongoose");

const EmailDeliveryStatusSchema = new mongoose.Schema({
    to: [String],
    subject: String,
    htmlContent: String,
    cc: [String],
    attachments: Array,
    type: {
      type: String,
      enum: [
        'SETPOINT_LIMIT_BREACH',
        'LOG_REPORT',
        'PAUSE_LOG',
        'RESUME_LOG',
        'SPARE_MINIMUM_LIMIT_BREACH',
        'LOG_PACKING_PERFORMANCE_REPORT',
        'SPARE_REQUEST'
      ],
      required: true
    },
    originalData: Object,
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED'],
      default: 'PENDING'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    sentAt: Date,
    retryCount: {
      type: Number,
      default: 0
    },
    lastRetryAt: Date,
    errorMessage: String
  });

EmailDeliveryStatusSchema.index({type:1})
EmailDeliveryStatusSchema.index({status:1})
EmailDeliveryStatusSchema.index({type:1, status:1})



const EmailDeliveryStatus = mongoose.model(
  "EmailDeliveryStatus",
  EmailDeliveryStatusSchema,
  "emailDeliveryStatus"
);

module.exports = EmailDeliveryStatus;
