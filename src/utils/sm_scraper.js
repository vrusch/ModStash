/**
 * SCRAPER VERSION: 1.5.0
 * LAST UPDATED: 2026-02-22 10:15
 * * Vlastnosti:
 * - Robustní kaskáda s detekcí úspěchu
 * - Optimalizace pro produkční Vercel i localhost
 * - Inteligentní timeout a retry logika
 */

const SCRAPER_VERSION = "1.5.0";

async function fetchWithProxy(targetUrl) {
  console.log(`[Scalemates Scraper v${SCRAPER_VERSION}] Spouštím...`);

  const isBlocked = (text) => {
    if (!text || text.length < 2000) return true;
    const lower = text.toLowerCase();
    return lower.includes("access denied") || lower.includes("edgesuite.net");
  };

  const fetchVia = async (proxyUrl, name, isJson = false) => {
    try {
      const response = await fetch(proxyUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      let html = "";
      if (isJson) {
        const json = await response.json();
        html = json.contents || "";
      } else {
        html = await response.text();
      }

      if (!isBlocked(html)) return html;
      throw new Error("Blokováno firewallem");
    } catch (e) {
      throw new Error(`${name}: ${e.message}`);
    }
  };

  // Definice cest (postupně od nejúspěšnější)
  const encodedUrl = encodeURIComponent(
    targetUrl + (targetUrl.includes("?") ? "&" : "?") + `_v=${SCRAPER_VERSION}`,
  );

  const strategy = [
    {
      name: "AllOrigins JSON",
      url: `https://api.allorigins.win/get?url=${encodedUrl}`,
      isJson: true,
    },
    {
      name: "Vercel Stealth",
      url: `https://mates-proxy.vercel.app/api/scrape?url=${encodedUrl}`,
      isJson: false,
    },
    {
      name: "CodeTabs",
      url: `https://api.codetabs.com/v1/proxy?quest=${encodedUrl}`,
      isJson: false,
    },
  ];

  let errors = [];
  for (const step of strategy) {
    try {
      console.log(`[Scraper v${SCRAPER_VERSION}] Zkouším ${step.name}...`);
      const result = await fetchVia(step.url, step.name, step.isJson);
      console.log(`[Scraper v${SCRAPER_VERSION}] Úspěch přes ${step.name}`);
      return result;
    } catch (e) {
      errors.push(e.message);
      console.warn(`[Scraper v${SCRAPER_VERSION}] ${e.message}`);
      // Počkej 1 sekundu před dalším pokusem
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  throw new Error(
    `Scalemates blokuje přístup (v${SCRAPER_VERSION}). Detaily: ${errors.join(" | ")}`,
  );
}

// --- PARSOVÁNÍ (Zůstává stejné jako ve v1.4.0) ---

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

  // Markings, Marketplace, Instructions logic...
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
      let h = '<div class="scalemates-markings">';
      nodes.forEach(
        (n) =>
          (h += n.outerHTML
            .replace(/href="\//g, 'href="https://www.scalemates.com/')
            .replace(/src="\//g, 'src="https://www.scalemates.com/')),
      );
      h += "</div>";
      data.markingsHTML = h;
    }
    if (text.includes("instructions") || text.includes("návody")) {
      let node = h3.nextElementSibling;
      let exact = true;
      while (node && node.tagName !== "H3") {
        if (
          node.innerText.includes("We don't have the exact instruction sheets")
        )
          exact = false;
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
          data.instructionIsExact = exact;
          break;
        }
        node = node.nextElementSibling;
      }
    }
    if (text.includes("marketplace")) {
      const offers = [];
      doc.querySelectorAll("a.tsr").forEach((offer) => {
        const logo = offer.querySelector("img.mpi");
        let name = logo
          ? logo.alt.replace("Logo ", "")
          : offer.title.replace("Order now at ", "");
        const p1 = offer.querySelector("div.mpt")?.innerText.trim() || "";
        const p2 = offer.querySelector("span.ut")?.innerText.trim() || "";
        const price = p2 || p1;
        let link = offer.getAttribute("href");
        if (link && !link.startsWith("http"))
          link = "https://www.scalemates.com" + link;
        if (
          name &&
          !offers.some((o) => o.shopName === name && o.price === price)
        ) {
          offers.push({
            shopName: name,
            price,
            status: offer.querySelector("span.bn")?.innerText.trim() || "",
            shopUrl: link,
          });
        }
      });
      data.marketplace = offers;
    }
  }
  return data;
}
