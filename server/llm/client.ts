import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiPro = genAI.getGenerativeModel({
  model: "gemini-2.5-pro", // This should be updated to the correct model name for Gemini 2.5
});

export const geminiEmbedder = genAI.getGenerativeModel({
    model: "text-embedding-004" // Or another suitable embedding model
});

export default genAI;
