const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract text from a local PDF file
*/
const extractTextFromPDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new PDFParse(uint8Array);
    const data = await parser.getText();
    await parser.destroy();
    return data && data.text ? data.text : (typeof data === 'string' ? data : JSON.stringify(data));
};

/**
 * Clean up file after processing
 */
const deleteFile = (filePath) => {
    try {
        fs.unlinkSync(filePath);
    } catch (err) {
        console.error('Error deleting file:', err);
    }
};

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${genAI.apiKey}`);
    const data = await response.json();
    console.log("Available Models:");
    data.models.forEach(m => console.log("- " + m.name));
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}

const getPrompt = (rawText) => `
    You are an AI medical assistant. Extract key relevant health parameters from the following medical report text.
    Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.
    
    Structure the JSON as follows:
    {
        "reportDate": "YYYY-MM-DD",
        "parameters": [
            { "name": "Parameter Name", "value": "Value", "unit": "Unit", "category": "Category (e.g., Hematology, Biochemistry)" }
        ],
        "summary": "Brief summary of the report include the patient name and age and gender if available",
        "redFlags": ["List of critical abnormal values if any"]
    }

    Report Text:
    ${rawText.substring(0, 15000)}
`;

/**
 * Use OpenAI to parse medical text
 */
const parseMedicalDataOpenAI = async (rawText) => {
    const prompt = getPrompt(rawText);

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful medical analyst." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        const content = completion.choices[0].message.content;
        return JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw new Error("Failed to analyze medical data with OpenAI.");
    }
};

/**
 * Use Gemini to parse medical text
 */
const parseMedicalDataGemini = async (rawText) => {
    const prompt = getPrompt(rawText);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to analyze medical data with Gemini.");
    }
};

// Default export uses Gemini now
const parseMedicalData = async (rawText) => {
    // Fallback logic or just direct call
    // Currently preferring Gemini
    try {
        listModels();
        return await parseMedicalDataGemini(rawText);
    } catch (error) {
        console.log("Gemini failed, trying OpenAI fallback...");
        // return await parseMedicalDataOpenAI(rawText);
        throw error;
    }
};

/**
 * Compare two medical reports using AI
 */
const compareMedicalReports = async (report1, report2) => {
    const prompt = `
        You are a senior medical consultant. Compare the following two analyzed medical reports for the same patient.
        
        Report 1:
        - Date: ${report1.reportDate}
        - Type: ${report1.reportType}
        - Summary: ${report1.analyzedData.summary}
        - Red Flags: ${JSON.stringify(report1.analyzedData.redFlags)}
        - Parameters: ${JSON.stringify(report1.analyzedData.parameters)}
        - Doctor Notes: ${report1.doctorReview?.notes || 'No notes available'}
        
        Report 2:
        - Date: ${report2.reportDate}
        - Type: ${report2.reportType}
        - Summary: ${report2.analyzedData.summary}
        - Red Flags: ${JSON.stringify(report2.analyzedData.redFlags)}
        - Parameters: ${JSON.stringify(report2.analyzedData.parameters)}
        - Doctor Notes: ${report2.doctorReview?.notes || 'No notes available'}
        
        Provide a detailed comparative analysis. Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.
        
        Structure the JSON as follows:
        {
            "summary": "Overall comparison summary focusing on trends",
            "parameterChanges": [
                { 
                    "name": "Parameter Name", 
                    "prevValue": "Value from Report 1", 
                    "newValue": "Value from Report 2", 
                    "unit": "Unit", 
                    "changeType": "improvement | deterioration | stable | new", 
                    "insight": "Brief explanation of what this change means" 
                }
            ],
            "redFlagsStatus": {
                "resolved": ["Red flags from Report 1 no longer present"],
                "persisting": ["Red flags present in both reports"],
                "new": ["New red flags identified in Report 2"]
            },
            "recommendations": ["Actionable advice for the patient"]
        }
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (error) {
        console.error("Comparison Error:", error);
        throw new Error("Failed to compare medical reports with AI.");
    }
};

module.exports = {
    extractTextFromPDF,
    parseMedicalData,
    parseMedicalDataOpenAI, // Exported for manual usage if needed
    parseMedicalDataGemini,
    compareMedicalReports,
    deleteFile
};
