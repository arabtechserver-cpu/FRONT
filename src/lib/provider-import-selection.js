const { getProviderServiceType, refinePackageGroupName } = require('./provider-service-types');

function providerPackageKey(service) {
  const name = refinePackageGroupName(service.groupName || service.group_name || 'باقة عامة', service.name || service.originalName || '');
  return JSON.stringify([getProviderServiceType(service), name]);
}

function selectImportServices(services, keys) {
  const selected = new Set(keys);
  return services.filter(service => selected.has(providerPackageKey(service)));
}

function toggleVisiblePackageSelection(selectedKeys, visibleKeys) {
  const selected = new Set(selectedKeys);
  const allSelected = visibleKeys.length > 0 && visibleKeys.every(key => selected.has(key));
  for (const key of visibleKeys) { if (allSelected) selected.delete(key); else selected.add(key); }
  return [...selected];
}

module.exports = { providerPackageKey, selectImportServices, toggleVisiblePackageSelection };
