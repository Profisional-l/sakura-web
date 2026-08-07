import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface StorageAdapter {
  upload(
    file: Buffer,
    filename: string,
    mimeType: string
  ): Promise<{ path: string; filename: string }>;
  delete(filePath: string): Promise<void>;
  /** When true, client should upload via presigned URL (bypasses Vercel 4.5MB limit). */
  supportsPresign: boolean;
  createPresignedUpload?(
    filename: string,
    mimeType: string
  ): Promise<{ uploadUrl: string; path: string; filename: string; key: string }>;
}

class LocalStorageAdapter implements StorageAdapter {
  supportsPresign = false;
  private baseDir = path.join(process.cwd(), "public", "uploads");

  async upload(file: Buffer, filename: string, mimeType: string) {
    void mimeType;
    if (process.env.VERCEL) {
      throw new Error(
        "Local file uploads are not available on Vercel. Set STORAGE_ADAPTER=r2 and configure Cloudflare R2."
      );
    }

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
    if (process.env.VERCEL) return;
    const fullPath = path.join(process.cwd(), "public", filePath.replace(/^\//, ""));
    try {
      await unlink(fullPath);
    } catch {
      // file may not exist
    }
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

class R2StorageAdapter implements StorageAdapter {
  supportsPresign = true;
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    const accountId = requireEnv("R2_ACCOUNT_ID");
    const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
    const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
    this.bucket = requireEnv("R2_BUCKET_NAME");
    this.publicUrl = requireEnv("R2_PUBLIC_URL").replace(/\/$/, "");

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  private objectKey(filename: string) {
    const ext = path.extname(filename);
    const uniqueName = `${randomUUID()}${ext}`;
    return { key: `uploads/${uniqueName}`, uniqueName };
  }

  async upload(file: Buffer, filename: string, mimeType: string) {
    const { key, uniqueName } = this.objectKey(filename);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
      })
    );

    return {
      path: `${this.publicUrl}/${key}`,
      filename: uniqueName,
    };
  }

  async createPresignedUpload(filename: string, mimeType: string) {
    const { key, uniqueName } = this.objectKey(filename);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 60 * 10 });

    return {
      uploadUrl,
      path: `${this.publicUrl}/${key}`,
      filename: uniqueName,
      key,
    };
  }

  async delete(filePath: string) {
    let key = filePath;
    if (filePath.startsWith("http")) {
      try {
        key = new URL(filePath).pathname.replace(/^\//, "");
      } catch {
        return;
      }
    } else {
      key = filePath.replace(/^\//, "");
    }

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
    } catch {
      // ignore missing objects
    }
  }
}

function resolveAdapterName() {
  if (process.env.STORAGE_ADAPTER) return process.env.STORAGE_ADAPTER;
  if (process.env.VERCEL && process.env.R2_BUCKET_NAME) return "r2";
  return "local";
}

let cached: StorageAdapter | null = null;

function createStorageAdapter(): StorageAdapter {
  const adapter = resolveAdapterName();
  if (adapter === "r2") return new R2StorageAdapter();
  return new LocalStorageAdapter();
}

function getAdapter() {
  cached ??= createStorageAdapter();
  return cached;
}

/** Lazy so missing R2 env does not break `next build` imports. */
export const storage: StorageAdapter = {
  get supportsPresign() {
    return getAdapter().supportsPresign;
  },
  upload(file, filename, mimeType) {
    return getAdapter().upload(file, filename, mimeType);
  },
  delete(filePath) {
    return getAdapter().delete(filePath);
  },
  createPresignedUpload(filename, mimeType) {
    const adapter = getAdapter();
    if (!adapter.createPresignedUpload) {
      throw new Error("Current storage adapter does not support presigned uploads");
    }
    return adapter.createPresignedUpload(filename, mimeType);
  },
};

export function getMediaType(mimeType: string): "IMAGE" | "VIDEO" {
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "IMAGE";
}
