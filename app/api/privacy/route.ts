/**
 * Prompt 27 — Privacy API
 * ========================
 * GET    /api/privacy  → export all user data as JSON
 * DELETE /api/privacy  → delete all user data (GDPR "right to erasure")
 * PATCH  /api/privacy  → toggle saveVoiceRecordings preference
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, isEncrypted } from "@/lib/encryption";

// ── GET — export ──────────────────────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [analysisResults, voiceEntries, lifestyleEntries, privacySettings] =
    await Promise.all([
      prisma.analysisResult.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.voiceEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.lifestyleEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.userPrivacySettings.findUnique({ where: { userId } })
    ]);

  // Decrypt inputText before exporting so the export is human-readable.
  const decryptedResults = analysisResults.map((r) => ({
    ...r,
    inputText: isEncrypted(r.inputText) ? decrypt(r.inputText) : r.inputText
  }));

  const exportData = {
    exportedAt: new Date().toISOString(),
    userId,
    analysisResults: decryptedResults,
    voiceEntries,
    lifestyleEntries,
    privacySettings
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="shruti-export-${Date.now()}.json"`
    }
  });
}

// ── DELETE — erase all data ────────────────────────────────────────────────────
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Delete in dependency order (child tables first).
  await prisma.$transaction([
    prisma.analysisResult.deleteMany({ where: { userId } }),
    prisma.voiceEntry.deleteMany({ where: { userId } }),
    prisma.lifestyleEntry.deleteMany({ where: { userId } }),
    prisma.userPrivacySettings.deleteMany({ where: { userId } }),
    // Remove the account itself last.
    prisma.account.deleteMany({ where: { userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } })
  ]);

  return NextResponse.json({ deleted: true }, { status: 200 });
}

// ── PATCH — toggle voice recording preference ─────────────────────────────────
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const saveVoiceRecordings = Boolean(body?.saveVoiceRecordings ?? true);

  const settings = await prisma.userPrivacySettings.upsert({
    where: { userId: session.user.id },
    update: { saveVoiceRecordings },
    create: { userId: session.user.id, saveVoiceRecordings }
  });

  return NextResponse.json({ settings }, { status: 200 });
}
