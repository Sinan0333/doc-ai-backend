const { extractTextFromPDF, parseMedicalData, deleteFile } = require('../services/aiService');
const Report = require('../models/Report'); // We will create this model next

exports.uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = req.file.path;

        const { reportName, reportType, reportDate } = req.body;

        // 1. Extract Text
        const rawText = await extractTextFromPDF(filePath);

        // 2. Analyze with OpenAI
        const analyzedData = await parseMedicalData(rawText);

        // 3. Save to DB (Optional: verify if Patient ID exists in request)
        // For now, we just return the analysis to frontend
        
        // Clean up uploaded file? Or keep it? 
        // Strategy: Keep original file reference, but maybe delete local temp copy if using cloud. 
        // Since we are local, we keep it in 'uploads/' but for this specific flow we might want to just parse.
        // Let's decide to KEEP the file for record.

        res.json({
            message: "Report analyzed successfully",
            metadata: {
                reportName,
                reportType,
                reportDate
            },
            data: analyzedData,
            filePath: filePath
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Server Error during processing", error: error.message });
    }
};
