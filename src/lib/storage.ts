import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface StorageAdapter {
  upload(file: Buffer, filename: string, mimeType: string): Promise<{ path: string; filename: string }>;
  delete(filePath: string): Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  private baseDir = path.join(process.cwd(), "public", "uploads");

  async upload(file: Buffer, filename: string, mimeType: string) {
    void mimeType;
    await mkdir(this.baseDir, { recursive: true });
    const ext = path.extname(filename);
    const uniqueName = `${randomUUID()}${ext}`;
    const filePath = path.join(this.baseDir, uniqueName);
    await writeFile(filePath, file);
    return {
      path: `/uploads/${uniqueName}`,
      filename: uniqueName,
    };
  }

  async delete(filePath: string) {
    const { unlink } = await import("fs/promises");
    const fullPath = path.join(process.cwd(), "public", filePath.replace(/^\//, ""));
    try {
      await unlink(fullPath);
    } catch {
      // file may not exist
    }
  }
}

class R2StorageAdapter implements StorageAdapter {
  async upload(
    file: Buffer,
    filename: string,
    mimeType: string
  ): Promise<{ path: string; filename: string }> {
    void file;
    void filename;
    void mimeType;
    throw new Error(
      "R2 storage adapter is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME."
    );
  }

  async delete(filePath: string) {
    void filePath;
    throw new Error("R2 storage adapter is not configured.");
  }
}

function createStorageAdapter(): StorageAdapter {
  const adapter = process.env.STORAGE_ADAPTER ?? "local";
  if (adapter === "r2") {
    return new R2StorageAdapter();
  }
  return new LocalStorageAdapter();
}

export const storage = createStorageAdapter();

export function getMediaType(mimeType: string): "IMAGE" | "VIDEO" {
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "IMAGE";
}
