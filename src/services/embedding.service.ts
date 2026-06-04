import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEmbeddings } from "../lib/gemini";

interface ChunkResult {
  content: string;
  chunkIndex: number;
  tokenCount: number;
  embedding: number[];
}

class EmbeddingService {
  private splitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });
  }

  async splitAndEmbed(text: string): Promise<ChunkResult[]> {
    const documents = await this.splitter.createDocuments([text]);
    const contents = documents.map((d) => d.pageContent);
    const embeddings = await getEmbeddings().embedDocuments(contents);

    return contents.map((content, i) => ({
      content,
      chunkIndex: i,
      tokenCount: Math.ceil(content.length / 4),
      embedding: embeddings[i],
    }));
  }

  async embedQuery(text: string): Promise<number[]> {
    return getEmbeddings().embedQuery(text);
  }
}

export default new EmbeddingService();
