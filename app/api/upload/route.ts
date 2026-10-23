// app/api/upload/token/route.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // 這裡可以驗證使用者身分是否為 DEVELOPER
        return {
          allowedContentTypes: [
            'application/x-iso9660-image', 
            'application/octet-stream', 
            'application/x-img'
          ],
          // 設定最大有效期限或自訂 Metadata
          tokenPayload: JSON.stringify({
            // 可在此夾帶開發者 ID 等資訊
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Vercel Blob 上傳成功:', blob.url);
        // 您可以在此處將 blob.url 自動寫入資料庫的 OSRelease 紀錄中
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
