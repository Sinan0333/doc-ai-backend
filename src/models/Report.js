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
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
