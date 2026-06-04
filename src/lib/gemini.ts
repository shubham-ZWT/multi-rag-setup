import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

let embeddings: GoogleGenerativeAIEmbeddings;
let chatModel: ChatGroq;

export function getEmbeddings(): GoogleGenerativeAIEmbeddings {
  if (!embeddings) {
    embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }
  return embeddings;
}

export function getChatModel(): ChatGroq {
  if (!chatModel) {
    chatModel = new ChatGroq({
      model: "qwen/qwen3-32b",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.7,
    });
  }
  return chatModel;
}
