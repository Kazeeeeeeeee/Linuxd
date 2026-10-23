// app/api/bounties/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const bounties = await prisma.bounty.findMany({
    include: {
      client: { select: { name: true } },
      bids: { include: { developer: { select: { name: true } } } },
      transaction: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bounties);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type } = body;

  // 1. 客戶發布新 Linux 客製化懸賞
  if (type === "CREATE_BOUNTY") {
    const { title, requirements, targetArch, budget, clientId } = body;
    const bounty = await prisma.bounty.create({
      data: { title, requirements, targetArch, budget, clientId },
    });
    return NextResponse.json(bounty);
  }

  // 2. 開發者對懸賞提交競標報價
  if (type === "SUBMIT_BID") {
    const { bountyId, developerId, amount, estimatedDays, proposal } = body;
    const bid = await prisma.bid.create({
      data: { bountyId, developerId, amount, estimatedDays, proposal },
    });
    return NextResponse.json(bid);
  }

  // 3. 客戶接受報價 -> 啟動資金託管交易 (Transaction Tracking)
  if (type === "ACCEPT_BID") {
    const { bountyId, bidId } = body;

    const result = await prisma.$transaction(async (tx) => {
      const bid = await tx.bid.update({
        where: { id: bidId },
        data: { status: "ACCEPTED" },
      });

      const bounty = await tx.bounty.update({
        where: { id: bountyId },
        data: { status: "IN_PROGRESS" },
      });

      // 建立交易追蹤紀錄 (狀態預設為 ESCROW_HELD)
      const transaction = await tx.transaction.create({
        data: {
          bountyId: bounty.id,
          bidId: bid.id,
          clientId: bounty.clientId,
          developerId: bid.developerId,
          amount: bid.amount,
          status: "ESCROW_HELD",
        },
      });

      return transaction;
    });

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "未知的操作類型" }, { status: 400 });
}
