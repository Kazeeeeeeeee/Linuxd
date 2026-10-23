// app/api/s3/multipart/route.ts
import { NextResponse } from "next/server";
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 步驟 1：初始化 Multipart Upload 並綁定 SHA-256 Metadata
    if (action === "INIT") {
      const { fileName, sha256Checksum, totalParts } = body;
      const s3Key = `iso-releases/${Date.now()}-${fileName}`;

      const createCmd = new CreateMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        ContentType: "application/x-iso9660-image",
        Metadata: {
          "sha256-checksum": sha256Checksum,
        },
      });

      const { UploadId } = await s3Client.send(createCmd);

      // 為每個分塊 (例如每 50MB 一塊) 產生預簽名上傳 URL
      const presignedUrls: { partNumber: number; url: string }[] = [];
      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const uploadPartCmd = new UploadPartCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          UploadId,
          PartNumber: partNumber,
        });
        const url = await getSignedUrl(s3Client, uploadPartCmd, { expiresIn: 3600 });
        presignedUrls.push({ partNumber, url });
      }

      return NextResponse.json({ uploadId: UploadId, s3Key, presignedUrls });
    }

    // 步驟 2：所有分塊上傳完畢後，合併成完整 ISO 檔案
    if (action === "COMPLETE") {
      const { s3Key, uploadId, parts } = body; // parts: [{ PartNumber, ETag }]

      const completeCmd = new CompleteMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.sort((a: any, b: any) => a.PartNumber - b.PartNumber),
        },
      });

      const result = await s3Client.send(completeCmd);
      return NextResponse.json({
        message: "ISO Multipart Upload Completed",
        location: result.Location,
        s3Key,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
