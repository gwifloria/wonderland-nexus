import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a base64 image to Cloudinary
 * @param dataUrl - The base64 data URL (e.g., "data:image/png;base64,...")
 * @param entryId - The whisper entry ID for organizing images
 * @param imgIndex - The index of the image in the entry (for unique naming)
 * @returns The secure_url from Cloudinary
 */
export async function uploadBase64Image(
  dataUrl: string,
  entryId: string,
  imgIndex: number,
): Promise<string> {
  try {
    // Validate environment variables
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error(
        "Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.",
      );
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "whisper-images",
      public_id: `${entryId}_${imgIndex}_${Date.now()}`,
      resource_type: "image",
      overwrite: false,
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error(
      `Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Upload a buffer (from file) to Cloudinary
 * @param buffer - The image buffer
 * @param entryId - The whisper entry ID for organizing images
 * @param imgIndex - The index of the image in the entry (for unique naming)
 * @returns The secure_url from Cloudinary
 */
export async function uploadBufferImage(
  buffer: Buffer,
  entryId: string,
  imgIndex: number,
): Promise<string> {
  try {
    // Validate environment variables
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error(
        "Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.",
      );
    }

    // Convert buffer to base64 data URL
    const base64 = buffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "whisper-images",
      public_id: `${entryId}_${imgIndex}_${Date.now()}`,
      resource_type: "image",
      overwrite: false,
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error uploading buffer to Cloudinary:", error);
    throw new Error(
      `Failed to upload buffer to Cloudinary: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Delete images from Cloudinary by their URLs
 * @param urls - Array of Cloudinary image URLs
 * @returns Object with deletion results
 */
export async function deleteImagesByUrls(
  urls: string[],
): Promise<{ deleted: string[]; failed: string[] }> {
  const deleted: string[] = [];
  const failed: string[] = [];

  // Filter only Cloudinary URLs
  const cloudinaryUrls = urls.filter((url) =>
    url.includes("res.cloudinary.com"),
  );

  if (cloudinaryUrls.length === 0) {
    console.log("No Cloudinary images to delete");
    return { deleted, failed };
  }

  // Validate environment variables
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn(
      "Cloudinary credentials not configured. Skipping image deletion.",
    );
    return { deleted, failed: cloudinaryUrls };
  }

  // Extract public_ids from URLs
  const publicIds: string[] = [];
  for (const url of cloudinaryUrls) {
    try {
      const publicId = extractPublicIdFromUrl(url);
      if (publicId) {
        publicIds.push(publicId);
      }
    } catch (error) {
      console.error(`Failed to extract public_id from URL: ${url}`, error);
      failed.push(url);
    }
  }

  // Delete images in batches (Cloudinary API allows up to 100 per request)
  const batchSize = 100;
  for (let i = 0; i < publicIds.length; i += batchSize) {
    const batch = publicIds.slice(i, i + batchSize);

    try {
      const result = await cloudinary.api.delete_resources(batch, {
        resource_type: "image",
      });

      // Track deleted and failed
      for (const publicId of batch) {
        if (result.deleted && result.deleted[publicId] === "deleted") {
          deleted.push(publicId);
        } else {
          failed.push(publicId);
        }
      }

      console.log(
        `Deleted batch ${i / batchSize + 1}: ${Object.keys(result.deleted || {}).length} images`,
      );
    } catch (error) {
      console.error("Error deleting batch from Cloudinary:", error);
      failed.push(...batch);
    }
  }

  console.log(
    `Cloudinary deletion complete: ${deleted.length} deleted, ${failed.length} failed`,
  );
  return { deleted, failed };
}

/**
 * Extract public_id from Cloudinary URL
 * Example URL: https://res.cloudinary.com/{cloud_name}/image/upload/v1234567890/whisper-images/entry123_0_1234567890.png
 * Returns: whisper-images/entry123_0_1234567890
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Match pattern: /upload/v{version}/{folder}/{filename}.{ext}
    // or: /upload/{folder}/{filename}.{ext}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (match && match[1]) {
      return match[1]; // Returns "whisper-images/entry123_0_1234567890"
    }
    return null;
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
}

export default cloudinary;
