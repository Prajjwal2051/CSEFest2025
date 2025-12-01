import axios from 'axios';

const GEMINI_API_KEY = "AIzaSyAKzcZhYA5WlUudg76i0bTEpYr4frst_Fc";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

export const runCode = async (source_code, language_id, stdin = "") => {
  console.log("🤖 Asking Gemini to judge...");

  // Map ID to name
  let langName = "C";
  if (language_id === 71) langName = "Python";
  if (language_id === 54) langName = "C++";
  if (language_id === 50) langName = "C";

  const prompt = `
You are a strict code execution engine. 
Your task is to simulate the execution of the following ${langName} code with the provided input.

Input (stdin):
${stdin}

Code:
${source_code}

Instructions:
1. Analyze the code logic carefully.
2. Calculate the exact output based on the input.
3. If there is a syntax error or compilation error, output the error message.
4. Return ONLY a JSON object with the following structure (no markdown formatting):
{
  "stdout": "actual output here",
  "stderr": "error message if any",
  "compile_output": "",
  "status": { "id": 3, "description": "Accepted" } 
}
If there is an error, set status.id to 6 (Compilation Error) or 11 (Runtime Error) and put the message in stderr.
  `;

  try {
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{ text: prompt }]
      }]
    });

    const text = response.data.candidates[0].content.parts[0].text;
    
    // Clean up markdown if Gemini adds it
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonString);

    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
    }
    return {
      stdout: "",
      stderr: `AI Judge Connection Failed. ${error.response?.data?.error?.message || error.message}`,
      compile_output: "",
      status: { id: 13, description: "Internal Error" }
    };
  }
};
