// app/api/os/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const releases = await prisma.oSRelease.findMany({
    where: { isPublic: true },
    include: { developer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // 將 BigInt 轉為字串以利 JSON 序列化
  const serialized = releases.map((r) => ({
    ...r,
    fileSizeBytes: r.fileSizeBytes.toString(),
  }));

  return NextResponse.json(serialized);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    title,
    version,
    architecture,
    baseDistro,
    description,
    s3Key,
    fileSizeBytes,
    sha256Checksum,
    price,
    developerId,
  } = body;

  // 驗證 SHA-256 格式 (64位十六進位字元)
  if (!/^[a-fA-F0-9]{64}$/.test(sha256Checksum)) {
    return NextResponse.json({ error: "無效的 SHA-256 校驗碼格式" }, { status: 400 });
  }

  const newRelease = await prisma.oSRelease.create({
    data: {
      title,
      version,
      architecture,
      baseDistro,
      description,
      s3Key,
      fileSizeBytes: BigInt(fileSizeBytes),
      sha256Checksum: sha256Checksum.toLowerCase(),
      price,
      developerId,
    },
  });

  return NextResponse.json({
    ...newRelease,
    fileSizeBytes: newRelease.fileSizeBytes.toString(),
  });
}
