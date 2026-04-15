const url = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || "https://restopos.movilcomts.com";
const gaId = process.argv[3] || process.env.NEXT_PUBLIC_GA_ID || "G-LF12VPKQHN";

function printResult(name, ok, details = "") {
  const status = ok ? "OK" : "FAIL";
  const suffix = details ? ` - ${details}` : "";
  console.log(`${status}: ${name}${suffix}`);
}

async function main() {
  console.log(`Checking ${url} with GA ID ${gaId}`);

  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "ga-check/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} on ${url}`);
  }

  const html = await response.text();
  const csp = response.headers.get("content-security-policy") || "";

  const gaScriptOk = html.includes(`googletagmanager.com/gtag/js?id=${gaId}`);
  const gaConfigOk = html.includes(`gtag('config', '${gaId}')`) || html.includes(`gtag(\"config\", \"${gaId}\")`);
  const cspScriptOk = csp.includes("https://www.googletagmanager.com");
  const cspConnectOk = csp.includes("google-analytics.com") || csp.includes("googletagmanager.com");

  printResult("GA script present", gaScriptOk);
  printResult("GA config present", gaConfigOk);
  printResult("CSP allows GTM scripts", cspScriptOk);
  printResult("CSP allows GA/GTM connect", cspConnectOk);

  const allOk = gaScriptOk && gaConfigOk && cspScriptOk && cspConnectOk;

  if (!allOk) {
    console.log("\nRaw CSP:");
    console.log(csp || "(missing)");
    process.exit(1);
  }

  console.log("\nAll GA production checks passed.");
}

main().catch((error) => {
  console.error(`Error running GA check: ${error.message}`);
  process.exit(1);
});
