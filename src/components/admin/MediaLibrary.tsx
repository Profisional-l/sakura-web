"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { deleteMediaAsset } from "@/actions";

type MediaAsset = {
  id: string;
  filename: string;
  path: string;
  mimeType: string;
  mediaType: string;
  createdAt: string;
};

export function MediaLibrary({ initialAssets }: { initialAssets: MediaAsset[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const prepareRes = await fetch("/api/upload/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      });

      const prepare = await prepareRes.json();
      if (!prepareRes.ok) {
        throw new Error(prepare.error ?? "Failed to prepare upload");
      }

      let asset: MediaAsset;

      if (prepare.mode === "presign") {
        const putRes = await fetch(prepare.uploadUrl as string, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!putRes.ok) {
          throw new Error("Direct upload to storage failed. Check R2 CORS settings.");
        }

        const completeRes = await fetch("/api/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: prepare.path,
            filename: prepare.filename,
            mimeType: file.type,
            alt: file.name,
          }),
        });
        const completeBody = await completeRes.json();
        if (!completeRes.ok) {
          throw new Error(completeBody.error ?? "Failed to register upload");
        }
        asset = completeBody;
      } else {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.error ?? "Upload failed");
        }
        asset = body;
      }

      setAssets((prev) => [asset, ...prev]);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(assetId: string) {
    setDeletingId(assetId);
    setMessage("");
    const result = await deleteMediaAsset(assetId);
    if (result.success) {
      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
    } else {
      setMessage(result.message ?? "Failed to delete asset");
    }
    setDeletingId(null);
  }

  return (
    <div>
      <div className="mb-6">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleUpload}
          className="hidden"
          id="media-upload"
        />
        <label htmlFor="media-upload" className="admin-btn cursor-pointer inline-block">
          {uploading ? "Uploading..." : "Upload Media"}
        </label>
        {message && <p className="text-sm text-amber-300 mt-3">{message}</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {assets.map((asset) => (
          <div key={asset.id} className="glass-panel rounded overflow-hidden">
            <div className="aspect-square relative bg-black/40">
              {asset.mediaType === "IMAGE" ? (
                <Image src={asset.path} alt={asset.filename} fill className="object-cover" />
              ) : (
                <video src={asset.path} className="w-full h-full object-cover" muted />
              )}
            </div>
            <div className="p-2">
              <p className="text-xs truncate">{asset.filename}</p>
              <p className="text-xs text-white/40">{asset.mediaType}</p>
              <button
                onClick={() => handleDelete(asset.id)}
                disabled={deletingId === asset.id}
                className="mt-2 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
              >
                {deletingId === asset.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
