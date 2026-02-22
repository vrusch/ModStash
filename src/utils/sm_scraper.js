/**
 * SCRAPER VERSION: 1.3.0
 * LAST UPDATED: 2026-02-21 23:55
 * * Vlastnosti:
 * - Ultra-resistentní kaskáda (Vercel Stealth, AllOrigins, CodeTabs)
 * - Cache-busting na úrovni protokolu
 * - Automatická rotace proxy při detekci "Access Denied"
 */

const SCRAPER_VERSION = "1.3.0";

async function fetchWithProxy(targetUrl) {
  console.log(`[Scalemates Scraper v${SCRAPER_VERSION}] Inicializace...`);

  // Cache buster zabrání Akamai, aby nás "poznalo" podle předchozí zablokované session
  const cacheBuster = `_z=${Math.random().toString(36).substring(7)}`;
  const finalTarget =
    targetUrl + (targetUrl.includes("?") ? "&" : "?") + cacheBuster;
  const encodedUrl = encodeURIComponent(finalTarget);

  const isBlocked = (text) => {
    if (!text || text.length < 1000) return true;
    const lowerText = text.toLowerCase();
    return (
      lowerText.includes("access denied") ||
      lowerText.includes("edgesuite.net") ||
      lowerText.includes("robot check")
    );
  };

  const proxies = [
    {
      name: "Vercel Stealth",
      url: `https://mates-proxy.vercel.app/api/scrape?url=${encodedUrl}`,
      isJson: false,
    },
    {
      name: "AllOrigins JSON",
      url: `https://api.allorigins.win/get?url=${encodedUrl}`,
      isJson: true,
    },
    {
      name: "CodeTabs",
      url: `https://api.codetabs.com/v1/proxy?quest=${encodedUrl}`,
      isJson: false,
    },
  ];

  let lastError = "";

  for (const p of proxies) {
    try {
      console.log(`[Scraper v${SCRAPER_VERSION}] Zkouším ${p.name}...`);
      const response = await fetch(p.url, { cache: "no-store" });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      let html = "";
      if (p.isJson) {
        const json = await response.json();
        html = json.contents || "";
      } else {
        html = await response.text();
      }

      if (!isBlocked(html)) {
        console.log(`[Scraper v${SCRAPER_VERSION}] Úspěch přes ${p.name}`);
        return html;
      }
      throw new Error("Blokováno");
    } catch (e) {
      lastError = e.message;
      console.warn(
        `[Scraper v${SCRAPER_VERSION}] ${p.name} selhal: ${e.message}`,
      );
    }
  }

  throw new Error(
    `Scalemates blokuje přístup. Vyzkoušeno vše. Poslední chyba: ${lastError}`,
  );
}

// ... (zbytek funkcí extractOffers a scrapeScalemates zůstává stejný jako ve v1.2.0) ...

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

  const h3s = doc.querySelectorAll("h3");
  for (const h3 of h3s) {
    const text = h3.innerText.toLowerCase();
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
    if (text.includes("marketplace")) {
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
      data.marketplace = offersList;
    }
  }

  return data;
}
