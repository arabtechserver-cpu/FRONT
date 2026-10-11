import { NextRequest, NextResponse } from "next/server";
import { getBackendCandidates } from "../../../../../lib/api-proxy-candidates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { challengeToken } = body;

    if (!challengeToken) {
      return NextResponse.json(
        { success: false, message: "معرف جلسة التحقق مطلوب" },
        { status: 400 }
      );
    }

    const uniqueUrls = getBackendCandidates(null, process.env.INTERNAL_API_URL);
    let lastErrorMessage = "";

    for (const apiUrl of uniqueUrls) {
      try {
        const res = await fetch(`${apiUrl}/api/auth/admin/resend-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeToken }),
          cache: "no-store"
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            return NextResponse.json({ success: true, message: data.message || "تم إرسال كود جديد إلى تيليجرام" });
          } else {
            return NextResponse.json(
              { success: false, message: data.error || data.message || "تعذر إعادة إرسال الكود" },
              { status: 400 }
            );
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          if (errData?.error || errData?.message) {
            lastErrorMessage = errData.error || errData.message;
          }
        }
      } catch {
        // Try next candidate URL
      }
    }

    return NextResponse.json(
      { success: false, message: lastErrorMessage || "تعذر الاتصال بالسيرفر لإعادة إرسال الكود" },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء إعادة إرسال الرمز" },
      { status: 500 }
    );
  }
}
