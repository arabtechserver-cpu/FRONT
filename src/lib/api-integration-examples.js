function buildApiIntegrationExamples(endpoint) {
  const examples = [
    { action: 'accountinfo', titleAr: 'اختبار الربط والرصيد', titleEn: 'Connection and balance', body: { action: 'accountinfo' } },
    { action: 'imeiservicelist', titleAr: 'جلب الخدمات وحقولها', titleEn: 'Services and their fields', body: { action: 'imeiservicelist' } },
    { action: 'placeserverorder', titleAr: 'إرسال طلب خدمة', titleEn: 'Submit a service order', body: { action: 'placeserverorder', parameters: { ID: 'SERVICE_ID_FROM_LIST', QNT: 1, customfield: {}, clientorderid: 'YOUR_UNIQUE_ORDER_ID' } } },
    { action: 'getimeiorder', titleAr: 'متابعة حالة الطلب', titleEn: 'Check order status', body: { action: 'getimeiorder', parameters: { ID: 'REFERENCEID_FROM_ORDER' } } }
  ];
  return examples.map(example => ({
    ...example,
    command: [
      'curl --request POST "' + endpoint + '"',
      '  --header "Authorization: Bearer YOUR_API_KEY"',
      '  --header "Content-Type: application/json"',
      "  --data '" + JSON.stringify(example.body) + "'"
    ].join(' ' + '\\' + '\n')
  }));
}

module.exports = { buildApiIntegrationExamples };
