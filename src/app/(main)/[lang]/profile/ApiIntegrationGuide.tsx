"use client";

import { useState } from "react";
import { buildApiIntegrationExamples } from "../../../../lib/api-integration-examples";

export default function ApiIntegrationGuide({ endpoint, apiKey, isAr }: { endpoint: string; apiKey: string; isAr: boolean }) {
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const [action, setAction] = useState("accountinfo");
  const examples = buildApiIntegrationExamples(endpoint);
  const example = examples.find((item: any) => item.action === action) || examples[0];

  const testConnection = async () => {
    if (testing || !apiKey) return;
    setTesting(true);
    setFeedback(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
        body: JSON.stringify({ action: "accountinfo" })
      });
      const data = await response.json();
      const result = Array.isArray(data.SUCCESS) ? data.SUCCESS[0] : data.SUCCESS;
      const account = result?.AccountInfo || result?.accoutinfo || result?.accountinfo;
      if (!response.ok || !account) {
        const error = data.ERROR?.[0]?.MESSAGE || result?.ERROR || data.error;
        throw new Error(typeof error === "string" ? error : (isAr ? "تعذر التحقق من حساب الـAPI" : "Unable to verify API access"));
      }
      setFeedback({ success: true, text: isAr
        ? "الاتصال ناجح. الرصيد: " + (account.credit ?? account.balance ?? "0") + " " + (account.currency || "USD")
        : "Connected. Balance: " + (account.credit ?? account.balance ?? "0") + " " + (account.currency || "USD") });
    } catch (error) {
      setFeedback({ success: false, text: error instanceof Error ? error.message : (isAr ? "فشل الاتصال" : "Connection failed") });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-3.5 min-[380px]:p-5 rounded-xl border space-y-4 text-xs leading-relaxed w-full max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-bold text-sm">{isAr ? "اختبار الربط وإرسال الطلبات" : "Test connection and submit orders"}</h4>
        <button type="button" disabled={testing || !apiKey} onClick={testConnection}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold disabled:opacity-50">
          {testing ? (isAr ? "جاري الاختبار..." : "Testing...") : (isAr ? "اختبار الربط والرصيد" : "Test connection and balance")}
        </button>
      </div>
      <p>{isAr ? "زر الاختبار يستعلم عن الحساب والرصيد فقط، ولا ينشئ طلباً أو يخصم رصيداً." : "The test reads account and balance information without creating an order or charging your balance."}</p>
      {feedback && <p role="status" className={feedback.success ? "text-emerald-600" : "text-rose-500"}>{feedback.text}</p>}
      <ol className="list-decimal list-inside space-y-2">
        <li>{isAr ? "اختبر الربط، ثم اجلب قائمة الخدمات. استخدم SERVICEID أو ID من القائمة وحقول الخدمة نفسها." : "Test the connection, then fetch services. Use the returned SERVICEID or ID and the service's own fields."}</li>
        <li>{isAr ? "استبدل YOUR_API_KEY بمفتاح حسابك. في customfield أرسل أسماء الحقول وقيمها كما رجعت في الخدمة؛ مثال: Email. اتركها فارغة للخدمات التي لا تطلب حقولاً." : "Replace YOUR_API_KEY with your key. In customfield, use the field names and values returned for the service, such as Email. Leave it empty for services without fields."}</li>
        <li>{isAr ? "استخدم placeimeiorder لخدمات IMEI مع parameters.IMEI، وplaceserverorder لخدمات السيرفر. أرسل الكمية QNT فقط حسب حدود الخدمة." : "Use placeimeiorder for IMEI services with parameters.IMEI, and placeserverorder for server services. Set QNT according to the service limits."}</li>
        <li>{isAr ? "ضع clientorderid مختلفاً لكل طلب، واحتفظ بنفس القيمة عند إعادة محاولة الطلب نفسه لتجنب إنشاء طلب مكرر." : "Use a unique clientorderid per order and reuse it when retrying the same order to avoid duplicates."}</li>
        <li>{isAr ? "نجاح الطلب مع REFERENCEID يعني تسجيله وخصم رصيده في موقعنا. يظل في انتظار موافقة الإدارة قبل إرساله للمزود؛ تابع حالته برقم المرجع." : "Success with REFERENCEID means the order was saved and charged on our site. It awaits admin approval before provider dispatch; track it using the reference."}</li>
      </ol>
      <div className="flex flex-wrap gap-2" role="group" aria-label={isAr ? "أمثلة API" : "API examples"}>
        {examples.map((item: any) => (
          <button key={item.action} type="button" onClick={() => setAction(item.action)} aria-pressed={action === item.action}
            className={action === item.action ? "px-3 py-2 rounded-lg bg-blue-600 text-white" : "px-3 py-2 rounded-lg border"}>
            {isAr ? item.titleAr : item.titleEn}
          </button>
        ))}
      </div>
      <pre dir="ltr" className="overflow-x-auto p-4 rounded-xl bg-surface-container-lowest border text-[11px] text-left whitespace-pre"><code>{example.command}</code></pre>
      <p className="text-slate-500">{isAr ? "أرسل عمليات الطلب باستخدام POST. صيغ parameters المدعومة: JSON أو XML القياسي لـDhru داخل PARAMETERS. افحص ERROR قبل اعتبار العملية ناجحة." : "Send order placement with POST. parameters supports JSON or standard Dhru PARAMETERS XML. Check ERROR before treating a response as successful."}</p>
    </div>
  );
}
