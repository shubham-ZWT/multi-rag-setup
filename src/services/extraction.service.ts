import fs from "node:fs";
import path from "node:path";
import AppError from "../utils/appError";

class ExtractionService {
  async extractFromFile(filePath: string, mimeType: string): Promise<string> {
    if (mimeType === "application/pdf") {
      return this.extractPDF(filePath);
    }
    if (mimeType === "text/plain") {
      return fs.readFileSync(filePath, "utf-8");
    }
    throw new AppError(`Unsupported mime type: ${mimeType}`, 400);
  }

  private async extractPDF(filePath: string): Promise<string> {
    const { PDFParse } = await import("pdf-parse");
    const buffer = new Uint8Array(fs.readFileSync(filePath));
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }

  async fetchFromUrl(url: string): Promise<string> {
    const https = await import("node:https");
    const http = await import("node:http");

    return new Promise((resolve, reject) => {
      const client = url.startsWith("https") ? https : http;
      client
        .get(url, (res) => {
          if (
            res.statusCode &&
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            this.fetchFromUrl(res.headers.location).then(resolve).catch(reject);
            return;
          }
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve(data));
        })
        .on("error", reject);
    });
  }

  getFileSize(filePath: string): number {
    return fs.statSync(filePath).size;
  }

  cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      console.warn(`Failed to cleanup file: ${filePath}`);
    }
  }
}

export default new ExtractionService();
