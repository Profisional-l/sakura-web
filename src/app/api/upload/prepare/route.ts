import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storage } from "@/lib/storage";

const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_VIDEO = 100 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      filename?: string;
      mimeType?: string;
      size?: number;
    };

    const filename = body.filename?.trim();
    const mimeType = body.mimeType?.trim();
    const size = body.size ?? 0;

    if (!filename || !mimeType) {
      return NextResponse.json({ error: "filename and mimeType are required" }, { status: 400 });
    }

    const isImage = mimeType.startsWith("image/");
    const isVideo = mimeType.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Only image and video files are allowed" }, { status: 400 });
    }

    const max = isVideo ? MAX_VIDEO : MAX_IMAGE;
    if (size > max) {
      return NextResponse.json(
        { error: isVideo ? "Video exceeds 100MB limit" : "Image exceeds 10MB limit" },
        { status: 400 }
      );
    }

    if (!storage.supportsPresign || !storage.createPresignedUpload) {
      return NextResponse.json({ mode: "local" as const });
    }

    const signed = await storage.createPresignedUpload(filename, mimeType);
    return NextResponse.json({
      mode: "presign" as const,
      uploadUrl: signed.uploadUrl,
      path: signed.path,
      filename: signed.filename,
    });
  } catch (error) {
    console.error("Upload prepare error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to prepare upload" },
      { status: 500 }
    );
  }
}
