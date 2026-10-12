function categoryMatchesFilter(categoryName, filter) {
  if (!filter || filter === "all") return true;
  const name = String(categoryName || "").toLowerCase();
  const f = String(filter || "").toLowerCase().trim();

  if (f === "imei") {
    return name.includes("imei") || name.includes("اي مي") || name.includes("ايمي");
  }
  if (f === "server") {
    return name.includes("server") || name.includes("سيرفر") || name.includes("خادم");
  }
  if (f === "remote") {
    return name.includes("remote") || name.includes("عن بعد") || name.includes("تحكم");
  }

  return name.includes(f);
}

function sortDisplayGroups(groups) {
  return [...groups].sort((first, second) =>
    first.groupName.localeCompare(second.groupName, "en", { sensitivity: "base" })
  );
}

function createInitialCollapsedGroups(groups) {
  return groups.reduce((collapsed, group, index) => {
    collapsed[group.groupName] = index !== 0;
    return collapsed;
  }, {});
}

module.exports = { categoryMatchesFilter, createInitialCollapsedGroups, sortDisplayGroups };
