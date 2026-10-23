// components/UploadComponent.tsx
"use client";

import React, { useState } from "react";
import { upload } from "@vercel/blob/client";

export default function UploadComponent({ userEmail }: { userEmail?: string | null }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setProgress(0);

      const blob = await upload(selectedFile.name, selectedFile, {
        access: "public",
        handleUploadUrl: "/api/upload/token",
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setProgress(percentage);
        },
      });

      setUploadedUrl(blob.url);
      alert(`ISO 映像檔上傳成功！網址：${blob.url}`);
    } catch (error: any) {
      alert(`上傳失敗：${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-lg font-semibold">您的上傳紀錄與發布列表</h2>
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="text-sm text-zinc-300">目前發布者：{userEmail}</div>
          {uploadedUrl && (
            <div className="text-xs text-blue-400 break-all">
              最近上傳的檔案：<a href={uploadedUrl} target="_blank" className="underline">{uploadedUrl}</a>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 h-fit space-y-4">
        <h3 className="font-semibold text-base">發布新 Linux ISO (Vercel Blob)</h3>
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">選擇 ISO 映像檔</label>
            <input
              type="file"
              accept=".iso,.img"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-zinc-800 file:text-zinc-200"
            />
          </div>

          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>上傳進度</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                <div className="bg-emerald-500 h-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium transition"
          >
            {uploading ? `上傳中 (${progress}%)...` : "開始上傳至 Vercel Blob"}
          </button>
        </div>
      </div>
    </div>
  );
}
