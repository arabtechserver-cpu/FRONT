"use client";

import React, { useState } from "react";

interface ImageUploaderProps {
  name: string;
  defaultValue?: string;
  onChange?: (url: string) => void;
  className?: string;
}

export default function ImageUploader({ name, defaultValue, onChange, className = "" }: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("الرجاء اختيار ملف صورة صالح");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64Data,
              filename: file.name,
            }),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            const relativeUrl = data.url.replace(/^https?:\/\/(api\.)?(borai\.store|arabtechproserver\.tech)/, "");
            setImageUrl(relativeUrl);
            if (onChange) onChange(relativeUrl);
          } else {
            setError(data.error || "فشل رفع الصورة");
          }
        } catch (err) {
          setError("خطأ في الاتصال بالخادم");
        } finally {
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError("حدث خطأ أثناء قراءة الملف");
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input type="hidden" name={name} value={imageUrl} />
      
      <div className="flex items-center gap-4">
        <label className="cursor-pointer bg-surface-variant hover:bg-surface-variant/80 text-on-surface-variant px-4 py-2 rounded-xl transition-colors font-bold text-sm flex items-center gap-2 border border-outline-variant/30">
          <span className="material-symbols-outlined text-lg">upload</span>
          {isUploading ? "جاري الرفع..." : "اختر صورة"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
        
        {imageUrl && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
      
      {error && <p className="text-error text-xs font-bold">{error}</p>}
      {imageUrl && <p className="text-xs text-on-surface-variant dir-ltr text-left overflow-hidden text-ellipsis whitespace-nowrap">{imageUrl}</p>}
    </div>
  );
}
