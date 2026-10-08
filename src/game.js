export const STARTKAPITAL = 50000;
export const STARTJAHR = 1990;

export const REGIONEN = {
  mosel: {
    name: "Mosel",
    beschreibung: "Steile Schieferhänge, kühles Klima. Weltberühmter Riesling, wenig Platz für Mengen.",
    eignung: { muellerThurgau: 0.9, silvaner: 1.0, riesling: 1.3, spatburgunder: 0.7 },
  },
  rheinhessen: {
    name: "Rheinhessen",
    beschreibung: "Weite, milde Lagen mit fruchtbaren Böden. Ergiebig und vielseitig.",
    eignung: { muellerThurgau: 1.2, silvaner: 1.15, riesling: 1.0, spatburgunder: 1.0 },
  },
  franken: {
    name: "Franken",
    beschreibung: "Trockene Muschelkalkböden, kontinentales Klima. Bodenständige Weine, Silvaner-Land.",
    eignung: { muellerThurgau: 1.0, silvaner: 1.3, riesling: 1.0, spatburgunder: 0.85 },
  },
  ahr: {
    name: "Ahr",
    beschreibung: "Kleines, geschütztes Tal mit warmen Südhängen. Rotweinparadies.",
    eignung: { muellerThurgau: 0.75, silvaner: 0.9, riesling: 0.85, spatburgunder: 1.35 },
  },
};

export function regionEignung(regionKey, rebsorte) {
  return REGIONEN[regionKey]?.eignung[rebsorte] ?? 1;
}

export const REBSORTEN = {
  muellerThurgau: { name: "Müller-Thurgau", preisFaktor: 1.0, ertrag: 1.0, anspruch: 1 },
  silvaner: { name: "Silvaner", preisFaktor: 1.2, ertrag: 0.85, anspruch: 2 },
  riesling: { name: "Riesling", preisFaktor: 1.5, ertrag: 0.7, anspruch: 3 },
  spatburgunder: { name: "Spätburgunder", preisFaktor: 1.8, ertrag: 0.55, anspruch: 4 },
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
