export const STARTKAPITAL = 50000;
export const STARTJAHR = 1990;

export const REGIONEN = {
  mosel: {
    name: "Mosel",
    beschreibung: "Steile Schieferhänge, kühles Klima. Weltberühmter Riesling, wenig Platz für Mengen.",
    eignung: { muellerThurgau: 0.9, silvaner: 1.0, riesling: 1.3, spatburgunder: 0.7, weissburgunder: 0.95, chardonnay: 0.9, dornfelder: 0.75, merlot: 0.7, sangiovese: 0.65 },
  },
  rheinhessen: {
    name: "Rheinhessen",
    beschreibung: "Weite, milde Lagen mit fruchtbaren Böden. Ergiebig und vielseitig.",
    eignung: { muellerThurgau: 1.2, silvaner: 1.15, riesling: 1.0, spatburgunder: 1.0, weissburgunder: 1.15, chardonnay: 1.0, dornfelder: 1.05, merlot: 0.95, sangiovese: 0.85 },
  },
  franken: {
    name: "Franken",
    beschreibung: "Trockene Muschelkalkböden, kontinentales Klima. Bodenständige Weine, Silvaner-Land.",
    eignung: { muellerThurgau: 1.0, silvaner: 1.3, riesling: 1.0, spatburgunder: 0.85, weissburgunder: 1.1, chardonnay: 0.95, dornfelder: 0.95, merlot: 0.8, sangiovese: 0.7 },
  },
  ahr: {
    name: "Ahr",
    beschreibung: "Kleines, geschütztes Tal mit warmen Südhängen. Rotweinparadies.",
    eignung: { muellerThurgau: 0.75, silvaner: 0.9, riesling: 0.85, spatburgunder: 1.35, weissburgunder: 1.0, chardonnay: 1.05, dornfelder: 1.1, merlot: 1.2, sangiovese: 0.95 },
  },
  baden: {
    name: "Baden",
    beschreibung: "Wärmste Region Deutschlands, vulkanische Kaiserstuhl-Lagen. Burgunder-Land.",
    eignung: { muellerThurgau: 1.0, silvaner: 1.05, riesling: 0.9, spatburgunder: 1.25, weissburgunder: 1.2, chardonnay: 1.25, dornfelder: 1.1, merlot: 1.1, sangiovese: 0.9 },
  },
  wuerttemberg: {
    name: "Württemberg",
    beschreibung: "Hügelige Keuper-Lagen mit schwäbischer Handwerkskunst. Land des Dornfelders.",
    eignung: { muellerThurgau: 1.0, silvaner: 1.0, riesling: 0.9, spatburgunder: 1.15, weissburgunder: 1.0, chardonnay: 0.95, dornfelder: 1.3, merlot: 1.05, sangiovese: 0.85 },
  },
  bordeaux: {
    name: "Bordeaux",
    beschreibung: "Gravierete Böden am Ufer der Gironde. Weltklasse-Cuveés aus Merlot und Cabernet.",
    eignung: { muellerThurgau: 0.7, silvaner: 0.7, riesling: 0.65, spatburgunder: 1.05, weissburgunder: 0.95, chardonnay: 1.0, dornfelder: 0.8, merlot: 1.3, sangiovese: 0.8 },
  },
  toskana: {
    name: "Toskana",
    beschreibung: "Sanfte Hügel, viel Sonne, mediterranes Klima. Heimat des Sangiovese.",
    eignung: { muellerThurgau: 0.7, silvaner: 0.65, riesling: 0.6, spatburgunder: 1.0, weissburgunder: 0.9, chardonnay: 1.05, dornfelder: 0.9, merlot: 1.2, sangiovese: 1.4 },
  },
  champagne: {
    name: "Champagne",
    beschreibung: "Kalkreiche Böden, kühles Klima im Norden Frankreichs. Nur die feinsten Trauben werden zu Schaumwein.",
    eignung: { muellerThurgau: 0.9, silvaner: 0.8, riesling: 0.85, spatburgunder: 1.2, weissburgunder: 1.25, chardonnay: 1.3, dornfelder: 0.7, merlot: 0.8, sangiovese: 0.6 },
  },
  elsass: {
    name: "Elsass",
    beschreibung: "Geschützte Lagen im Regenschatten der Vogesen. Kraftvolle Weine aus Reben und Burgundern.",
    eignung: { muellerThurgau: 0.95, silvaner: 1.1, riesling: 1.25, spatburgunder: 1.1, weissburgunder: 1.25, chardonnay: 1.15, dornfelder: 0.8, merlot: 0.85, sangiovese: 0.7 },
  },
};

export function regionEignung(regionKey, rebsorte) {
  return REGIONEN[regionKey]?.eignung[rebsorte] ?? 1;
}

export const REBSORTEN = {
  muellerThurgau: { name: "Müller-Thurgau", preisFaktor: 1.0, ertrag: 1.0, anspruch: 1 },
  silvaner: { name: "Silvaner", preisFaktor: 1.2, ertrag: 0.85, anspruch: 2 },
  weissburgunder: { name: "Weißburgunder", preisFaktor: 1.25, ertrag: 0.8, anspruch: 2 },
  dornfelder: { name: "Dornfelder", preisFaktor: 1.15, ertrag: 0.9, anspruch: 2 },
  riesling: { name: "Riesling", preisFaktor: 1.5, ertrag: 0.7, anspruch: 3 },
  chardonnay: { name: "Chardonnay", preisFaktor: 1.45, ertrag: 0.7, anspruch: 3 },
  spatburgunder: { name: "Spätburgunder", preisFaktor: 1.8, ertrag: 0.55, anspruch: 4 },
  merlot: { name: "Merlot", preisFaktor: 1.7, ertrag: 0.6, anspruch: 4 },
  sangiovese: { name: "Sangiovese", preisFaktor: 1.75, ertrag: 0.55, anspruch: 4 },
};

export const BODENQUALITAET = ["schlecht", "mittel", "gut", "hervorragend"];

export function neueParzelle(boden, rebsorte) {
  return {
    boden,
    rebsorte,
    gesundheit: 100,
    qualitaet: 0,
    geduengt: false,
    besch: true,
  };
}

function zufall(min, max) {
  return Math.random() * (max - min) + min;
}

export function ernteErtrag(parzelle, wetter, region) {
  if (!parzelle.rebsorte) return 0;
  const sorte = REBSORTEN[parzelle.rebsorte];
  const basis = 10000 * sorte.ertrag;
  const gesundheitsFaktor = parzelle.gesundheit / 100;
  const bodenFaktor = 0.7 + parzelle.boden * 0.15;
  const duengeFaktor = parzelle.geduengt ? 1.15 : 0.9;
  const wetterFaktor = wetter.ertragsFaktor;
  const regionFaktor = region ? regionEignung(region, parzelle.rebsorte) : 1;
  const schwank = zufall(0.85, 1.15);
  return Math.max(0, Math.round(basis * gesundheitsFaktor * bodenFaktor * duengeFaktor * wetterFaktor * regionFaktor * schwank));
}

export function weinQualitaet(parzelle, wetter, region) {
  const sorte = REBSORTEN[parzelle.rebsorte];
  const gesundheit = parzelle.gesundheit;
  const pflege = (parzelle.besch ? 10 : 0) + (parzelle.geduengt ? 5 : 0);
  const basis = 40 + parzelle.boden * 8 + (gesundheit - 70) * 0.4 + pflege;
  const wetterBonus = wetter.qualitaetsFaktor * 10 - 5;
  const regionBonus = region ? (regionEignung(region, parzelle.rebsorte) - 1) * 25 : 0;
  return Math.max(10, Math.min(100, Math.round(basis * zufall(0.9, 1.1) * (sorte.preisFaktor * 0.4 + 0.7) + wetterBonus + regionBonus)));
}

const WETTER = [
  { text: "Perfektes Weinjahr – warm, sonnig, rechtzeitig Regen.", ertragsFaktor: 1.15, qualitaetsFaktor: 1.1, schaedling: 0.05 },
  { text: "Gutes Wetter mit gelegentlichen Regenschauern.", ertragsFaktor: 1.05, qualitaetsFaktor: 1.0, schaedling: 0.1 },
  { text: "Kühles, nasses Jahr. Gefahr von Pilzkrankheiten.", ertragsFaktor: 0.85, qualitaetsFaktor: 0.9, schaedling: 0.25 },
  { text: "Hitze und Trockenheit belasten die Reben.", ertragsFaktor: 0.75, qualitaetsFaktor: 1.05, schaedling: 0.1 },
  { text: "Hagel im Sommer zerstört Teile der Ernte!", ertragsFaktor: 0.6, qualitaetsFaktor: 0.95, schaedling: 0.2 },
];

export function neuesWetter() {
  return { ...WETTER[Math.floor(Math.random() * WETTER.length)] };
}

export function marktPreis(rebsorte, qualitaet, jahrgang, aktuellesJahr) {
  const sorte = REBSORTEN[rebsorte];
  const alter = aktuellesJahr - jahrgang;
  const reifungsFaktor = 1 + Math.min(alter, 5) * 0.08;
  const qualitaetsFaktor = 0.5 + (qualitaet / 100) * 1.5;
  const basis = 4 * sorte.preisFaktor;
  const schwank = zufall(0.85, 1.2);
  return Math.max(0.5, Math.round(basis * qualitaetsFaktor * reifungsFaktor * schwank * 100) / 100);
}

export function neuesEvent() {
  const events = [
    null,
    null,
    { text: "Ein Weinkritiker lobt Ihren Betrieb! Die Nachfrage steigt.", preiseFaktor: 1.25 },
    { text: "Konkurrenz aus Übersee drückt die Preise.", preiseFaktor: 0.85 },
    { text: "Ein Weinfest in der Region bringt Ihnen Direktverkäufe.", geld: 8000 },
    { text: "Sturmschaden am Wirtschaftsgebäude – Reparaturkosten.", geld: -5000 },
    { text: "Fördermittel für ökologischen Weinbau genehmigt!", geld: 6000 },
  ];
  return events[Math.floor(Math.random() * events.length)];
}

export function initialSpielstand(regionKey) {
  const region = REGIONEN[regionKey];
  return {
    region: regionKey,
    jahr: STARTJAHR,
    kapital: STARTKAPITAL,
    repututation: 50,
    parzellen: [
      neueParzelle(2, "muellerThurgau"),
      neueParzelle(1, "muellerThurgau"),
      neueParzelle(1, null),
    ],
    keller: [],
    log: [
      `Willkommen im Jahrgang ${STARTJAHR}! Sie eröffnen Ihr Weingut in ${region ? region.name : "Ihrer Region"} und übernehmen den Betrieb Ihres Onkels.`,
    ],
    wetter: neuesWetter(),
    letztesEvent: null,
    pleite: false,
  };
}

export const KOSTEN = {
  pflanzung: 15000,
  duenger: 3000,
  spritze: 2500,
  pflege: 1500,
  ernte: 4000,
  kellerei: 2000,
};
