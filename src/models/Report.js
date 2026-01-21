const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportName: {
        type: String,
        required: true,
        trim: true
    },
    reportType: {
        type: String,
        required: true,
        enum: ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Other'],
        default: 'Other'
    },
    reportDate: {
        type: Date,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    extractedText: {
        type: String, // Raw extracted text
        select: false // Don't fetch by default to save bandwidth
    },
    analyzedData: {
        type: mongoose.Schema.Types.Mixed, // The JSON object returned by OpenAI
        required: true
    },
    doctorReview: {
        status: {
            type: String,
            enum: ['pending', 'requested', 'reviewed'],
            default: 'pending'
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedDate: {
            type: Date
        },
        notes: {
            type: String
        }
    },
    isAbnormal: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
