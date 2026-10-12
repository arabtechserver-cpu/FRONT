"use server";

import { cookies } from "next/headers";

export async function getAdminProfile() {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token) return null;

  const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${apiUrl}/api/users/profile`, {
      headers,
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      return data.success ? data.user : null;
    }
  } catch (error) {
    console.error("Failed to fetch admin profile:", error);
  }
  return null;
}

export async function updateAdminCredentials(data: any) {
  const token = (await cookies()).get('admin_token')?.value;
  if (!token) return { success: false, error: "غير مصرح لك" };

  const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${apiUrl}/api/users/update-credentials`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    return await res.json();
  } catch (error) {
    console.error("Failed to update credentials:", error);
    return { success: false, error: "تعذر الاتصال بالسيرفر" };
  }
}
