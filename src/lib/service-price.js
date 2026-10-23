function getServicePrice(service) {
  if (!service) return 0;
  const cost = Number(service.credit);
  const margin = Number(service.margin ?? 0);
  const values = [service.finalPrice, service.sellingPrice, service.price,
    Number.isFinite(cost) && Number.isFinite(margin) ? cost + margin : null]
    .filter(value => value !== null && value !== undefined && value !== '')
    .map(Number).filter(value => Number.isFinite(value) && value >= 0);
  return values.find(value => value > 0) ?? 0;
}

function formatUsdPrice(value) {
  return Number(value).toFixed(value > 0 && value < 0.01 ? 6 : 2).replace(/(\.\d{2}.*?)0+$/, '$1');
}

module.exports = { getServicePrice, formatUsdPrice };
