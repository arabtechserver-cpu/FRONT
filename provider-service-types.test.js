const assert = require("assert");
const fs = require("fs");

let serviceTypes = {};
try {
  serviceTypes = require("./src/lib/provider-service-types.js");
} catch {}

const getProviderServiceType = serviceTypes.getProviderServiceType || (() => "unknown");
const getProviderServiceTypeCounts =
  serviceTypes.getProviderServiceTypeCounts || (() => ({ all: 0, imei: 0, server: 0, remote: 0 }));
const filterProviderServicesByType =
  serviceTypes.filterProviderServicesByType || (() => []);

const services = [
  { id: "1", service_type: "imei" },
  { id: "2", category_name: "Server Service" },
  { id: "3", dhruCategory: { name: "Remote Service" } },
  { id: "4", service_type: "imei" },
  { id: "5", api_service_type: "remote", category_name: "IMEI Service" },
  { id: "6", service_type: "topups" },
  { id: "7", service_type: "appstores" },
  { id: "8", service_type: "gamecodes" },
  { id: "9", service_type: "subscriptions" },
  { id: "10", service_type: "esim" }
];

assert.equal(getProviderServiceType(services[0]), "imei");
assert.equal(getProviderServiceType(services[1]), "server");
assert.equal(getProviderServiceType(services[2]), "remote");
assert.equal(getProviderServiceType(services[4]), "remote");
assert.equal(getProviderServiceType(services[5]), "topups");
assert.equal(getProviderServiceType(services[6]), "appstores");
assert.equal(getProviderServiceType(services[7]), "gamecodes");
assert.equal(getProviderServiceType(services[8]), "subscriptions");
assert.equal(getProviderServiceType(services[9]), "esim");
assert.deepEqual(getProviderServiceTypeCounts(services), {
  all: 10,
  imei: 2,
  server: 1,
  remote: 2,
  topups: 1,
  appstores: 1,
  gamecodes: 1,
  subscriptions: 1,
  esim: 1
});
assert.deepEqual(
  filterProviderServicesByType(services, "imei").map((service) => service.id),
  ["1", "4"]
);
assert.equal(filterProviderServicesByType(services, "all").length, 10);

const providersClient = fs.readFileSync(
  "src/app/(admin)/admin/(dashboard)/providers/ProvidersClient.tsx",
  "utf8"
);
assert.doesNotMatch(
  providersClient,
  /service_types|اختر الأقسام التي تريد جلبها/,
  "Provider sync must fetch and classify all API service types automatically"
);

console.log("provider service type tests passed");
