/**
 * Finální Scraper pro Scalemates (Samostatný modul)
 * * Vlastnosti:
 * - Využívá vlastní Vercel Proxy (obchází 403 Access Denied na mobilech)
 * - Kompletní Marketplace (automaticky stahuje "Show all offers")
 * - Inteligentní parsování Značení (HTML obalené v <div> se zachovanými styly)
 * - Získání základních dat a návodů (PDF) včetně detekce, zda jde o přesný návod.
 */

// --- POMOCNÉ FUNKCE ---

async function fetchWithProxy(targetUrl) {
  const encodedUrl = encodeURIComponent(targetUrl);

  // Funkce pro detekci blokace (Akamai/Cloudflare)
  const isBlocked = (text) => {
    if (!text) return true;
    const lowerText = text.toLowerCase();
    return (
      lowerText.includes("errors.edgesuite.net") ||
      lowerText.includes("access denied") ||
      lowerText.includes("cloudflare")
    );
  };

  // Helper pro paralelní stažení s timeoutem 8 vteřin
  const fetchVia = async (proxyUrl, timeoutMs = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(id);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      let text = await response.text();

      // Kontrola, zda nám proxy nevrátila chybovou stránku ochrany
      if (isBlocked(text) || text.includes('{"error"')) {
        throw new Error("Zablokováno ochranou");
      }
      return text;
    } catch (err) {
      clearTimeout(id);
      throw err; // Vyhození chyby řekne Promise.any, ať tento pokus ignoruje
    }
  };

  // Vystřelíme všechny 4 požadavky NAJEDNOU (Paralelně)
  // Používáme allorigins.win/raw, což vrací čisté HTML a je bleskurychlé
  const proxies = [
    fetchVia(`https://api.allorigins.win/raw?url=${encodedUrl}`),
    fetchVia(`https://corsproxy.io/?${encodedUrl}`),
    fetchVia(`https://api.codetabs.com/v1/proxy?quest=${encodedUrl}`),
    fetchVia(`https://mates-proxy.vercel.app/api/scrape?url=${encodedUrl}`),
  ];

  try {
    // Promise.any vezme ten PRVNÍ úspěšný výsledek. Zkrátí to čas na 1-3 vteřiny!
    const html = await Promise.any(proxies);
    return html;
  } catch (aggregateError) {
    // Pokud selžou úplně všechny (odchyceno z Promise.any)
    throw new Error(
      "Nepodařilo se stáhnout data. Zkontrolujte URL nebo to zkuste později.",
    );
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
    const subPrice = convPrice ? origPrice : "";

    if (shopName) {
      const exists = offersList.some(
        (o) => o.shopName === shopName && o.price === displayPrice,
      );
      if (!exists) {
        offersList.push({
          shopName,
          price: displayPrice,
          subPrice,
          status,
          shopUrl: link,
        });
      }
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
    title: doc.querySelector("h1")?.innerText || "",
    imageSrc: "",
    brand: "",
    catNo: "",
    scale: "",
    year: "",
    ean: "",
    instructionUrl: "",
    instructionIsExact: true, // Příznak, zda je to přesný návod
    markingsHTML: "",
    marketplace: [],
    url: urlToScrape,
  };

  // --- ZÁKLADNÍ DATA ---
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

  // --- PROCHÁZENÍ H3 SEKCÍ ---
  const h3s = doc.querySelectorAll("h3");
  for (const h3 of h3s) {
    const text = h3.innerText.toLowerCase();

    // 1. Návody / Instructions
    if (text.includes("instructions") || text.includes("návody")) {
      let node = h3.nextElementSibling;
      let isExact = true; // Výchozí předpoklad je přesný návod

      while (node && node.tagName !== "H3") {
        // Detekce náhradního návodu
        if (
          node.innerText.includes("We don't have the exact instruction sheets")
        ) {
          isExact = false;
        }

        const downloadLink = node.querySelector("a");
        if (
          downloadLink &&
          (downloadLink.innerText.includes("Download") ||
            downloadLink.innerText.includes("Stáhnout"))
        ) {
          let pdfUrl = downloadLink.getAttribute("href");
          if (pdfUrl) {
            if (!pdfUrl.startsWith("http"))
              pdfUrl = "https://www.scalemates.com" + pdfUrl;
            data.instructionUrl = pdfUrl;
            data.instructionIsExact = isExact; // Uložíme zjištěný stav
            break; // Máme návod, můžeme jít na další sekci
          }
        }
        node = node.nextElementSibling;
      }
    }

    // 2. Marketplace (Fáze 1)
    if (text.includes("marketplace")) {
      let node = h3.nextElementSibling;
      while (node && node.tagName !== "H3") {
        if (node.tagName === "SECTION") {
          data.marketplace = extractOffers(doc);
        }
        node = node.nextElementSibling;
      }
    }

    // 3. Značení / Markings
    if (text.includes("značení") || text.includes("markings")) {
      let node = h3.nextElementSibling;
      let nodesToProcess = [];

      // Nasbíráme vše do konce sekce (nebo do oddělovače line)
      while (
        node &&
        node.tagName !== "H3" &&
        (!node.className || !node.className.includes("line"))
      ) {
        nodesToProcess.push(node);
        node = node.nextElementSibling;
      }

      // Najdeme poslední UL
      let lastUlIndex = -1;
      for (let i = nodesToProcess.length - 1; i >= 0; i--) {
        if (nodesToProcess[i].tagName === "UL") {
          lastUlIndex = i;
          break;
        }
      }

      // Ořízneme po poslední UL (nebo vezmeme vše, pokud chybí)
      const finalNodes =
        lastUlIndex !== -1
          ? nodesToProcess.slice(0, lastUlIndex + 1)
          : nodesToProcess;

      // Slepíme HTML a obalíme to do DIVu pro bezpečné vložení
      let capturedHTML = '<div class="scalemates-markings">';
      finalNodes.forEach((n) => {
        if (n.outerHTML) {
          capturedHTML += n.outerHTML
            .replace(/href="\//g, 'href="https://www.scalemates.com/')
            .replace(/src="\//g, 'src="https://www.scalemates.com/');
        }
      });
      capturedHTML += "</div>";

      data.markingsHTML = capturedHTML;
    }
  }

  // --- MARKETPLACE (Fáze 2 - Kompletní seznam) ---
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
        console.warn("Nepodařilo se načíst detailní ceník, vracím základní.");
      }
    }
  }

  return data;
}
