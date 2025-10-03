import { NextRequest, NextResponse } from "next/server";
import { WhisperParser } from "@/services/whisperParser";
import WhisperEntry from "@/app/api/models/WhisperEntry";
import { dbConnect } from "@wonderland/database";
import { WhisperUploadResponse } from "@/types/whisper";
import AdmZip from "adm-zip";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

/**
 * Recursively find HTML file in directory
 */
async function findHtmlFile(dir: string): Promise<string | null> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile() && entry.name.endsWith(".html")) {
      return fullPath;
    }

    if (
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      !entry.name.startsWith("__")
    ) {
      const found = await findHtmlFile(fullPath);
      if (found) return found;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate file type - only ZIP files are supported
    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        {
          error:
            "Only ZIP files are supported. Please upload the ZIP file exported from flomo.",
        },
        { status: 400 },
      );
    }

    let htmlContent: string;
    let sourceDir: string;
    let tmpDir: string | undefined;

    console.log(`Processing ZIP file: ${file.name}`);

    try {
      // Extract ZIP file
      tmpDir = path.join(os.tmpdir(), `whisper_upload_${Date.now()}`);
      await fs.mkdir(tmpDir, { recursive: true });

      console.log(`Created temp directory: ${tmpDir}`);

      // Extract ZIP
      const buffer = Buffer.from(await file.arrayBuffer());
      const zip = new AdmZip(buffer);
      zip.extractAllTo(tmpDir, true);

      console.log("Extracted ZIP file");

      // Find HTML file
      const htmlFilePath = await findHtmlFile(tmpDir);

      if (!htmlFilePath) {
        throw new Error("No HTML file found in ZIP archive");
      }

      console.log(`Found HTML file: ${htmlFilePath}`);

      // Read HTML content
      htmlContent = await fs.readFile(htmlFilePath, "utf-8");

      // Set source directory to the directory containing the HTML file
      sourceDir = path.dirname(htmlFilePath);

      console.log(`Source directory: ${sourceDir}`);

      // Parse the HTML
      const parseResult = await WhisperParser.parseWhisperHTML(
        htmlContent,
        file.name,
        sourceDir,
      );

      console.log(
        `Parse result: ${parseResult.entries.length} entries, ${parseResult.errors.length} errors`,
      );

      if (parseResult.errors.length > 0 && parseResult.entries.length === 0) {
        return NextResponse.json(
          {
            error: "Failed to parse HTML file",
            details: parseResult.errors,
          },
          { status: 400 },
        );
      }

      // Upload images to Cloudinary and get URL mappings
      // Generate a batch ID for this upload session
      const batchId = `batch_${Date.now()}`;
      console.log(`Starting Cloudinary upload for batch: ${batchId}`);

      const imageCopyResult = await WhisperParser.copyImageFiles(
        parseResult.imageFiles,
        sourceDir, // Pass source directory (undefined for HTML, actual path for ZIP)
        batchId, // Use batch ID for folder organization
      );

      console.log(
        `Cloudinary upload complete: ${imageCopyResult.success.length} success, ${imageCopyResult.errors.length} errors`,
      );
      console.log(`URL map size: ${imageCopyResult.urlMap.size}`);

      // Save entries to database
      const savedEntries = [];
      const duplicates = [];
      const saveErrors = [];

      for (const entry of parseResult.entries) {
        try {
          // Check for existing entry with same originalId and source
          const existing = await WhisperEntry.findOne({
            originalId: entry.originalId,
            source: "whisper",
          });

          if (existing) {
            duplicates.push({
              originalId: entry.originalId,
              timestamp: entry.timestamp.toISOString(),
              reason: "Already exists",
            });
            continue;
          }

          // Replace placeholder URLs with actual Cloudinary URLs
          const finalImages = entry.images.map((imgUrl) => {
            if (imgUrl.startsWith("CLOUDINARY_PENDING_")) {
              const cloudinaryUrl = imageCopyResult.urlMap.get(imgUrl);
              if (!cloudinaryUrl) {
                console.error(
                  `No Cloudinary URL found for placeholder: ${imgUrl}`,
                );
                console.error(
                  `Available keys in urlMap:`,
                  Array.from(imageCopyResult.urlMap.keys()),
                );
              }
              return cloudinaryUrl || imgUrl;
            }
            return imgUrl;
          });

          console.log(
            `Entry images: ${entry.images.length}, Final images: ${finalImages.length}`,
          );

          // Create new entry
          const whisperEntry = new WhisperEntry({
            originalId: entry.originalId,
            timestamp: entry.timestamp,
            content: entry.content,
            originalHtml: entry.originalHtml,
            images: finalImages, // Use Cloudinary URLs
            tags: entry.tags,
            source: "whisper",
            sourceFile: file.name,
            visibility: "private", // Default to private
          });

          const saved = await whisperEntry.save();
          savedEntries.push({
            id: saved.id,
            timestamp: saved.timestamp,
            contentPreview: saved.content.substring(0, 100),
          });
        } catch (error) {
          console.error("Error saving entry:", error);
          saveErrors.push({
            timestamp: entry.timestamp.toISOString(),
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const response: WhisperUploadResponse = {
        success: true,
        summary: {
          totalParsed: parseResult.totalEntries,
          saved: savedEntries.length,
          duplicates: duplicates.length,
          errors: saveErrors.length,
        },
        details: {
          savedEntries,
          duplicates,
          saveErrors,
          parseErrors: parseResult.errors,
          imageFiles: {
            processed: parseResult.imageFiles.length,
            copied: imageCopyResult.success.length,
            errors: imageCopyResult.errors,
          },
        },
      };

      return NextResponse.json(response);
    } finally {
      // Clean up temporary directory if it was created
      if (tmpDir) {
        try {
          await fs.rm(tmpDir, { recursive: true, force: true });
          console.log(`Cleaned up temp directory: ${tmpDir}`);
        } catch (cleanupError) {
          console.error("Error cleaning up temp directory:", cleanupError);
        }
      }
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to process upload",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to upload." },
    { status: 405 },
  );
}
