import React, { useState } from "react";
import {
  Box,
  ExternalLink,
  Search,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  ImageOff,
} from "lucide-react";
import { FloatingInput, FloatingTextarea } from "../../ui/FormElements";
import { Normalizer } from "../../../utils/normalizers";
import { scrapeScalemates } from "../../../utils/sm_scraper";
import KIT_BRANDS from "../../../data/brands-kits.json";

const COMMON_SCALES = [
  "1/6",
  "1/9",
  "1/12",
  "1/16",
  "1/24",
  "1/32",
  "1/35",
  "1/48",
  "1/72",
  "1/76",
  "1/100",
  "1/144",
  "1/200",
  "1/350",
  "1/700",
];

const KitInfoTab = ({ data, setData, projects }) => {
  const [isScraping, setIsScraping] = useState(false);
  const [showMarkings, setShowMarkings] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);

  const isScaleValid = (s) => !s || /^\d+\/\d+$/.test(s);

  // Validace výrobce: Varování, pokud není v seznamu (a není prázdný)
  const isUnknownBrand =
    data.brand &&
    data.brand.length > 1 &&
    !KIT_BRANDS.some((b) => b.toLowerCase() === data.brand.toLowerCase());

  // Validace měřítka: Varování, pokud není v seznamu běžných (ale formát je OK)
  const isUnknownScale =
    data.scale &&
    data.scale.length > 0 &&
    isScaleValid(data.scale) &&
    !COMMON_SCALES.includes(data.scale);

  const handleScrape = async () => {
    if (!data.scalematesUrl) return;
    setIsScraping(true);
    try {
      const scraped = await scrapeScalemates(data.scalematesUrl);
      if (scraped) {
        setData((prev) => ({
          ...prev,
          brand: Normalizer.brand(scraped.brand) || prev.brand,
          catNum: Normalizer.code(scraped.catNo) || prev.catNum,
          scale: scraped.scale ? scraped.scale.replace(":", "/") : prev.scale,
          subject: Normalizer.brand(scraped.title) || prev.subject,
          image: scraped.imageSrc || prev.image,
          year: scraped.year || prev.year,
          ean: scraped.ean || prev.ean,
          markings: scraped.instructionIsExact
            ? scraped.markingsHTML || prev.markings
            : prev.markings,
          marketplace: scraped.marketplace || prev.marketplace,
          notes: !scraped.instructionIsExact
            ? (prev.notes ? prev.notes + "\n\n" : "") +
              "⚠️ POZOR: Stažený návod není přesně pro tuto krabici (Scalemates nenašel přesnou shodu)."
            : prev.notes,
          attachments:
            scraped.instructionUrl &&
            !prev.attachments?.some((a) => a.url === scraped.instructionUrl)
              ? [
                  ...(prev.attachments || []),
                  {
                    id: Date.now(),
                    name: scraped.instructionIsExact
                      ? "Návod (Scalemates)"
                      : "Návod (Pouze podobný!)",
                    url: scraped.instructionUrl,
                    type: "manual",
                  },
                ]
              : prev.attachments,
        }));
      }
    } catch (error) {
      console.error("Scraping error:", error);
      alert(
        "Nepodařilo se stáhnout data. Zkontrolujte URL nebo to zkuste později.",
      );
    } finally {
      setIsScraping(false);
    }
  };

  const handleBrandChange = (e) => {
    const val = e.target.value;
    // Ponecháme normalizaci pro ruční psaní, ale našeptávač nabídne správný tvar z JSONu
    setData({ ...data, brand: Normalizer.brand(val) });

    if (val.length > 0) {
      const lowerVal = val.toLowerCase();
      const matches = KIT_BRANDS.filter((b) =>
        b.toLowerCase().includes(lowerVal),
      )
        .sort((a, b) => {
          const aStarts = a.toLowerCase().startsWith(lowerVal);
          const bStarts = b.toLowerCase().startsWith(lowerVal);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.localeCompare(b);
        })
        .slice(0, 8); // Max 8 návrhů
      setBrandSuggestions(matches);
      setShowBrandSuggestions(matches.length > 0);
    } else {
      setShowBrandSuggestions(false);
    }
  };

  const selectBrand = (brand) => {
    setData({ ...data, brand });
    setShowBrandSuggestions(false);
  };

  return (
    <div className="space-y-4 p-4">
      {/* HLAVIČKA: OBRÁZEK A ZÁKLADNÍ DATA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-32 shrink-0">
          {data.image ? (
            <img
              src={data.image}
              alt="Boxart"
              className="w-full rounded-lg shadow-md border border-slate-700 object-cover"
            />
          ) : (
            <div className="w-full h-32 sm:h-full min-h-[8rem] bg-slate-800/50 rounded-lg border-2 border-slate-700 border-dashed flex items-center justify-center text-slate-600">
              <ImageOff size={32} className="opacity-50" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 sm:flex gap-3">
            <div className="col-span-2 sm:flex-1 relative">
              <FloatingInput
                className="w-full"
                label="Výrobce *"
                value={data.brand}
                onChange={handleBrandChange}
                onFocus={(e) => {
                  if (e.target.value) handleBrandChange(e);
                }}
                onBlur={() =>
                  setTimeout(() => setShowBrandSuggestions(false), 200)
                }
                placeholder="Kinetic"
                labelColor={
                  isUnknownBrand ? "text-yellow-500" : "text-blue-400"
                }
                classNameInput={isUnknownBrand ? "border-yellow-500/50" : ""}
                autoComplete="off"
              />
              {showBrandSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-slate-800 border border-slate-600 rounded-lg mt-1 z-50 shadow-xl max-h-48 overflow-y-auto animate-in fade-in zoom-in-95">
                  {brandSuggestions.map((brand) => (
                    <div
                      key={brand}
                      onClick={() => selectBrand(brand)}
                      className="p-2 hover:bg-blue-600/20 hover:text-blue-300 cursor-pointer text-xs text-slate-300 border-b border-slate-700/50 last:border-0 transition-colors"
                    >
                      {brand}
                    </div>
                  ))}
                </div>
              )}
              {isUnknownBrand && !showBrandSuggestions && (
                <div className="absolute top-full left-0 mt-1 text-[10px] text-yellow-500 font-bold animate-in fade-in z-10 pointer-events-none">
                  ⚠️ Neznámý výrobce
                </div>
              )}
            </div>
            <div className="col-span-1 sm:w-20 relative">
              <FloatingInput
                className="w-full"
                label="Měřítko *"
                value={data.scale}
                onChange={(e) => setData({ ...data, scale: e.target.value })}
                onFocus={(e) =>
                  !data.scale && setData({ ...data, scale: "1/" })
                }
                placeholder="1/48"
                labelColor={
                  !isScaleValid(data.scale)
                    ? "text-red-500"
                    : isUnknownScale
                      ? "text-yellow-500"
                      : "text-blue-400"
                }
                classNameInput={
                  !isScaleValid(data.scale)
                    ? "border-red-500"
                    : isUnknownScale
                      ? "border-yellow-500/50"
                      : ""
                }
                list="common-scales"
              />
              {isUnknownScale && (
                <div className="absolute top-full left-0 mt-1 text-[10px] text-yellow-500 font-bold animate-in fade-in z-10 pointer-events-none whitespace-nowrap">
                  ⚠️ Atypické
                </div>
              )}
            </div>
            <FloatingInput
              className="col-span-1 sm:w-24"
              label="Kat. č."
              value={data.catNum}
              onChange={(e) =>
                setData({ ...data, catNum: Normalizer.code(e.target.value) })
              }
              placeholder="48000"
            />
            <FloatingInput
              className="col-span-1 sm:w-20"
              label="Rok"
              value={data.year || ""}
              onChange={(e) => setData({ ...data, year: e.target.value })}
              placeholder="2024"
            />
          </div>
          <FloatingInput
            className="w-full"
            label="Název *"
            value={data.subject || ""}
            onChange={(e) =>
              setData({ ...data, subject: Normalizer.brand(e.target.value) })
            }
            placeholder="TF-104G"
            labelColor="text-blue-400"
          />
          <p className="text-[10px] text-blue-400/60 font-bold leading-tight">
            * Povinné údaje. Bez vyplnění Výrobce, Měřítka a Názvu nebude
            fungovat vyhledávání na Scalemates.
          </p>
        </div>
      </div>

      {/* SCALEMATES INTEGRATION */}
      <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
            <img
              src="https://www.scalemates.com/favicon.ico"
              alt="SM"
              className="w-3 h-3 opacity-50 grayscale"
            />
            Scalemates Integrace
          </h4>
          {data.scalematesUrl && (
            <a
              href={data.scalematesUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
            >
              Otevřít <ExternalLink size={10} />
            </a>
          )}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-colors"
            placeholder="Vložte URL kitu ze Scalemates..."
            value={data.scalematesUrl || ""}
            onChange={(e) =>
              setData({ ...data, scalematesUrl: e.target.value })
            }
          />
          <button
            onClick={() => {
              const query = data.catNum
                ? `${data.brand} ${data.catNum}`
                : `${data.brand} ${data.subject} ${data.scale}`;
              window.open(
                `https://www.scalemates.com/search.php?q=${encodeURIComponent(query)}`,
                "_blank",
              );
            }}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded border border-slate-600 transition-colors"
            title="Najít na Scalemates (otevře nové okno)"
          >
            <Search size={16} />
          </button>
          <button
            onClick={handleScrape}
            disabled={!data.scalematesUrl || isScraping}
            className={`p-2 rounded border flex items-center gap-2 transition-all ${
              data.scalematesUrl
                ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-lg shadow-blue-900/20"
                : "bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed"
            }`}
            title="Načíst data (Scraper)"
          >
            {isScraping ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Status</label>
          <select
            value={data.status}
            onChange={(e) => setData({ ...data, status: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none"
          >
            <option value="new">📦 Skladem</option>
            <option value="wip">🚧 Rozestavěno</option>
            <option value="finished">🏆 Hotovo</option>
            <option value="wishlist">🛒 Chci koupit</option>
            <option value="scrap">♻️ Vrakoviště</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Projekt</label>
          <select
            value={data.projectId || ""}
            onChange={(e) =>
              setData({ ...data, projectId: e.target.value || null })
            }
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none"
          >
            <option value="">-- Žádný --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MARKINGS (Varianty) */}
      <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/30">
        <button
          onClick={() => setShowMarkings(!showMarkings)}
          className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <span>Varianty zbarvení (Markings)</span>
          {showMarkings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showMarkings && (
          <div className="p-3 text-xs text-slate-400 border-t border-slate-700 bg-slate-900/50">
            {data.markings ? (
              <div
                className="scalemates-content space-y-1"
                dangerouslySetInnerHTML={{ __html: data.markings }}
              />
            ) : (
              <p className="italic opacity-50">
                Žádné varianty. (Zde bude možné přidat vlastní nebo AI
                generované)
              </p>
            )}
          </div>
        )}
      </div>

      {/* MARKETPLACE (Ceny) */}
      <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/30">
        <button
          onClick={() => setShowMarketplace(!showMarketplace)}
          className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <span>Tržiště / Ceny ({data.marketplace?.length || 0})</span>
          {showMarketplace ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </button>
        {showMarketplace && (
          <div className="p-2 border-t border-slate-700 bg-slate-900/50 space-y-1">
            {data.marketplace && data.marketplace.length > 0 ? (
              data.marketplace.map((offer, idx) => (
                <a
                  key={idx}
                  href={offer.shopUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded hover:bg-slate-800 transition-colors group"
                >
                  <span className="text-xs text-blue-400 font-medium group-hover:underline">
                    {offer.shopName}
                  </span>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-green-400">
                      {offer.price}
                    </span>
                    {offer.status && (
                      <span className="block text-[9px] text-slate-500">
                        {offer.status}
                      </span>
                    )}
                  </div>
                </a>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-2">
                Žádné nabídky.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <FloatingTextarea
          label="Poznámky"
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          height="h-32"
        />
      </div>
    </div>
  );
};

export default KitInfoTab;
