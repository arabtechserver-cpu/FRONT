"use server";

import { cookies } from "next/headers";

const candidateUrls = [
  process.env.INTERNAL_API_URL,
  process.env.NEXT_PUBLIC_API_URL,
  "http://127.0.0.1:5000",
  "http://localhost:5000"
].filter(Boolean) as string[];

export async function loginAdmin(username: string, password: string, turnstileToken?: string) {
  const uniqueUrls = Array.from(new Set(candidateUrls));
  let lastErrorMessage = "";

  const cookieStore = await cookies();
  const deviceToken = cookieStore.get("admin_device_token")?.value;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (deviceToken) headers["x-device-token"] = deviceToken;

  for (const apiUrl of uniqueUrls) {
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: username,
          password,
          "cf-turnstile-response": turnstileToken || "cf-turnstile-client-fallback",
          deviceToken
        }),
        cache: "no-store"
      });

      if (res.ok) {
        const data = await res.json();

        if (data.success && data.requireOtp) {
          return {
            success: true,
            requireOtp: true,
            challengeToken: data.challengeToken,
            message: data.message || "يرجى إدخال رمز التحقق (OTP) المرسل إلى تيليجرام"
          };
        }

        if (data.success && data.user && ["admin", "super_admin"].includes(data.user.role)) {
          const cookieStore = await cookies();
          cookieStore.set({
            name: "admin_token",
            value: data.token,
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 12,
            path: "/"
          });
          return { success: true, token: data.token, user: data.user };
        } else {
          return { success: false, message: data.error || data.message || "ليس لديك صلاحيات الدخول للوحة التحكم" };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData?.error || errData?.message) {
          lastErrorMessage = errData.error || errData.message;
        }
      }
    } catch {
      // Continue to next candidate URL
    }
  }

  return { success: false, message: lastErrorMessage || "تعذر الاتصال بخادم الباك إند، تأكد من تشغيل السيرفر" };
}

export async function verifyAdminOtpAction(challengeToken: string, otp: string) {
  const uniqueUrls = Array.from(new Set(candidateUrls));
  let lastErrorMessage = "";

  const cookieStore = await cookies();
  const deviceToken = cookieStore.get("admin_device_token")?.value;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (deviceToken) headers["x-device-token"] = deviceToken;

  for (const apiUrl of uniqueUrls) {
    try {
      const res = await fetch(`${apiUrl}/api/auth/admin/verify-otp`, {
        method: "POST",
        headers,
        body: JSON.stringify({ challengeToken, otp, deviceToken }),
        cache: "no-store"
      });

      if (res.ok) {
        const data = await res.json();

        if (data.success && data.token && data.user && ["admin", "super_admin"].includes(data.user.role)) {
          const cookieStore = await cookies();
          cookieStore.set({
            name: "admin_token",
            value: data.token,
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 12,
            path: "/"
          });
          return { success: true, token: data.token, user: data.user };
        } else {
          return { success: false, message: data.error || data.message || "رمز التحقق غير صحيح" };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData?.error || errData?.message) {
          lastErrorMessage = errData.error || errData.message;
        }
      }
    } catch {
      // Continue to next candidate URL
    }
  }

  return { success: false, message: lastErrorMessage || "تعذر التحقق من الكود، تأكد من تشغيل السيرفر" };
}

export async function resendAdminOtpAction(challengeToken: string) {
  const uniqueUrls = Array.from(new Set(candidateUrls));
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
          return { success: true, message: data.message || "تم إرسال كود تحقق جديد إلى تيليجرام" };
        } else {
          return { success: false, message: data.error || data.message || "تعذر إعادة إرسال الكود" };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData?.error || errData?.message) {
          lastErrorMessage = errData.error || errData.message;
        }
      }
    } catch {
      // Continue to next candidate URL
    }
  }

  return { success: false, message: lastErrorMessage || "تعذر الاتصال بالسيرفر لإعادة إرسال الكود" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
}
