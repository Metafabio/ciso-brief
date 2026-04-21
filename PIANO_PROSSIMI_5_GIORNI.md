# Piano Prossimi 5 Giorni — Resilience Revenue Brief

> Creato il 20 aprile 2026. Da rileggere ogni mattina prima di lavorare sul progetto.

---

## Stato Attuale dell'App

### Cosa funziona e vale (data-driven)
| Tab | Dati | Utilità reale |
|---|---|---|
| **AI** (Backup Intelligence) | `backupl.json` | Alta — vendor analysis, leaderboard, news |
| **Executive** | `brief.json` | Alta — brief settimanale board-ready |
| **Vendors** | `market_analysis.json` | Alta — analisi competitor con momentum |
| **Actions** | `action_register.json` | Alta — la feature più differenziante |
| **Business** | Hardcoded | Media — pacchetti Mauden GTM |
| **Sales** | Hardcoded | Media — pitch + Reason to Call |

### Da rimuovere o rendere data-driven
| Tab | Problema |
|---|---|
| **Compare** | Tabella statica hardcodata — non si aggiorna mai |
| **Use Cases** | Dati fissi — non cambia settimana su settimana |
| **Technical** | API reference statica — appartiene a una doc, non a una dashboard |

### Stack tecnico
- Next.js 16 + React 19 + TypeScript
- JSON statici in `public/`
- Nessun backend, nessun database, nessun auth
- Build pulito, zero errori TypeScript
- `@anthropic-ai/sdk` già installato (non ancora usato)

---

## Giorno 1 — Pulizia e prima demo

**Obiettivo:** rendere l'app presentabile a qualcuno di Mauden

Azioni tecniche:
- [ ] Rimuovere (o nascondere) le tab Compare, Use Cases, Technical
- [ ] Oppure: spostare i loro dati in JSON (`public/compare_data.json`, ecc.) — 30 min di lavoro
- [ ] Verificare che il PDF white-label funzioni bene stampando una pagina di test

Azione umana:
- [ ] Mostrare l'app a 1 persona di Mauden (sales, pre-sales, o manager)
- [ ] Far aprire la tab **Actions** e osservare la reazione nei primi 30 secondi
- [ ] Domanda da fare: *"Useresti questo ogni lunedì mattina?"*

**Segnale positivo:** aprono Actions e iniziano a leggere le azioni senza che tu spieghi niente.
**Segnale negativo:** guardano e dicono "bello" senza interagire — in quel caso cambia l'approccio.

---

## Giorno 2 — Test di valore con utente reale

**Obiettivo:** validare il white-label PDF in contesto reale

Azioni:
- [ ] Aprire l'app, cliccare "📄 Client PDF", inserire il nome di un cliente reale
- [ ] Andare sulla tab **Executive** o **Actions**
- [ ] Stampare il PDF con il pulsante PDF
- [ ] Portare il documento stampato in una riunione con un cliente backup

Domanda da fare al cliente:
*"Questo tipo di aggiornamento settimanale ti farebbe aprire conversazioni che prima non avresti aperto?"*

**Cosa stai testando:** se il formato "segnale → rischio → azione → servizio Mauden" risuona con chi compra.

---

## Giorno 3 — Automatizzare il flusso di informazioni

**Obiettivo:** `npm run brief:generate` → chiama Claude API → aggiorna i JSON → commit

Il file `generate-brief.mjs` ha già i prompt pronti (sezione `BRIEF_JSON_PROMPT` e `MARKET_ANALYSIS_JSON_PROMPT`).
Il package `@anthropic-ai/sdk` è già installato.

Passi da fare:
- [ ] Aggiungere la chiamata a Claude API in `generate-brief.mjs` con `--generate` flag
- [ ] Claude usa web search (tool use) per trovare notizie degli ultimi 7 giorni
- [ ] Il JSON aggiornato viene scritto in `public/brief.json` e `public/market_analysis.json`
- [ ] Aggiungere anche la generazione di `backupl.json` e `action_register.json`

Esempio codice da aggiungere:
```javascript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function generateBrief() {
  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{ role: 'user', content: BRIEF_JSON_PROMPT }],
  })
  // Estrarre il JSON dalla risposta e scrivere in public/brief.json
}
```

Attenzione:
- Serve `ANTHROPIC_API_KEY` in `.env.local`
- Il modello con web search è `claude-opus-4-7` (o `claude-sonnet-4-6`)
- Validare sempre il JSON prima di sovrascrivere con `--validate`

---

## Giorno 4 — Valutare il pivot AI Engineering

**Obiettivo:** capire se il modello funziona anche fuori dal backup

Azione:
- [ ] Creare un branch `git checkout -b ai-engineering`
- [ ] Cambiare i dati: sostituire vendor backup con tool AI (LangChain, OpenAI, Anthropic, Mistral, CrewAI, LlamaIndex)
- [ ] Adattare le sezioni: "M&A/Funding" → funding AI startup, "Threat" → security LLM, "AI Orchestration" → nuovi agent framework
- [ ] Usarlo per 1 settimana come strumento personale di aggiornamento

Domanda da risponderti:
*"Questo mi è utile personalmente? Lo aprirò ogni lunedì?"*

Se sì → hai trovato la tua nicchia.

---

## Giorno 5 — Decisione di direzione

**Scenario A — Feedback Mauden positivo**
→ Costruisci la versione subscription
→ Modello: €1.5k–€5k/mese per cliente
→ Output: PDF white-label settimanale + Action Register aggiornato
→ Prima milestone: 3 clienti paganti entro 90 giorni

**Scenario B — Il pivot AI ti ha entusiasmato**
→ Il progetto diventa portfolio personale da AI engineer
→ Pubblica su GitHub con README professionale
→ Mostralo nei colloqui come "AI-powered intelligence dashboard"
→ Dimostra: Next.js, TypeScript, Claude API, prompt engineering, data pipeline

**Scenario C (probabile) — Entrambi**
→ Backup ti dà il cliente vicino e la validazione commerciale
→ AI engineering è la direzione a lungo termine
→ I due domini si stanno convergendo: backup + AI sono la stessa cosa nel 2026

---

## Consiglio Strategico

**Resta nel backup per i prossimi 30–60 giorni, ma costruisci il tool come se fosse per l'AI engineering.**

Il backup ti dà:
- Un cliente vicino (Mauden)
- Un dominio che conosci
- La possibilità di validare il modello commerciale velocemente

L'AI engineering ti dà:
- Le competenze che vuoi costruire
- Un portfolio differenziante
- La direzione di mercato giusta (backup e AI sono sempre più sovrapposti)

Nel frattempo stai costruendo esattamente le skill da AI engineer:
- Automazione con LLM
- Pipeline dati JSON
- Dashboard intelligence
- Prompt engineering
- Next.js + TypeScript

---

## Prossima Sessione Claude — Comandi Rapidi

```bash
# Avviare l'app
npm run dev

# Validare i JSON
npm run brief:validate

# Controllare lo stato del progetto
git log --oneline -10
git status
```

File chiave da modificare:
- `app/page.tsx` — tutto il frontend (1800 righe)
- `public/brief.json` — Executive tab
- `public/backupl.json` — AI tab (attenzione: struttura con summary oggetto)
- `public/market_analysis.json` — Vendors tab
- `public/action_register.json` — Actions tab
- `generate-brief.mjs` — validatore + futuro generatore automatico

---

*Aggiornato il 2026-04-20 dopo sessione con Claude Code*
