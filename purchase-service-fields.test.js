const assert = require("assert");
const { shouldShowDefaultImeiField } = require("./src/lib/purchase-service-fields.js");

assert.equal(shouldShowDefaultImeiField("IMEI Service", null), true);
assert.equal(shouldShowDefaultImeiField("IMEI Service", {}), true);
assert.equal(
  shouldShowDefaultImeiField("IMEI Service", { custom_PlayerID: { label: "PlayerID", required: true } }),
  false
);
assert.equal(shouldShowDefaultImeiField("Server Service", null), false);
assert.equal(shouldShowDefaultImeiField("Remote Service", null), false);

// Secondary custom fields (like Battery Picture Link) MUST NOT hide the default IMEI / Serial field!
assert.equal(
  shouldShowDefaultImeiField("IMEI Service", {
    "custom_Battery Picture Link": {
      fieldname: "Battery Picture Link",
      type: "text",
      required: true
    }
  }),
  true
);

// Another secondary field (Current Country)
assert.equal(
  shouldShowDefaultImeiField("IMEI Service", {
    "custom_Current Country": {
      fieldname: "Current Country",
      type: "text",
      required: true
    }
  }),
  true
);

// When provider ALREADY sends an explicit SN or IMEI custom field, DO NOT duplicate default IMEI input
assert.equal(
  shouldShowDefaultImeiField("IMEI Service", {
    "custom_SN": {
      fieldname: "SN",
      type: "text",
      required: true
    }
  }),
  false
);

// Xiaomi Remove Mi Account and lock code services must NOT show duplicate default IMEI input
assert.equal(
  shouldShowDefaultImeiField("IMEI Service", {
    "LOCK CODE": {
      fieldname: "LOCK CODE",
      label: "LOCK CODE",
      type: "text",
      required: true
    }
  }),
  false
);

assert.equal(
  shouldShowDefaultImeiField("IMEI Service", {
    "Lock Code": {
      fieldname: "custom_Lock Code",
      reqid: "Lock Code",
      type: "text",
      required: true
    }
  }),
  false
);

assert.equal(
  shouldShowDefaultImeiField("IMEI Service", {
    "custom_lock": {
      fieldname: "custom_lock",
      label: "رمز القفل",
      type: "text",
      required: true
    }
  }),
  false
);

// If service has BOTH secondary picture and primary LOCK CODE, do not show default IMEI
assert.equal(
  shouldShowDefaultImeiField("IMEI Service", {
    "Mi Lock Code Screen Picture": {
      fieldname: "custom_Mi Lock Code Screen Picture",
      type: "text",
      required: true
    },
    "LOCK CODE": {
      fieldname: "custom_LOCK CODE",
      type: "text",
      required: true
    }
  }),
  false
);

console.log("purchase service field tests passed");


// Stored provider action wins over misleading category/group labels.
assert.equal(shouldShowDefaultImeiField("IMEI Service", null, "server", "IMEI Tools"), false);
assert.equal(shouldShowDefaultImeiField("IMEI Service", null, "remote"), false);
assert.equal(shouldShowDefaultImeiField("Server Service", null, "imei"), true);
