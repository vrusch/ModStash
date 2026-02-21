/**
 * SCRAPER VERSION: 1.1.0
 * LAST UPDATED: 2026-02-21 23:15
 * * Vlastnosti:
 * - Ultra-resistentní kaskáda proxy (AllOrigins Raw, CodeTabs, Vercel, CorsProxy)
 * - Diagnostický výpis verze do konzole
 * - Oprava timeoutů a abort signálů
 * - Kompletní parsování (Markings, Marketplace, Instructions)
 */

const SCRAPER_VERSION = "1.1.0";

// --- POMOCNÉ FUNKCE ---

async function fetchWithProxy(targetUrl) {
  console.log(
    `[Scalemates Scraper v${SCRAPER_VERSION}] Inicializace stahování...`,
  );
  const encodedUrl = encodeURIComponent(targetUrl);

  // Zpřísněná detekce blokace
  const isBlocked = (text) => {
    if (!text || text.length < 500) return true; // Podezřele krátká odpověď je většinou error
    const lowerText = text.toLowerCase();
    return (
      lowerText.includes("errors.edgesuite.net") ||
      lowerText.includes("access denied") ||
      lowerText.includes("cloudflare") ||
      lowerText.includes("robot check") ||
      lowerText.includes("permission to access") ||
      lowerText.includes("was blocked")
    );
  };

  const fetchVia = async (proxyUrl, name, timeoutMs = 15000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(proxyUrl, {
        signal: controller.signal,
        cache: "no-cache",
      });
      clearTimeout(timer);

      if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);

      let text = "";
      const contentType = response.headers.get("content-type");

      // AllOrigins JSON wrapper vs Raw HTML
      if (contentType && contentType.includes("application/json")) {
        const json = await response.json();
        text = json.contents || json.data || "";
      } else {
        text = await response.text();
      }

      if (isBlocked(text)) {
        throw new Error(`${name}: Blokováno ochranou webu`);
      }
      return text;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError")
        throw new Error(`${name}: Timeout (překročen limit 15s)`);
      throw err;
    }
  };

  // SEZNAM PROXY
  const proxies = [
    {
      name: "AllOrigins Raw",
      url: `https://api.allorigins.win/raw?url=${encodedUrl}`,
    },
    {
      name: "CodeTabs",
      url: `https://api.codetabs.com/v1/proxy?quest=${encodedUrl}`,
    },
    {
      name: "AllOrigins JSON",
      url: `https://api.allorigins.win/get?url=${encodedUrl}`,
    },
    {
      name: "Vercel Proxy",
      url: `https://mates-proxy.vercel.app/api/scrape?url=${encodedUrl}`,
    },
    { name: "CorsProxy.io", url: `https://corsproxy.io/?${encodedUrl}` },
  ];

  let errors = [];

  for (const p of proxies) {
    try {
      console.log(`[Scraper v${SCRAPER_VERSION}] Zkouším ${p.name}...`);
      return await fetchVia(p.url, p.name);
    } catch (e) {
      errors.push(e.message);
      console.warn(`[Scraper v${SCRAPER_VERSION}] ${e.message}`);
    }
  }

  throw new Error(
    `Scalemates blokuje přístup. Verze scraperu: ${SCRAPER_VERSION}. Vyzkoušeno 5 cest, všechny selhaly: ${errors.join(" | ")}`,
  );
}

function extractOffers(doc) {
  const offersList = [];
  const offerElements = doc.querySelectorAll("a.tsr");
  offerElements.forEach((offer) => {
    const logoImg = offer.querySelector("img.mpi");
    let shopName = logoImg ? logoImg.alt.replace("Logo ", "") : "";
    if (!shopName) shopName = offer.title.replace("Order now at ", "");
    const origPriceDiv = offer.querySelector("div.mpt");
    const origPrice = origPriceDiv ? origPriceDiv.innerText.trim() : "";
    const convPriceSpan = offer.querySelector("span.ut");
    const convPrice = convPriceSpan ? convPriceSpan.innerText.trim() : "";
    const statusSpan = offer.querySelector("span.bn");
    const status = statusSpan ? statusSpan.innerText.trim() : "";
    let link = offer.getAttribute("href");
    if (link && !link.startsWith("http"))
      link = "https://www.scalemates.com" + link;
    const displayPrice = convPrice || origPrice;
    if (shopName) {
      const exists = offersList.some(
        (o) => o.shopName === shopName && o.price === displayPrice,
      );
      if (!exists)
        offersList.push({
          shopName,
          price: displayPrice,
          status,
          shopUrl: link,
        });
    }
  });
  return offersList;
}

// --- HLAVNÍ EXPORTOVANÁ FUNKCE ---

export async function scrapeScalemates(urlToScrape) {
  if (!urlToScrape) return null;

  const html = await fetchWithProxy(urlToScrape);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const data = {
    scraperVersion: SCRAPER_VERSION,
    title: doc.querySelector("h1")?.innerText || "",
    imageSrc: "",
    brand: "",
    catNo: "",
    scale: "",
    year: "",
    ean: "",
    instructionUrl: "",
    instructionIsExact: true,
    markingsHTML: "",
    marketplace: [],
    url: urlToScrape,
  };

  // Základní metadata
  const img = doc.querySelector('meta[property="og:image"]');
  if (img) {
    let src = img.getAttribute("content");
    if (src && !src.startsWith("http"))
      src = "https://www.scalemates.com" + src;
    data.imageSrc = src;
  }

  const h2 = doc.querySelector("h2");
  if (h2) {
    const parts = h2.innerText.split("|").map((t) => t.trim());
    if (parts[0]) data.brand = parts[0];
    if (parts[1])
      data.catNo = parts[1].replace(/^(No\.|Č\.|Cat\.|Ref\.)\s*/i, "");
    if (parts[2]) data.scale = parts[2];
  }

  // Procházení sekcí
  const h3s = doc.querySelectorAll("h3");
  for (const h3 of h3s) {
    const text = h3.innerText.toLowerCase();

    // Značení
    if (text.includes("markings") || text.includes("značení")) {
      let node = h3.nextElementSibling;
      let nodes = [];
      while (
        node &&
        node.tagName !== "H3" &&
        (!node.className || !node.className.includes("line"))
      ) {
        nodes.push(node);
        node = node.nextElementSibling;
      }
      let html = '<div class="scalemates-markings">';
      nodes.forEach((n) => {
        html += n.outerHTML
          .replace(/href="\//g, 'href="https://www.scalemates.com/')
          .replace(/src="\//g, 'src="https://www.scalemates.com/');
      });
      html += "</div>";
      data.markingsHTML = html;
    }

    // Návody
    if (text.includes("instructions") || text.includes("návody")) {
      let node = h3.nextElementSibling;
      let isExact = true;
      while (node && node.tagName !== "H3") {
        if (
          node.innerText.includes("We don't have the exact instruction sheets")
        )
          isExact = false;
        const link = node.querySelector("a");
        if (
          link &&
          (link.innerText.includes("Download") ||
            link.innerText.includes("Stáhnout"))
        ) {
          let href = link.getAttribute("href");
          data.instructionUrl = href.startsWith("http")
            ? href
            : "https://www.scalemates.com" + href;
          data.instructionIsExact = isExact;
          break;
        }
        node = node.nextElementSibling;
      }
    }

    // Marketplace
    if (text.includes("marketplace")) {
      data.marketplace = extractOffers(doc);
    }
  }

  return data;
}
