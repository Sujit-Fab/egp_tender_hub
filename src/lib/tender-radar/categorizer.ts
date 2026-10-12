export const TENDER_CATEGORIES = [
  { id: "Road & Highway", desc: "RHD, LGED roads, bridges, pavement" },
  { id: "Building & Civil", desc: "PWD, EED buildings, renovation, repair" },
  { id: "Medical & Hospital", desc: "DGHS, hospital supplies, medicines" },
  { id: "IT & Equipment", desc: "Computers, software, network, ICT" },
  { id: "Water & Drainage", desc: "BWDB, WASA, irrigation, flood control" },
  { id: "Power & Electrical", desc: "BPDB, REB, transformers, solar, grid" },
  { id: "Vehicles & Spare Parts", desc: "Railway, ferry, trucks, spare parts" },
  { id: "Food & Ration", desc: "Police ration, hospital diet, groceries" },
  { id: "Others", desc: "All other procurement categories" },
] as const;

export type TenderCategory = (typeof TENDER_CATEGORIES)[number]["id"];
export const TENDER_CATEGORY_KEYS: readonly TenderCategory[] = TENDER_CATEGORIES.map(category => category.id);

export function normalizeTenderCategories(value: unknown): TenderCategory[] {
  if (!Array.isArray(value)) return [];
  return TENDER_CATEGORY_KEYS.filter(key => value.includes(key));
}

export interface ParsedTender {
  serial_no: number;
  tender_id: string;
  reference_no: string;
  nature: string;
  title: string;
  ministry: string;
  division: string;
  organization: string;
  procuring_entity: string;
  type: string;
  method: string;
  publishing_datetime: string;
  closing_datetime: string;
  has_amendment: boolean;
}

export interface CategorizedTender extends ParsedTender {
  category: TenderCategory;
}

const CATEGORY_RULES: {
  category: TenderCategory;
  titleKeywords: string[];
  orgKeywords: string[];
}[] = [
  {
    category: "Road & Highway",
    titleKeywords: [
      "road","highway","pavement","bituminous","asphalt","bitumen",
      "shoulder","lane","bypass","pothole","carpeting","seal coat",
      "wearing course","uni-block","HBB","RCC road","pitch"
    ],
    orgKeywords: ["RHD","Roads & Highways","Road Division","Road Sub-Division"],
  },
  {
    category: "Building & Civil",
    titleKeywords: [
      "building","construction","renovation","repair","floor","hostel",
      "college","school","madrasa","boundary wall","foundation","storied",
      "auditorium","courtroom","mosque","mandir","complex","bhaban",
      "waterproofing","plaster","painting","window","toilet","drain internal"
    ],
    orgKeywords: [
      "PWD","Public Works Department","Education Engineering",
      "LGED building","EED","PWD Division","PWD EM"
    ],
  },
  {
    category: "Medical & Hospital",
    titleKeywords: [
      "medicine","medical","surgical","hospital","health","MSR","linen",
      "gauze","patient","diet","bandage","cotton","instrument","chemical",
      "re-agent","reagent","pacemaker","stent","valve","balloon","oxygenator",
      "dialysis","non-EDCL","EDCL","syrup","injection","tablet","capsule"
    ],
    orgKeywords: [
      "DGHS","Health Services","HED","UHC","Health Complex",
      "Hospital","Medical College","NICVD","BMU","MCWC"
    ],
  },
  {
    category: "IT & Equipment",
    titleKeywords: [
      "computer","laptop","software","ICT","printer","UPS","scanner",
      "digital","bandwidth","internet","WLAN","network","LAN","server",
      "attendance","CCTV","camera","accessories","meter","electric meter",
      "electricity bill form","LED","display","projector"
    ],
    orgKeywords: [
      "ICT","IT","Digital","Meteorological","Information Technology"
    ],
  },
  {
    category: "Water & Drainage",
    titleKeywords: [
      "water","drain","culvert","dredging","river","flood","irrigation",
      "pump","tube well","WASA","aquifer","recharge","pontoon","docking",
      "bank protection","regulator","sluice","embankment","canal","khal",
      "navigability","ferry route","suction dredger"
    ],
    orgKeywords: [
      "BWDB","DWASA","Water Resources","Bangladesh Water Development",
      "WD Division","BIWTA dredging","Water Supply","Sewerage"
    ],
  },
  {
    category: "Power & Electrical",
    titleKeywords: [
      "power","electrical","transformer","generator","solar","grid","kV",
      "feeder","meter","transmission","substation","conductor","insulator",
      "line repair","pole","cable","gas turbine","CCPP","scaffolding turbine",
      "painting turbine","blasting turbine","compressor blade","zinc"
    ],
    orgKeywords: [
      "BPDB","REB","Power Grid","WZPDCL","NWPGCL","EGCB",
      "Palli Bidyut","Power Division","Electricity Generation"
    ],
  },
  {
    category: "Vehicles & Spare Parts",
    titleKeywords: [
      "vehicle","truck","jeep","pickup","microbus","ferry","locomotive",
      "spare parts","engine","bearing","gear","pump assembly","fuel filter",
      "lube","hydraulic","propulsion","crank shaft","piston","roller",
      "garbage remover","vacutag","sleeper","railway track","bus","coaster"
    ],
    orgKeywords: [
      "Bangladesh Railway","RHD Workshop","BIWTC","Workshop Division",
      "Works Manager","Civil Aviation transport","Coast Guard"
    ],
  },
  {
    category: "Food & Ration",
    titleKeywords: [
      "food","rice","lentil","dal","oil","soybean","ration","grocery",
      "diet","masur","polao","edible oil","vitamin","fortified","grain",
      "firewood","loading unloading ration","grinding","flour","wheat"
    ],
    orgKeywords: [
      "Bangladesh Police ration","Police Superintendent","PSTS",
      "SMP Ration","Port Authority Hospital"
    ],
  },
];

export function categorizeTender(tender: ParsedTender): TenderCategory {
  const titleLower = tender.title.toLowerCase();
  const orgLower   = (tender.organization + " " + tender.procuring_entity + " " + tender.ministry).toLowerCase();

  for (const rule of CATEGORY_RULES) {
    const titleMatch = rule.titleKeywords.some(kw => titleLower.includes(kw.toLowerCase()));
    const orgMatch   = rule.orgKeywords.some(kw => orgLower.includes(kw.toLowerCase()));
    if (titleMatch || orgMatch) return rule.category;
  }
  return "Others";
}

export function categorizeAll(tenders: ParsedTender[]): CategorizedTender[] {
  return tenders.map(t => ({ ...t, category: categorizeTender(t) }));
}

export function groupByCategory(
  tenders: CategorizedTender[]
): Record<TenderCategory, CategorizedTender[]> {
  const result = {} as Record<TenderCategory, CategorizedTender[]>;
  for (const t of tenders) {
    if (!result[t.category]) result[t.category] = [];
    result[t.category].push(t);
  }
  return result;
}
