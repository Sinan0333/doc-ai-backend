const { extractTextFromPDF, parseMedicalData, compareMedicalReports, deleteFile } = require('../services/aiService');
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
            analyzedData,
            isAbnormal: analyzedData.redFlags && analyzedData.redFlags.length > 0
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
exports.getReportHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { reportType, startDate, endDate, search } = req.query;

        const query = { patientId: req.user.id };

        if (reportType && reportType !== 'all') {
            query.reportType = reportType;
        }

        if (startDate || endDate) {
            query.reportDate = {};
            if (startDate) query.reportDate.$gte = new Date(startDate);
            if (endDate) query.reportDate.$lte = new Date(endDate);
        }

        if (search) {
            query.reportName = { $regex: search, $options: 'i' };
        }

        const reports = await Report.find(query)
            .sort({ reportDate: -1 })
            .skip(skip)
            .limit(limit)
            .select('-extractedText -analyzedData'); // Exclude heavy fields for list view

        const total = await Report.countDocuments(query);

        res.json({
            data: reports,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findOne({ _id: req.params.id, patientId: req.user.id })
            .select('+extractedText') // Include if needed, or remove if not needed for view
            .populate('doctorReview.doctorId', 'fullName email specialist');

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.json({ data: report });
    } catch (error) {
        console.error("Get Report Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.downloadReport = async (req, res) => {
    try {
        const report = await Report.findOne({ _id: req.params.id, patientId: req.user.id });

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.download(report.filePath, report.reportName + '.pdf');
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.requestReview = async (req, res) => {
    try {
        const { doctorId } = req.body;
        const report = await Report.findOne({ _id: req.params.id, patientId: req.user.id });

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        report.doctorReview = {
            status: 'requested',
            doctorId: doctorId,
            reviewedDate: null,
            notes: null
        };

        await report.save();

        res.json({ message: "Review requested successfully", data: report });
    } catch (error) {
        console.error("Request Review Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.compareReports = async (req, res) => {
    try {
        const { reportId1, reportId2 } = req.body;

        if (!reportId1 || !reportId2) {
            return res.status(400).json({ message: "Two report IDs are required for comparison" });
        }

        const report1 = await Report.findOne({ _id: reportId1, patientId: req.user.id })
            .populate('doctorReview.doctorId', 'fullName email');
        const report2 = await Report.findOne({ _id: reportId2, patientId: req.user.id })
            .populate('doctorReview.doctorId', 'fullName email');

        if (!report1 || !report2) {
            return res.status(404).json({ message: "One or both reports not found" });
        }

        const comparison = await compareMedicalReports(report1, report2);

        res.json({
            success: true,
            data: {
                report1: {
                    id: report1._id,
                    name: report1.reportName,
                    date: report1.reportDate
                },
                report2: {
                    id: report2._id,
                    name: report2.reportName,
                    date: report2.reportDate
                },
                comparison: comparison
            }
        });
    } catch (error) {
        console.error("Comparison Controller Error:", error);
        res.status(500).json({ message: "Server Error during comparison", error: error.message });
    }
};
