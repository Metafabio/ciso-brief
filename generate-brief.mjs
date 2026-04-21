#!/usr/bin/env node
/**
 * CISO Brief generator & validator.
 *
 * Usage:
 *   node generate-brief.mjs --validate   Validate public/*.json dashboard data
 *   node generate-brief.mjs --generate   Fetch RSS news + call Groq to regenerate all JSON files
 *   node generate-brief.mjs --prompt     Print the manual prompts (debug)
 *   node generate-brief.mjs              Same as --validate
 *
 * Requires: GROQ_API_KEY in .env.local or environment
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Carica .env.local se presente
try {
  const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '.env.local')
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const [key, ...val] = line.split('=')
      if (key && val.length && !process.env[key.trim()]) {
        process.env[key.trim()] = val.join('=').trim()
      }
    }
  }
} catch {}


const __dir = dirname(fileURLToPath(import.meta.url))
const BRIEF_FILE = resolve(__dir, 'public/brief.json')
const ANALYSIS_FILE = resolve(__dir, 'public/market_analysis.json')
const BACKUP_FILE = resolve(__dir, 'public/backupl.json')
const ACTIONS_FILE = resolve(__dir, 'public/action_register.json')
const LLMOPS_LOG = resolve(__dir, 'data/llmops-log.jsonl')

const SECTION_IDS = ['ma-funding', 'product-releases', 'threat-ransomware', 'ai-orchestration', 'market-trends']
const MOMENTUM_VALUES = ['rising', 'stable', 'declining']
const AI_LABELS = ['None', 'Basic', 'Advanced', 'Native']
const SIGNAL_TYPES = ['consolidation', 'disruption', 'regulation', 'adoption', 'investment']
const IMPACT_VALUES = ['high', 'medium', 'low']
const CONFIDENCE_VALUES = ['high', 'medium', 'low']

function getISOWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const y = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date - y) / 86400000 + 1) / 7)
}

const now = new Date()
const DATE = now.toISOString().split('T')[0]
const WEEK = getISOWeek(now)
const DATE_IT = now.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

function readJSON(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function validateSources(path, value, errors, warnings) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${path}.sources deve contenere almeno una fonte`)
    return
  }
  for (const [index, source] of value.entries()) {
    const sourcePath = `${path}.sources[${index}]`
    if (!isPlainObject(source)) { errors.push(`${sourcePath} deve essere un oggetto`); continue }
    if (typeof source.title !== 'string' || !source.title) errors.push(`${sourcePath}.title mancante`)
    if (typeof source.publisher !== 'string' || !source.publisher) errors.push(`${sourcePath}.publisher mancante`)
    if (typeof source.published_at !== 'string' || !source.published_at) errors.push(`${sourcePath}.published_at mancante`)
    if (typeof source.url !== 'string') {
      errors.push(`${sourcePath}.url deve essere una stringa`)
    } else if (source.url && !/^https?:\/\//.test(source.url)) {
      errors.push(`${sourcePath}.url deve iniziare con http:// o https://`)
    } else if (!source.url) {
      warnings.push(`${sourcePath}.url vuoto: fonte non verificabile via web`)
    }
  }
}

function validateConfidence(path, value, errors) {
  if (!CONFIDENCE_VALUES.includes(value)) errors.push(`${path}.confidence non valido: ${value}`)
}

function validateBrief(brief, errors, warnings) {
  if (!Number.isInteger(brief.week)) errors.push('brief.week deve essere un intero')
  if (brief.week !== WEEK) warnings.push(`brief.week (${brief.week}) non coincide con la settimana corrente (${WEEK})`)
  if (typeof brief.date !== 'string' || !brief.date) errors.push('brief.date mancante')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(brief.generated_at || '')) errors.push('brief.generated_at deve essere YYYY-MM-DD')
  if (brief.generated_at !== DATE) warnings.push(`brief.generated_at (${brief.generated_at}) non coincide con oggi (${DATE})`)
  if (!Array.isArray(brief.sections)) errors.push('brief.sections deve essere un array')

  const sections = Array.isArray(brief.sections) ? brief.sections : []
  const ids = sections.map(s => s.id)
  for (const id of SECTION_IDS) {
    if (!ids.includes(id)) warnings.push(`brief.sections manca la sezione ${id}`)
  }
  for (const section of sections) {
    if (!SECTION_IDS.includes(section.id)) errors.push(`brief.sections contiene id non previsto: ${section.id}`)
    if (!Array.isArray(section.items)) errors.push(`brief.sections.${section.id}.items deve essere un array`)
    if ((section.items || []).length > 5) warnings.push(`brief.sections.${section.id}.items supera il limite di 5`)
    if (typeof section.implication !== 'string' || !section.implication) errors.push(`brief.sections.${section.id}.implication mancante`)
    for (const [index, item] of (section.items || []).entries()) {
      if (typeof item.vendor !== 'string' || !item.vendor) errors.push(`${section.id}.items[${index}].vendor mancante`)
      if (typeof item.deal !== 'string' || !item.deal) errors.push(`${section.id}.items[${index}].deal mancante`)
      if (typeof item.summary !== 'string' || !item.summary) errors.push(`${section.id}.items[${index}].summary mancante`)
      validateConfidence(`${section.id}.items[${index}]`, item.confidence, errors)
      validateSources(`${section.id}.items[${index}]`, item.sources, errors, warnings)
    }
  }
}

function validateAnalysis(analysis, brief, errors, warnings) {
  if (!Number.isInteger(analysis.week)) errors.push('market_analysis.week deve essere un intero')
  if (analysis.week !== brief.week) warnings.push(`week mismatch: brief=${brief.week}, market_analysis=${analysis.week}`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(analysis.generated_at || '')) errors.push('market_analysis.generated_at deve essere YYYY-MM-DD')
  if (analysis.generated_at !== brief.generated_at) warnings.push(`generated_at mismatch`)
  if (typeof analysis.summary !== 'string' || !analysis.summary) errors.push('market_analysis.summary mancante')
  if (!Array.isArray(analysis.brands)) errors.push('market_analysis.brands deve essere un array')
  if (!Array.isArray(analysis.market_signals)) errors.push('market_analysis.market_signals deve essere un array')
  if (!Array.isArray(analysis.ai_llm_leaderboard)) errors.push('market_analysis.ai_llm_leaderboard deve essere un array')
  if (!isPlainObject(analysis.recommendation)) errors.push('market_analysis.recommendation deve essere un oggetto')
  if ((analysis.brands || []).length > 5) warnings.push('market_analysis.brands supera il limite di 5')
  if ((analysis.market_signals || []).length > 4) warnings.push('market_analysis.market_signals supera il limite di 4')
  if ((analysis.ai_llm_leaderboard || []).length > 5) warnings.push('market_analysis.ai_llm_leaderboard supera il limite di 5')
  for (const [index, brand] of (analysis.brands || []).entries()) {
    if (typeof brand.name !== 'string' || !brand.name) errors.push(`brands[${index}].name mancante`)
    if (!MOMENTUM_VALUES.includes(brand.momentum)) errors.push(`brands[${index}].momentum non valido: ${brand.momentum}`)
    if (!isPlainObject(brand.ai_integration)) errors.push(`brands[${index}].ai_integration mancante`)
    const ai = brand.ai_integration || {}
    if (typeof ai.score !== 'number' || ai.score < 0 || ai.score > 10) errors.push(`brands[${index}].ai_integration.score non valido`)
    if (!AI_LABELS.includes(ai.label)) errors.push(`brands[${index}].ai_integration.label non valido: ${ai.label}`)
    if (!Array.isArray(ai.features)) errors.push(`brands[${index}].ai_integration.features deve essere un array`)
    if (!Array.isArray(brand.products_in_focus)) errors.push(`brands[${index}].products_in_focus deve essere un array`)
  }
  for (const [index, signal] of (analysis.market_signals || []).entries()) {
    if (!SIGNAL_TYPES.includes(signal.type)) errors.push(`market_signals[${index}].type non valido: ${signal.type}`)
    if (!IMPACT_VALUES.includes(signal.impact)) errors.push(`market_signals[${index}].impact non valido: ${signal.impact}`)
    validateConfidence(`market_signals[${index}]`, signal.confidence, errors)
    validateSources(`market_signals[${index}]`, signal.sources, errors, warnings)
  }
}

function validateDashboardJSON() {
  const errors = []
  const warnings = []
  const brief = readJSON(BRIEF_FILE)
  const analysis = readJSON(ANALYSIS_FILE)

  validateBrief(brief, errors, warnings)
  validateAnalysis(analysis, brief, errors, warnings)

  console.log(`CISO Brief JSON validation - week ${WEEK} (${DATE})`)
  console.log(`brief.json: week ${brief.week}, generated_at ${brief.generated_at}, sections ${brief.sections?.length ?? 0}`)
  console.log(`market_analysis.json: week ${analysis.week}, generated_at ${analysis.generated_at}, brands ${analysis.brands?.length ?? 0}, signals ${analysis.market_signals?.length ?? 0}`)

  if (warnings.length) {
    console.log('\nWarnings:')
    for (const warning of warnings) console.log(`- ${warning}`)
  }
  if (errors.length) {
    console.error('\nErrors:')
    for (const error of errors) console.error(`- ${error}`)
    process.exit(1)
  }
  console.log('\nOK: i JSON sono strutturalmente validi per la dashboard.')
}

// ─── PROMPTS ────────────────────────────────────────────────────────────────

const BRIEF_JSON_PROMPT = `Sei un analista di market intelligence specializzato in cybersecurity, data protection e AI integration.
La data di oggi è ${DATE}.
La settimana ISO corrente è ${WEEK}.
Esegui ricerche web aggiornate sulle notizie degli ULTIMI 7 GIORNI e produci un oggetto JSON valido con questa struttura esatta. Non aggiungere testo prima o dopo il JSON.
{
  "week": ${WEEK},
  "date": "${DATE_IT}",
  "generated_at": "${DATE}",
  "sections": [
    {
      "id": "ma-funding",
      "items": [{"vendor": "...", "deal": "...", "amount": "...", "summary": "2-3 frasi.", "confidence": "high | medium | low", "sources": [{"title": "...", "url": "https://...", "publisher": "...", "published_at": "YYYY-MM-DD"}]}],
      "implication": "Una sola azione concreta per manager o sales."
    },
    {
      "id": "product-releases",
      "items": [{"vendor": "...", "deal": "...", "summary": "2-3 frasi.", "confidence": "high | medium | low", "sources": [{"title": "...", "url": "https://...", "publisher": "...", "published_at": "YYYY-MM-DD"}]}],
      "implication": "Una sola azione concreta per manager o sales."
    },
    {
      "id": "threat-ransomware",
      "items": [{"vendor": "...", "deal": "...", "summary": "2-3 frasi.", "confidence": "high | medium | low", "sources": [{"title": "...", "url": "https://...", "publisher": "...", "published_at": "YYYY-MM-DD"}]}],
      "implication": "Una sola azione concreta prioritaria."
    },
    {
      "id": "ai-orchestration",
      "items": [{"vendor": "...", "deal": "...", "summary": "2-3 frasi.", "confidence": "high | medium | low", "sources": [{"title": "...", "url": "https://...", "publisher": "...", "published_at": "YYYY-MM-DD"}]}],
      "implication": "Una sola azione concreta per manager o sales."
    },
    {
      "id": "market-trends",
      "items": [{"vendor": "...", "deal": "...", "summary": "2-3 frasi su backup/DR/AI.", "confidence": "high | medium | low", "sources": [{"title": "...", "url": "https://...", "publisher": "...", "published_at": "YYYY-MM-DD"}]}],
      "implication": "Una sola azione concreta nel settore backup/DR."
    }
  ]
}
Regole: Massimo 5 item per sezione. Ogni item deve avere vendor, deal, summary, confidence e almeno una source. amount opzionale, usa "n.d." se non noto. Usa confidence "high" solo se la fonte primaria conferma direttamente il claim; usa "low" se il claim richiede verifica editoriale.`

const MARKET_ANALYSIS_JSON_PROMPT = `Sei un analista di market intelligence specializzato in cybersecurity, data protection e AI integration.
La data di oggi è ${DATE}.
La settimana ISO corrente è ${WEEK}.
Esegui ricerche web aggiornate sulle notizie degli ULTIMI 7 GIORNI e produci un oggetto JSON valido con questa struttura esatta. Non aggiungere testo prima o dopo il JSON.
{
  "week": ${WEEK},
  "generated_at": "${DATE}",
  "summary": "2-3 frasi executive summary: chi sta vincendo questa settimana e perché.",
  "brands": [
    {
      "name": "Nome brand",
      "segment": "Es: CNAPP / EDR / Backup & DR / SIEM / Identity",
      "momentum": "rising | stable | declining",
      "momentum_reason": "Una frase: perché ha questo momentum questa settimana.",
      "ai_integration": {
        "score": 0,
        "label": "None | Basic | Advanced | Native",
        "features": ["feature 1", "feature 2"],
        "llm_model": "Nome modello usato internamente o n.d."
      },
      "products_in_focus": [
        {
          "name": "Nome prodotto",
          "category": "Categoria",
          "key_differentiator": "Cosa lo distingue dai competitor questa settimana.",
          "ai_feature": "Funzionalità AI/LLM specifica o n.d.",
          "target_buyer": "Es: CISO / IT Manager / Sales Engineer / SMB"
        }
      ],
      "competitive_threat": "A chi fa più paura questo brand/prodotto ora e perché.",
      "sales_angle": "Come usare questa notizia in una conversazione di vendita."
    }
  ],
  "market_signals": [
    {
      "signal": "Titolo del segnale di mercato",
      "type": "consolidation | disruption | regulation | adoption | investment",
      "impact": "high | medium | low",
      "description": "2 frasi: cosa sta succedendo e dove va il mercato.",
      "who_wins": "Brand o categoria che ne beneficia di più.",
      "who_loses": "Brand o categoria che rischia di più.",
      "confidence": "high | medium | low",
      "sources": [{"title": "...", "url": "https://...", "publisher": "...", "published_at": "YYYY-MM-DD"}]
    }
  ],
  "ai_llm_leaderboard": [
    {
      "rank": 1,
      "brand": "Nome brand",
      "product": "Nome prodotto",
      "why": "Perché è in cima questa settimana in termini di AI/LLM integration.",
      "integration_type": "Es: RAG su log SIEM / Agentic SOC / LLM per policy generation"
    }
  ],
  "recommendation": {
    "for_manager": "Una sola azione strategica da fare questa settimana.",
    "for_sales": "Un pitch angle concreto da usare questa settimana con i clienti.",
    "watch_next_week": "Il brand o trend da monitorare nella prossima settimana."
  }
}
Regole:
Massimo 5 brand, 4 market_signals, 5 ai_llm_leaderboard
Score AI da 0 a 10
Ogni summary in italiano, tono professionale ma comprensibile a manager non tecnici
Il JSON deve essere valido e parseable — nessun testo fuori dal JSON
Se un campo non è disponibile usa "n.d." per amount, mai null`

const BACKUP_JSON_PROMPT = `Sei un analista di market intelligence specializzato in backup, disaster recovery e cyber resilience.
La data di oggi è ${DATE}.
La settimana ISO corrente è ${WEEK}.
Esegui ricerche web aggiornate sulle notizie degli ULTIMI 7 GIORNI e produci un oggetto JSON valido con questa struttura esatta. Non aggiungere testo prima o dopo il JSON.
{
  "version": "1.0",
  "generated_at": "${DATE}",
  "week": ${WEEK},
  "summary": {
    "headline": "Una frase che riassume il tema dominante della settimana nel backup/DR.",
    "key_points": ["punto 1", "punto 2", "punto 3", "punto 4"],
    "trend": "rising | stable | declining"
  },
  "ai_leaderboard": [
    {
      "rank": 1,
      "vendor": "Nome vendor",
      "product": "Nome prodotto",
      "ai_score": 9,
      "key_feature": "La feature AI/LLM più rilevante di questa settimana.",
      "why": "2 frasi: perché è in questa posizione ora, cosa è cambiato."
    }
  ],
  "news": [
    {
      "section": "market | threat | product | regulation",
      "title": "Titolo notizia",
      "vendor": "Nome vendor o gruppo threat",
      "amount": "Valore economico o n.d.",
      "description": "2-3 frasi: cosa è successo e perché importa.",
      "implication": "Una sola azione concreta per Mauden o per i clienti."
    }
  ]
}
Regole:
- ai_leaderboard: 5 vendor (Veeam, Rubrik, Cohesity, HYCU, Commvault o variazioni recenti)
- news: 4-6 notizie, mix di market/threat/product
- ai_score da 1 a 10
- trend del summary basato sulle notizie della settimana
- Tutto in italiano, tono professionale ma diretto
- Il JSON deve essere valido e parseable — nessun testo fuori dal JSON`

const ACTIONS_JSON_PROMPT = `Sei un consulente commerciale specializzato in backup, DR e cyber resilience per system integrator italiani.
La data di oggi è ${DATE}.
La settimana ISO corrente è ${WEEK}.
Basandoti sulle notizie più recenti degli ULTIMI 7 GIORNI nel mercato backup/ransomware/DR, produci un oggetto JSON con 5-6 azioni commerciali concrete per Mauden. Non aggiungere testo prima o dopo il JSON.
{
  "week": ${WEEK},
  "generated_at": "${DATE}",
  "actions": [
    {
      "id": "act-001",
      "source_signal": "Il titolo della notizia o segnale di mercato che ha generato questa azione.",
      "risk": "2 frasi: quale rischio concreto corre il cliente se non agisce.",
      "action": "L'azione commerciale specifica da eseguire — a chi, con quale proposta, con quale urgenza.",
      "owner": "Sales | Pre-Sales | Technical | Sales / Pre-Sales",
      "priority": "high | medium | low",
      "mauden_service": "Nome del servizio Mauden da proporre (es: Ransomware Restore Test, Backup Architecture Modernization, Cyber Recovery Assessment)",
      "service_price": "Range indicativo in euro (es: €6k–€20k)",
      "status": "open",
      "deadline": "YYYY-MM-DD (entro 7-14 giorni)"
    }
  ]
}
Regole:
- 5-6 azioni, almeno 2 con priority high
- Le azioni devono essere concrete e specifiche, non generiche
- service_price realistico per il mercato italiano
- deadline entro 2 settimane dalla data odierna
- Tutto in italiano
- Il JSON deve essere valido e parseable — nessun testo fuori dal JSON`

// ─── GENERATION ─────────────────────────────────────────────────────────────

// Feed RSS gratuiti per notizie backup/ransomware/security
const RSS_FEEDS = [
  'https://www.bleepingcomputer.com/feed/',
  'https://feeds.feedburner.com/TheHackersNews',
  'https://www.darkreading.com/rss.xml',
  'https://www.veeam.com/blog/rss.xml',
]

async function fetchRSSNews() {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const items = []

  for (const url of RSS_FEEDS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      const xml = await res.text()

      // Estrae titoli, link e date dal RSS con regex semplice
      const entries = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
      for (const [, entry] of entries) {
        const title = entry.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim()
        const link = entry.match(/<link>(.*?)<\/link>/)?.[1]?.trim()
        const pubDate = entry.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim()
        const desc = entry.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]
          ?.replace(/<[^>]+>/g, '').trim().slice(0, 200)

        if (!title) continue
        const date = pubDate ? new Date(pubDate) : null
        if (date && date.getTime() < sevenDaysAgo) continue

        items.push({ title, link, date: date?.toISOString().split('T')[0] ?? DATE, desc })
      }
    } catch {
      // Feed non raggiungibile, continua con gli altri
    }
  }

  return items.slice(0, 40) // max 40 notizie come contesto
}

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Nessun JSON trovato nella risposta')
  return JSON.parse(match[0])
}

function logLLMOps(entry) {
  const dataDir = resolve(__dir, 'data')
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
  appendFileSync(LLMOPS_LOG, JSON.stringify(entry) + '\n')
}

async function callGroq(prompt, label) {
  console.log(`\n[generate] ${label} — chiamata a Groq API...`)
  const start = Date.now()

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  const text = data.choices?.[0]?.message?.content ?? ''
  const usage = data.usage ?? {}

  // Groq è gratuito — costo $0
  console.log(`[generate] ${label} — ${elapsed}s | tokens: ${usage.prompt_tokens ?? 0}in/${usage.completion_tokens ?? 0}out | costo: $0.00 (Groq free)`)

  logLLMOps({
    timestamp: new Date().toISOString(),
    label,
    model: 'llama-3.3-70b-versatile',
    week: WEEK,
    input_tokens: usage.prompt_tokens ?? 0,
    output_tokens: usage.completion_tokens ?? 0,
    cost_usd: 0,
    elapsed_s: parseFloat(elapsed),
  })

  return text
}

async function generateAll() {
  if (!process.env.GROQ_API_KEY) {
    console.error('Errore: GROQ_API_KEY non impostata.')
    console.error('Aggiungila in .env.local oppure: export GROQ_API_KEY=gsk_...')
    process.exit(1)
  }

  console.log(`\n=== CISO Brief Generator — Week ${WEEK} (${DATE}) ===`)

  // Fetch notizie recenti dai feed RSS
  console.log('\n[generate] Fetching notizie RSS degli ultimi 7 giorni...')
  const newsItems = await fetchRSSNews()
  console.log(`[generate] ${newsItems.length} notizie trovate dai feed RSS`)

  // Limita a 20 notizie e solo titolo+link per stare nel rate limit Groq (12k TPM free)
  const newsContext = newsItems.length > 0
    ? '\n\nNOTIZIE REALI DEGLI ULTIMI 7 GIORNI (usa queste come fonti primarie):\n' +
      newsItems.slice(0, 20).map(n => `- [${n.date}] ${n.title} | ${n.link ?? ''}`).join('\n')
    : '\n\n(Nessuna notizia RSS disponibile — usa la tua knowledge base aggiornata)'

  const jobs = [
    { label: 'brief.json',           prompt: BRIEF_JSON_PROMPT + newsContext,          file: BRIEF_FILE },
    { label: 'market_analysis.json', prompt: MARKET_ANALYSIS_JSON_PROMPT + newsContext, file: ANALYSIS_FILE },
    { label: 'backupl.json',         prompt: BACKUP_JSON_PROMPT + newsContext,          file: BACKUP_FILE },
    { label: 'action_register.json', prompt: ACTIONS_JSON_PROMPT + newsContext,         file: ACTIONS_FILE },
  ]

  for (const [i, job] of jobs.entries()) {
    // Attendi tra le chiamate per rispettare il rate limit Groq free (12k TPM)
    if (i > 0) {
      const wait = 30000
      console.log(`[generate] Attendo ${wait/1000}s per rate limit...`)
      await new Promise(r => setTimeout(r, wait))
    }
    try {
      const text = await callGroq(job.prompt, job.label)
      const data = extractJSON(text)

      // Salva backup del file precedente
      if (existsSync(job.file)) {
        const backup = job.file.replace('.json', `.backup-${DATE}.json`)
        writeFileSync(backup, readFileSync(job.file))
      }

      writeFileSync(job.file, JSON.stringify(data, null, 2))
      console.log(`[generate] ${job.label} — scritto ✓`)
    } catch (err) {
      console.error(`[generate] ${job.label} — ERRORE: ${err.message}`)
      console.error('[generate] Il file esistente NON è stato sovrascritto.')
    }
  }

  console.log(`\n=== Generazione completata — costo: $0.00 (Groq free tier) ===`)
  console.log(`Log LLMOps: ${LLMOPS_LOG}`)
  console.log('\nEsegui ora: node generate-brief.mjs --validate')
}

// ─── PROMPTS DEBUG ───────────────────────────────────────────────────────────

function printPrompt() {
  console.log(`=== BRIEF_JSON ===\n${BRIEF_JSON_PROMPT}\n\n=== MARKET_ANALYSIS_JSON ===\n${MARKET_ANALYSIS_JSON_PROMPT}`)
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

const args = new Set(process.argv.slice(2))

if (args.has('--prompt')) {
  printPrompt()
} else if (args.has('--generate')) {
  generateAll().catch(err => { console.error(err); process.exit(1) })
} else {
  validateDashboardJSON()
}
