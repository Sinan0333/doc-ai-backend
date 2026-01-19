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

        // 3. Save to DB
        const newReport = new Report({
            patientId: req.user.id, // Auth middleware adds user object to req
            reportName,
            reportType,
            reportDate,
            filePath,
            extractedText: rawText,
            analyzedData
        });

        await newReport.save();

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
