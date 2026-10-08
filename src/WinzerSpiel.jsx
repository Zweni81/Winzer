import { useState } from "react";
import {
  REBSORTEN,
  REGIONEN,
  regionEignung,
  BODENQUALITAET,
  KOSTEN,
  ernteErtrag,
  weinQualitaet,
  marktPreis,
  neuesWetter,
  neuesEvent,
  neuerMarktFaktor,
  initialSpielstand,
  konkurrenzDrift,
  barriqueVerfuegbar,
  barriqueAusbaun,
  neueParzelle,
  neueAngebote,
} from "./game.js";

function fmt(geld) {
  return geld.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export default function WinzerSpiel() {
  const [s, setS] = useState(null);

  function starte(regionKey) {
    setS(initialSpielstand(regionKey));
  }

  function log(text) {
    setS((v) => ({ ...v, log: [...v.log, text] }));
  }

  function bezahlen(betrag, text) {
    if (s.kapital < betrag) {
      log(`Nicht genug Kapital für: ${text}`);
      return false;
    }
    setS((v) => ({ ...v, kapital: v.kapital - betrag }));
    return true;
  }

  function updateParzelle(idx, fn) {
    setS((v) => {
      const p = [...v.parzellen];
      p[idx] = { ...p[idx], ...fn(p[idx]) };
      return { ...v, parzellen: p };
    });
  }

  function pflanzen(idx, sorte) {
    if (!bezahlen(KOSTEN.pflanzung, "Pflanzung")) return;
    updateParzelle(idx, () => ({ rebsorte: sorte, gesundheit: 100, geduengt: false, besch: true }));
    log(`Parzelle ${idx + 1} neu mit ${REBSORTEN[sorte].name} bepflanzt.`);
  }

  function umpflanzen(idx, sorte) {
    if (!bezahlen(KOSTEN.umstellung, "Rebsorten-Wechsel")) return;
    updateParzelle(idx, () => ({ rebsorte: sorte, gesundheit: 100, geduengt: false, besch: true }));
    log(`Parzelle ${idx + 1} auf ${REBSORTEN[sorte].name} umgestellt (Roden und Neupflanzung).`);
  }

  function duengen(idx) {
    if (!bezahlen(KOSTEN.duenger, "Dünger")) return;
    updateParzelle(idx, (p) => ({ geduengt: true, gesundheit: Math.min(100, p.gesundheit + 10) }));
    log(`Parzelle ${idx + 1} gedüngt.`);
  }

  function pflegen(idx) {
    if (!bezahlen(KOSTEN.pflege, "Pflege")) return;
    updateParzelle(idx, () => ({ besch: true, gesundheit: 100 }));
    log(`Parzelle ${idx + 1} sorgfältig gepflegt.`);
  }

  function jahrWeiter() {
    setS((v) => {
      const neu = { ...v, parzellen: v.parzellen.map((p) => ({ ...p })) };
      const wetter = neuesWetter();
      const ereignis = neuesEvent(neu.region);
      const eintraege = [];
      let kapital = neu.kapital;
      let keller = [...neu.keller];
      let konkurrenz = konkurrenzDrift(neu.konkurrenz);
      if (ereignis?.konkurrenzDrift) {
        konkurrenz = Math.max(0.6, Math.min(1.4, konkurrenz + ereignis.konkurrenzDrift));
      }
      eintraege.push(
        `Konkurrenzsituation: ${konkurrenzText(konkurrenz)} (Preisniveau ${(100 / konkurrenz).toFixed(0)} %)`
      );

      for (let i = 0; i < neu.parzellen.length; i++) {
        const p = neu.parzellen[i];
        if (!p.rebsorte) {
          p.gesundheit = 100;
          continue;
        }
        kapital -= KOSTEN.kellerei;

        if (Math.random() < wetter.schaedling && !p.geduengt) {
          const schaden = Math.round(zufallZwischen(15, 40));
          p.gesundheit = Math.max(10, p.gesundheit - schaden);
          eintraege.push(`Parzelle ${i + 1}: Pilzbefall! Gesundheit -${schaden}.`);
        }

        if (p.gesundheit < 30) {
          kapital -= 2000;
          eintraege.push(`Parzelle ${i + 1}: Notmaßnahmen kranken Reben (2.000 €).`);
        }

        if (p.gesundheit > 20) {
          const ertrag = ernteErtrag(p, wetter, neu.region);
          const qualitaet = weinQualitaet(p, wetter, neu.region);
          const most = Math.round(ertrag / 6);
          const flaschen = Math.round(most * 1.33);
          if (flaschen > 0) {
            keller.push({
              id: `${neu.jahr}-${i}`,
              rebsorte: p.rebsorte,
              jahrgang: neu.jahr,
              qualitaet,
              flaschen,
              marktFaktor: neuerMarktFaktor(),
              bezahltpreis: null,
            });
            eintraege.push(
              `Parzelle ${i + 1}: ${REBSORTEN[p.rebsorte].name} – ${flaschen.toLocaleString("de-DE")} Flaschen (Qualität ${qualitaet}).`
            );
          }
        } else {
          eintraege.push(`Parzelle ${i + 1}: Ernte ausgefallen, Reben zu geschwächt.`);
        }

        p.gesundheit = Math.max(10, p.gesundheit - zufallZwischen(3, 8));
        p.geduengt = false;
      }

      if (ereignis?.geld) {
        kapital += ereignis.geld;
        eintraege.push(ereignis.text);
      }
      if (ereignis?.preiseFaktor) {
        for (const w of keller) {
          if (w.bezahltpreis == null) w.preisFaktor = ereignis.preiseFaktor;
        }
        eintraege.push(ereignis.text);
      }

      eintraege.push(`Wetter: ${wetter.text}`);

      const pleite = kapital < 0;
      return {
        ...neu,
        jahr: neu.jahr + 1,
        kapital,
        keller,
        wetter,
        letztesEvent: ereignis,
        konkurrenz,
        angebote: neueAngebote(),
        log: [...v.log, `— Jahr ${neu.jahr + 1} —`, ...eintraege],
        pleite,
      };
    });
  }

  function parzelleKaufen(angebotId) {
    const angebot = s.angebote.find((a) => a.id === angebotId);
    if (!angebot) return;
    if (!bezahlen(angebot.preis, "Parzellenkauf")) return;
    setS((v) => ({
      ...v,
      parzellen: [...v.parzellen, neueParzelle(angebot.boden, null, angebot.groesse)],
      angebote: v.angebote.filter((a) => a.id !== angebotId),
      log: [...v.log, `Neue Parzelle gekauft: ${angebot.groesse.toLocaleString("de-DE")} ha, ${BODENQUALITAET[angebot.boden]}er Boden (${fmt(angebot.preis)}).`],
    }));
  }

  function barrique(id) {
    if (!bezahlen(KOSTEN.barrique, "Barrique-Ausbau")) return;
    setS((v) => ({
      ...v,
      keller: v.keller.map((w) => (w.id === id ? barriqueAusbaun(w) : w)),
      log: [...v.log, `Wein ${id} im Barrique-Fass ausgebaut – Qualität gestiegen, späterer Verkaufspreis +25 %.`],
    }));
  }

  function verkaufen(id, preis) {
    setS((v) => {
      const wein = v.keller.find((w) => w.id === id);
      if (!wein) return v;
      const erloes = Math.round(preis * wein.flaschen);
      return {
        ...v,
        kapital: v.kapital + erloes,
        keller: v.keller.filter((w) => w.id !== id),
        log: [...v.log, `${wein.flaschen.toLocaleString("de-DE")} Flaschen ${REBSORTEN[wein.rebsorte].name} ${wein.jahrgang} für ${erloes.toLocaleString("de-DE")} € verkauft.`],
      };
    });
  }

  function neuStart() {
    setS(null);
  }

  if (!s) {
    return (
      <div className="panel">
        <h1>🍇 Der Winzer</h1>
        <p>Wählen Sie eine Region, in der Sie Ihr Weingut eröffnen. Die Region bestimmt, wie gut die verschiedenen Rebsorten gedeihen.</p>
        {Object.entries(REGIONEN).map(([key, region]) => (
          <div key={key} className="parzelle">
            <strong>{region.name}</strong>
            <p className="muted">{region.beschreibung}</p>
            <div className="actions">
              {Object.entries(REBSORTEN).map(([sortenKey, sorte]) => (
                <span key={sortenKey} className="eignung">
                  {sorte.name}: {eignungText(regionEignung(key, sortenKey))}
                </span>
              ))}
            </div>
            <div>
              <button onClick={() => starte(key)}>Weingut in {region.name} eröffnen</button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (s.pleite) {
    return (
      <div className="panel">
        <h1>Bankrott!</h1>
        <p>Sie haben im Jahr {s.jahr} Ihr Kapital verloren.</p>
        <button onClick={neuStart}>Neues Spiel</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>🏡 Der Winzer</h1>
        <div className="status">
          <span>Region: {REGIONEN[s.region]?.name}</span>
          <span>Jahr: {s.jahr}</span>
          <span>Konkurrenz: {konkurrenzText(s.konkurrenz ?? 1)}</span>
          <span>Kapital: {fmt(s.kapital)}</span>
          <button className="next" onClick={jahrWeiter}>Jahr fortführen ▶</button>
        </div>
      </header>

      <div className="cols">
        <section>
          <h2>Weinberg</h2>
          {s.parzellen.map((p, i) => (
            <div key={i} className="parzelle">
              <strong>Parzelle {i + 1}</strong>{" "}
              <em>({(p.groesse ?? 1).toLocaleString("de-DE")} ha · {BODENQUALITAET[p.boden]}er Boden)</em>
              {p.rebsorte ? (
                <div>
                  <div>Rebsorte: {REBSORTEN[p.rebsorte].name}</div>
                  <div>Reben-Gesundheit: {Math.round(p.gesundheit)}%</div>
                  <div className="actions">
                    <button onClick={() => duengen(i)}>Düngen ({fmt(KOSTEN.duenger)})</button>
                    <button onClick={() => pflegen(i)}>Pflegen ({fmt(KOSTEN.pflege)})</button>
                  </div>
                  <div className="wechsel">
                    <div className="muted">Rebsorte wechseln ({fmt(KOSTEN.umstellung)}):</div>
                    <div className="actions">
                      {Object.entries(REBSORTEN)
                        .filter(([key]) => key !== p.rebsorte)
                        .map(([key, sorte]) => (
                          <button key={key} onClick={() => umpflanzen(i, key)}>
                            {sorte.name}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="actions">
                  {Object.entries(REBSORTEN).map(([key, sorte]) => (
                    <button key={key} onClick={() => pflanzen(i, key)}>
                      {sorte.name} pflanzen ({fmt(KOSTEN.pflanzung)})
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <h3>Parzellen kaufen</h3>
          {s.angebote.length === 0 && <p className="muted">Zurzeit sind keine Parzellen im Angebot. Nächstes Jahr gibt es neue Angebote.</p>}
          {s.angebote.map((a) => (
            <div key={a.id} className="parzelle">
              <strong>{a.groesse.toLocaleString("de-DE")} ha</strong>{" "}
              <em>({BODENQUALITAET[a.boden]}er Boden)</em>
              <div className="actions">
                <button onClick={() => parzelleKaufen(a.id)} disabled={s.kapital < a.preis}>
                  Kaufen für {fmt(a.preis)}
                </button>
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2>Weinkeller</h2>
          {s.keller.length === 0 && <p className="muted">Noch keine Weine im Keller.</p>}
          {s.keller.map((w) => {
            const preis =
              marktPreis(w.rebsorte, w.qualitaet, w.jahrgang, s.jahr, w.marktFaktor) *
              (w.preisFaktor ?? 1) *
              (w.barriqueFaktor ?? 1) /
              (s.konkurrenz ?? 1);
            return (
              <div key={w.id} className="wein">
                <strong>{REBSORTEN[w.rebsorte].name} {w.jahrgang}</strong>
                <div>Qualität: {w.qualitaet} · {w.flaschen.toLocaleString("de-DE")} Flaschen{w.barrique ? " · Barrique" : ""}</div>
                <div>Aktueller Marktpreis: ~{preis.toFixed(2)} €/Flasche</div>
                <div className="actions">
                  {barriqueVerfuegbar(w) && (
                    <button onClick={() => barrique(w.id)}>
                      Barrique-Ausbau ({fmt(KOSTEN.barrique)})
                    </button>
                  )}
                  <button onClick={() => verkaufen(w.id, preis)}>
                    Verkaufen für {fmt(Math.round(preis * w.flaschen))}
                  </button>
                </div>
              </div>
            );
          })}
          {s.keller.length > 0 && <p className="muted">Tipp: Wein reift im Keller – ältere Jahrgänge erzielen höhere Preise.</p>}
        </section>

        <section>
          <h2>Chronik</h2>
          <div className="log">
            {s.log.slice(-30).map((z, i) => (
              <p key={i} className={z.startsWith("—") ? "yearmark" : ""}>{z}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function zufallZwischen(min, max) {
  return Math.random() * (max - min) + min;
}

function konkurrenzText(k) {
  if (k >= 1.25) return "sehr stark";
  if (k >= 1.1) return "stark";
  if (k >= 0.95) return "normal";
  if (k >= 0.8) return "entspannt";
  return "schwach";
}

function eignungText(faktor) {
  if (faktor >= 1.3) return "hervorragend ⭐";
  if (faktor >= 1.15) return "sehr gut";
  if (faktor >= 1.0) return "gut";
  if (faktor >= 0.9) return "brauchbar";
  if (faktor >= 0.8) return "mäßig";
  if (faktor >= 0.7) return "schwach";
  return "ungeeignet";
}
