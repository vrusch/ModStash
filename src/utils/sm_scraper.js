/**
 * SCRAPER VERSION: 2.0.0 (ScraperAPI Edition)
 * LAST UPDATED: 2026-02-22
 * * Vlastnosti:
 * - Zjednodušená logika spoléhající na Ultimate Bypass proxy (Vercel + ScraperAPI).
 * - Prodloužený timeout (30s) pro bezpečné dokončení ScraperAPI requestů přes rezidenční IP.
 * - Odstraněny nepotřebné fallbacky (ScraperAPI řeší rotaci IP samo).
 */

const SCRAPER_VERSION = "2.0.0";

async function fetchWithProxy(targetUrl) {
  console.log(
    `[Scalemates Scraper v${SCRAPER_VERSION}] Spouštím ScraperAPI bypass...`,
  );

  const encodedUrl = encodeURIComponent(targetUrl);

  // Tvoje Vercel proxy, která nyní obsahuje ScraperAPI logiku
  const proxyUrl = `https://mates-proxy.vercel.app/api/scrape?url=${encodedUrl}`;

  // ScraperAPI může trvat déle (rotace rezidenčních IP), dáváme velkorysý timeout 30 vteřin
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timer);

    // Pokud Vercel odpoví chybou 403, znamená to, že chybí API klíč nebo došel kredit
    if (response.status === 403) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(
        errData.error ||
          "Přístup odepřen: Zkontrolujte ScraperAPI klíč na Vercelu.",
      );
    }

    if (!response.ok) {
      throw new Error(`Chyba serveru: HTTP ${response.status}`);
    }

    const html = await response.text();

    // Poslední kontrola, zda se Akamai náhodou neprobojovalo (nepravděpodobné se ScraperAPI)
    if (
      html.includes("Access Denied") ||
      html.includes("edgesuite.net") ||
      html.length < 1000
    ) {
      throw new Error("I přes proxy byl přístup zablokován firewallem Akamai.");
    }

    console.log(`[Scraper v${SCRAPER_VERSION}] Úspěch! Data stažena.`);
    return html;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new Error(
        "Timeout: Stránka se načítala příliš dlouho (více než 30s).",
      );
    }
    throw new Error(`Scraping selhal: ${err.message}`);
  }
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

  try {
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

    // Parsování atributů listu
    const dl = doc.querySelectorAll("dl.dg dt");
    dl.forEach((dt) => {
      const label = dt.innerText.toLowerCase().replace(":", "").trim();
      const dd = dt.nextElementSibling;
      if (!dd || dd.tagName !== "DD") return;
      const val = dd.innerText.trim();

      if (["čárový kód", "ean", "barcode"].includes(label))
        data.ean = val.replace(/\D/g, "");
      else if (["značka", "brand"].includes(label)) data.brand = val;
      else if (["číslo", "number", "cat.no"].includes(label)) data.catNo = val;
      else if (["měřítko", "scale"].includes(label)) data.scale = val;
      else if (["status", "released", "vydáno", "rok"].includes(label)) {
        const yearMatch = val.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) data.year = yearMatch[0];
      }
    });

    // Procházení H3 sekcí (Značení, Návody, Marketplace)
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
        let htmlMarkings = '<div class="scalemates-markings">';
        nodes.forEach((n) => {
          htmlMarkings += n.outerHTML
            .replace(/href="\//g, 'href="https://www.scalemates.com/')
            .replace(/src="\//g, 'src="https://www.scalemates.com/');
        });
        htmlMarkings += "</div>";
        data.markingsHTML = htmlMarkings;
      }

      // Návody
      if (text.includes("instructions") || text.includes("návody")) {
        let node = h3.nextElementSibling;
        let isExact = true;
        while (node && node.tagName !== "H3") {
          if (
            node.innerText.includes(
              "We don't have the exact instruction sheets",
            )
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

      // Marketplace (Rychlé parsování - první fáze)
      if (text.includes("marketplace")) {
        data.marketplace = extractOffers(doc);
      }
    }

    // Fáze 2 - Pokus o načtení celého Marketplace
    const allLinks = Array.from(doc.querySelectorAll("a"));
    const showAllLink = allLinks.find((a) =>
      a.innerText.toLowerCase().includes("show all offers"),
    );

    if (showAllLink) {
      let showAllHref = showAllLink.getAttribute("href");
      if (showAllHref) {
        if (!showAllHref.startsWith("http"))
          showAllHref = "https://www.scalemates.com" + showAllHref;
        try {
          console.log(
            `[Scraper v${SCRAPER_VERSION}] Stahuji plný ceník přes Vercel...`,
          );
          // Použijeme znova stejnou proxy funkci na stažení plného ceníku
          const fullMarketHtml = await fetchWithProxy(showAllHref);
          const fullMarketDoc = parser.parseFromString(
            fullMarketHtml,
            "text/html",
          );
          const fullOffers = extractOffers(fullMarketDoc);
          if (fullOffers.length > 0) {
            data.marketplace = fullOffers;
          }
        } catch (e) {
          console.warn(
            `[Scraper v${SCRAPER_VERSION}] Nepodařilo se načíst detailní ceník, ponechávám základní.`,
          );
        }
      }
    }

    return data;
  } catch (err) {
    console.error(`[Scraper v${SCRAPER_VERSION}] Fatální chyba:`, err);
    throw err;
  }
}
