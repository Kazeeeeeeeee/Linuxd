import React from "react";
import { auth, signIn, signOut } from "@/auth";
import UploadComponent from "@/components/UploadComponent"; // 我們稍後會將上傳邏輯獨立成 Client Component

export default async function Home() {
  // 透過 Auth.js 在 Server 端取得當前登入使用者的 session
  const session = await auth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      {/* 頂部導覽列與身分狀態 */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
              Vercel Cloud Deployment
            </span>
            <h1 className="text-2xl font-bold tracking-tight">KernelForge OS Marketplace</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            基於 Next.js 與 Vercel Blob 的客製化 Linux 發行版市集
          </p>
        </div>

        {/* 登入狀態顯示與登入/登出按鈕 */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
              <div className="text-right">
                <div className="text-xs font-medium text-white">{session.user.name || "開發者"}</div>
                <div className="text-[10px] text-zinc-400">{session.user.email}</div>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition"
                >
                  登出
                </button>
              </form>
            </div>
          ) : (
            <div className="text-xs text-zinc-400">請先登入以解鎖開發者上傳功能</div>
          )}
        </div>
      </header>

      {/* 主內容區 */}
      <main className="max-w-6xl mx-auto mt-8">
        {!session?.user ? (
          /* 未登入狀態：顯示 Google / GitHub 登入畫面 */
          <div className="max-w-md mx-auto mt-16 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">歡迎加入 KernelForge</h2>
              <p className="text-sm text-zinc-400 mt-1">
                請選擇您的偏好方式登入，以發布自定義 Linux ISO 或參與懸賞競標。
              </p>
            </div>

            <div className="space-y-3">
              {/* Google 登入 */}
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-900 font-medium text-sm flex items-center justify-center gap-3 transition"
                >
                  <span>使用 Google 帳號登入</span>
                </button>
              </form>

              {/* GitHub 登入 */}
              <form
                action={async () => {
                  "use server";
                  await signIn("github");
                }}
              >
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm flex items-center justify-center gap-3 transition border border-zinc-700"
                >
                  <span>使用 GitHub 帳號登入</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* 已登入狀態：顯示完整市集與 Vercel Blob 上傳表單 */
          <div className="space-y-8">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              ✨ 歡迎回來！您已成功驗證身分，目前已解鎖 **開發者上傳通道** 與 **懸賞競標權限**。
            </div>

            {/* 引入帶有 Vercel Blob 上傳功能的互動式組件 */}
            <UploadComponent userEmail={session.user.email} />
          </div>
        )}
      </main>
    </div>
  );
}
