import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = body.username || body.email;
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "اسم المستخدم وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    const candidateUrls = [
      process.env.INTERNAL_API_URL,
      process.env.NEXT_PUBLIC_API_URL,
      "http://127.0.0.1:5000",
      "http://localhost:5000"
    ].filter(Boolean) as string[];

    const uniqueUrls = Array.from(new Set(candidateUrls));
    let lastErrorMessage = "";

    const forwardHeaders: Record<string, string> = { "Content-Type": "application/json" };
    const xff = request.headers.get("x-forwarded-for");
    if (xff) forwardHeaders["x-forwarded-for"] = xff;
    const userAgent = request.headers.get("user-agent");
    if (userAgent) forwardHeaders["user-agent"] = userAgent;

    const deviceToken = request.headers.get("x-device-token") || request.cookies.get("admin_device_token")?.value || body.deviceToken;
    if (deviceToken) forwardHeaders["x-device-token"] = deviceToken;

    const localIp = request.headers.get("x-client-local-ip") || body.localIp;
    if (localIp) forwardHeaders["x-client-local-ip"] = localIp;

    const deviceFingerprint = request.headers.get("x-device-fingerprint") || body.deviceFingerprint;
    if (deviceFingerprint) forwardHeaders["x-device-fingerprint"] = deviceFingerprint;

    for (const apiUrl of uniqueUrls) {
      try {
        const res = await fetch(`${apiUrl}/api/auth/login`, {
          method: "POST",
          headers: forwardHeaders,
          body: JSON.stringify({
            email: username,
            password,
            deviceToken,
            localIp,
            fingerprint: deviceFingerprint
          }),
          cache: "no-store"
        });

        if (res.ok) {
          const data = await res.json();

          if (data.success && data.requireOtp) {
            return NextResponse.json({
              success: true,
              requireOtp: true,
              challengeToken: data.challengeToken,
              message: data.message || "يرجى إدخال رمز التحقق (OTP) المرسل إلى تيليجرام"
            });
          }

          if (data.success && data.user && ["admin", "super_admin"].includes(data.user.role)) {
            const isHttps = request.headers.get("x-forwarded-proto") === "https" || request.nextUrl.protocol === "https:";
            const cookieStore = await cookies();
            cookieStore.set({
              name: "admin_token",
              value: data.token,
              httpOnly: false,
              secure: isHttps,
              sameSite: "lax",
              maxAge: 60 * 60 * 12,
              path: "/"
            });
            return NextResponse.json({ success: true, token: data.token, user: data.user });
          } else {
            return NextResponse.json(
              { success: false, message: data.error || data.message || "ليس لديك صلاحيات الدخول للوحة التحكم" },
              { status: 403 }
            );
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          if (res.status === 403 && (errData?.code === "IP_NOT_ALLOWED" || errData?.error?.includes("network"))) {
            return NextResponse.json(
              {
                success: false,
                code: "IP_NOT_ALLOWED",
                message: errData.error || errData.message || "Access to the dashboard is not allowed from this network.",
                clientIp: errData.clientIp
              },
              { status: 403 }
            );
          }
          if (errData?.error || errData?.message) {
            lastErrorMessage = errData.error || errData.message;
          }
        }
      } catch {
        // Continue to next candidate URL
      }
    }

    return NextResponse.json(
      { success: false, message: lastErrorMessage || "تعذر الاتصال بخادم الباك إند، تأكد من تشغيل السيرفر" },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء معالجة تسجيل الدخول" },
      { status: 500 }
    );
  }
}
