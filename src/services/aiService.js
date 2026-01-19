const OpenAI = require('openai');
const fs = require('fs');
const pdf = require('pdf-parse');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract text from a local PDF file
 */
const extractTextFromPDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
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

/**
 * Use OpenAI to parse medical text into structured JSON
 */
const parseMedicalData = async (rawText) => {
    const prompt = `
    You are an AI medical assistant. Extract key relevant health parameters from the following medical report text.
    Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.
    
    Structure the JSON as follows:
    {
        "reportDate": "YYYY-MM-DD",
        "parameters": [
            { "name": "Parameter Name", "value": "Value", "unit": "Unit", "category": "Category (e.g., Hematology, Biochemistry)" }
        ],
        "summary": "Brief summary of the report",
        "redFlags": ["List of critical abnormal values if any"]
    }

    Report Text:
    ${rawText.substring(0, 10000)} // Truncate to avoid token limits if necessary
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful medical analyst." }, { role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        const content = completion.choices[0].message.content;
        return JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw new Error("Failed to analyze medical data.");
    }
};

module.exports = {
    extractTextFromPDF,
    parseMedicalData,
    deleteFile
};
