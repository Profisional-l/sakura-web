import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMediaType } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      path?: string;
      filename?: string;
      mimeType?: string;
      alt?: string;
    };

    const filePath = body.path?.trim();
    const filename = body.filename?.trim();
    const mimeType = body.mimeType?.trim();

    if (!filePath || !filename || !mimeType) {
      return NextResponse.json(
        { error: "path, filename, and mimeType are required" },
        { status: 400 }
      );
    }

    if (!mimeType.startsWith("image/") && !mimeType.startsWith("video/")) {
      return NextResponse.json({ error: "Only image and video files are allowed" }, { status: 400 });
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        path: filePath,
        mimeType,
        mediaType: getMediaType(mimeType),
        alt: body.alt?.trim() || filename,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json({ error: "Failed to register upload" }, { status: 500 });
  }
}
