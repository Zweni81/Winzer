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
  initialSpielstand,
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
      const ereignis = neuesEvent();
      const eintraege = [];
      let kapital = neu.kapital;
      let keller = [...neu.keller];

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
        log: [...v.log, `— Jahr ${neu.jahr + 1} —`, ...eintraege],
        pleite,
      };
    });
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
              <em>({BODENQUALITAET[p.boden]}er Boden)</em>
              {p.rebsorte ? (
                <div>
                  <div>Rebsorte: {REBSORTEN[p.rebsorte].name}</div>
                  <div>Reben-Gesundheit: {Math.round(p.gesundheit)}%</div>
                  <div className="actions">
                    <button onClick={() => duengen(i)}>Düngen ({fmt(KOSTEN.duenger)})</button>
                    <button onClick={() => pflegen(i)}>Pflegen ({fmt(KOSTEN.pflege)})</button>
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
        </section>

        <section>
          <h2>Weinkeller</h2>
          {s.keller.length === 0 && <p className="muted">Noch keine Weine im Keller.</p>}
          {s.keller.map((w) => {
            const preis = marktPreis(w.rebsorte, w.qualitaet, w.jahrgang, s.jahr) * (w.preisFaktor ?? 1);
            return (
              <div key={w.id} className="wein">
                <strong>{REBSORTEN[w.rebsorte].name} {w.jahrgang}</strong>
                <div>Qualität: {w.qualitaet} · {w.flaschen.toLocaleString("de-DE")} Flaschen</div>
                <div>Aktueller Marktpreis: ~{preis.toFixed(2)} €/Flasche</div>
                <button onClick={() => verkaufen(w.id, preis)}>
                  Verkaufen für {fmt(Math.round(preis * w.flaschen))}
                </button>
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

function eignungText(faktor) {
  if (faktor >= 1.3) return "hervorragend ⭐";
  if (faktor >= 1.15) return "sehr gut";
  if (faktor >= 1.0) return "gut";
  if (faktor >= 0.9) return "brauchbar";
  if (faktor >= 0.8) return "mäßig";
  if (faktor >= 0.7) return "schwach";
  return "ungeeignet";
}
