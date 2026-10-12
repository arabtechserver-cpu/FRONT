async function check() {
  try {
    const res = await fetch("https://borai.store/api/dhru/services?all=true");
    const data = await res.json();
    let totalServices = 0;
    data.forEach(c => {
      totalServices += (c.services || []).length;
    });
    console.log("Categories:", data.length);
    console.log("Total Services:", totalServices);
  } catch(e) {
    console.error("Error:", e);
  }
}
check();
