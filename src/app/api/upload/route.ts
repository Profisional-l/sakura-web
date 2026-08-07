import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage, getMediaType } from "@/lib/storage";

const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_VIDEO = 100 * 1024 * 1024;

function validateFileMeta(mimeType: string, size: number) {
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  if (!isImage && !isVideo) {
    return "Only image and video files are allowed";
  }
  const max = isVideo ? MAX_VIDEO : MAX_IMAGE;
  if (size > max) {
    return isVideo ? "Video exceeds 100MB limit" : "Image exceeds 10MB limit";
  }
  return null;
}

/**
 * Local (dev): multipart upload through this route.
 * Vercel + R2: use /api/upload/prepare + direct PUT + /api/upload/complete
 * (Vercel Functions cap request bodies at 4.5MB).
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validationError = validateFileMeta(file.type, file.size);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { path: filePath, filename } = await storage.upload(
      buffer,
      file.name,
      file.type
    );

    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        path: filePath,
        mimeType: file.type,
        mediaType: getMediaType(file.type),
        alt: file.name,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assets);
}
