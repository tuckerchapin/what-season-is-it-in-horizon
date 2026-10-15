import type { Season } from "./season.ts";

export interface Background {
  /** Filename in assets/backgrounds/<season>/. */
  file: string;
  /** A reddit username (credited as u/<name>) or a plain label. */
  credit: { reddit: string } | { label: string };
  /** Kept in the repo but never shown; the reason is recorded here. */
  exclude?: string;
}

const reddit = (name: string) => ({ reddit: name });
const coverArt = { label: "Official Forza Horizon 4 art" };

// Community photos from reddit, with in-game watermarks removed by hand (2018).
export const backgrounds: Record<Season, Background[]> = {
  winter: [
    { file: "ARCLab-1.jpg", credit: reddit("ARCLab") },
    { file: "CCXGT-1.jpg", credit: reddit("CCXGT") },
    { file: "CraazyGamerz-1.jpg", credit: reddit("CraazyGamerz") },
    { file: "DakarGelb-1.jpg", credit: reddit("DakarGelb") },
    { file: "flakgunna-1.jpg", credit: reddit("flakgunna") },
    { file: "kml--1.jpg", credit: reddit("kml-") },
    { file: "LooniLuna-1.jpg", credit: reddit("LooniLuna") },
    { file: "maikee_bery-1.jpg", credit: reddit("maikee_bery") },
    { file: "naixu-1.jpg", credit: reddit("naixu") },
    { file: "OriginalForzaCoverArt-1.jpg", credit: coverArt },
    { file: "parkel42-1.jpg", credit: reddit("parkel42") },
    { file: "parkel42-2.jpg", credit: reddit("parkel42") },
    { file: "parkel42-3.jpg", credit: reddit("parkel42"), exclude: "Not a fan" },
    { file: "sjoel92-1.jpg", credit: reddit("sjoel92") },
    { file: "StickManTwit-1.jpg", credit: reddit("StickManTwit") },
    { file: "ThatsJustLogic-1.jpg", credit: reddit("ThatsJustLogic") },
    { file: "TigerusTheReal-1.jpg", credit: reddit("TigerusTheReal") },
  ],
  spring: [
    { file: "-MattyMcFly-1.jpg", credit: reddit("-MattyMcFly"), exclude: "Below 1080p (1252×724)" },
    { file: "And_Justice-1.jpg", credit: reddit("And_Justice") },
    { file: "AzudemK-1.jpg", credit: reddit("AzudemK") },
    { file: "Enzo03-1.jpg", credit: reddit("Enzo03") },
    { file: "flakgunna-1.jpg", credit: reddit("flakgunna") },
    { file: "flakgunna-2.jpg", credit: reddit("flakgunna") },
    { file: "OriginalForzaCoverArt-1.jpg", credit: coverArt },
    { file: "Positivevibes845-1.jpg", credit: reddit("Positivevibes845") },
    { file: "Semyonov-1.jpg", credit: reddit("Semyonov") },
    { file: "slamdunk_12-1.jpg", credit: reddit("slamdunk_12") },
    { file: "Syt1976-1.jpg", credit: reddit("Syt1976"), exclude: "Still has the FH4 watermark" },
    { file: "ur4ddiction-1.jpg", credit: reddit("ur4ddiction"), exclude: "Below 1080p (1022×598)" },
    { file: "xXMetalFlakeXx-1.jpg", credit: reddit("xXMetalFlakeXx") },
  ],
  summer: [
    { file: "MainlyGod-1.jpg", credit: reddit("MainlyGod") },
    { file: "OfficialForzaCoverArt-1.jpg", credit: coverArt },
    { file: "Soovin-1.jpg", credit: reddit("Soovin") },
    { file: "WillPill_-1.jpg", credit: reddit("WillPill_") },
  ],
  autumn: [
    { file: "DANGERD33-1.jpg", credit: reddit("DANGERD33") },
    { file: "InternetExplorer8-1.jpg", credit: reddit("InternetExplorer8") },
    { file: "maikee_bery-1.jpg", credit: reddit("maikee_bery") },
    { file: "MrsAverageMan-1.jpg", credit: reddit("MrsAverageMan") },
    { file: "MrsAverageMan-2.jpg", credit: reddit("MrsAverageMan") },
    { file: "OriginalForzaCoverArt-1.jpg", credit: coverArt },
    { file: "SkylineSonata-1.jpg", credit: reddit("SkylineSonata") },
    { file: "ThroughJaysLens-1.jpg", credit: reddit("ThroughJaysLens") },
    { file: "Vadeel-1.jpg", credit: reddit("Vadeel") },
  ],
};
