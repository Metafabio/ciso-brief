#!/usr/bin/env node
/**
 * Manual CISO brief helper.
 *
 * This project does not call LLM APIs directly. The JSON files are populated
 * manually from a PromptOps session, then this script validates them locally.
 *
 * Usage:
 *   node generate-brief.mjs --prompt     Print the manual PromptOps prompt
 *   node generate-brief.mjs --validate   Validate public/*.json dashboard data
 *   node generate-brief.mjs              Same as --validate
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const BRIEF_FILE = resolve(__dir, 'public/brief.json')
const ANALYSIS_FILE = resolve(__dir, 'public/market_analysis.json')

const SECTION_IDS = ['ma-funding', 'ai-releases', 'threat-landscape', 'market-moves', 'backup-dr-ai']
const MOMENTUM_VALUES = ['rising', 'stable', 'declining']
const AI_LABELS = ['None', 'Basic', 'Advanced', 'Native']
const SIGNAL_TYPES = ['consolidation', 'disruption', 'regulation', 'adoption', 'investment']
const IMPACT_VALUES = ['high', 'medium', 'low']

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

function validateBrief(brief, errors, warnings) {
  if (!Number.isInteger(brief.week)) errors.push('brief.week deve essere un intero')
  if (brief.week !== WEEK) warnings.push(`brief.week (${brief.week}) non coincide con la settimana corrente (${WEEK})`)
  if (typeof brief.date !== 'string' || !brief.date) errors.push('brief.date mancante')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(brief.generated_at || '')) errors.push('brief.generated_at deve essere YYYY-MM-DD')
  if (brief.generated_at !== DATE) warnings.push(`brief.generated_at (${brief.generated_at}) non coincide con oggi (${DATE})`)
  if (!Array.isArray(brief.sections)) errors.push('brief.sections deve essere un array')

  const sections = Array.isArray(brief.sections) ? brief.sections : []
  const ids = sections.map(section => section.id)
  for (const id of SECTION_IDS) {
    if (!ids.includes(id)) warnings.push(`brief.sections manca la sezione ${id}`)
  }

  for (const section of sections) {
    if (!SECTION_IDS.includes(section.id)) errors.push(`brief.sections contiene id non previsto: ${section.id}`)
    if (!Array.isArray(section.items)) errors.push(`brief.sections.${section.id}.items deve essere un array`)
    if ((section.items || []).length > 5) warnings.push(`brief.sections.${section.id}.items supera il limite di 5`)
    if (typeof section.implication !== 'string' || !section.implication) {
      errors.push(`brief.sections.${section.id}.implication mancante`)
    }

    for (const [index, item] of (section.items || []).entries()) {
      if (typeof item.vendor !== 'string' || !item.vendor) errors.push(`${section.id}.items[${index}].vendor mancante`)
      if (typeof item.deal !== 'string' || !item.deal) errors.push(`${section.id}.items[${index}].deal mancante`)
      if (typeof item.summary !== 'string' || !item.summary) errors.push(`${section.id}.items[${index}].summary mancante`)
    }
  }
}

function validateAnalysis(analysis, brief, errors, warnings) {
  if (!Number.isInteger(analysis.week)) errors.push('market_analysis.week deve essere un intero')
  if (analysis.week !== brief.week) warnings.push(`week mismatch: brief=${brief.week}, market_analysis=${analysis.week}`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(analysis.generated_at || '')) {
    errors.push('market_analysis.generated_at deve essere YYYY-MM-DD')
  }
  if (analysis.generated_at !== brief.generated_at) {
    warnings.push(`generated_at mismatch: brief=${brief.generated_at}, market_analysis=${analysis.generated_at}`)
  }
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

function printPrompt() {
  const existingBrief = readJSON(BRIEF_FILE)

  console.log(`Sei un analista di market intelligence specializzato in cybersecurity, data protection, backup/DR e AI integration.

Data di oggi: ${DATE}
Settimana ISO corrente: ${WEEK}
Data italiana dashboard: ${DATE_IT}

Obiettivo:
Produci DUE oggetti JSON validi per popolare una dashboard Next.js:
1. public/brief.json
2. public/market_analysis.json

Regole generali:
- Usa ricerche web aggiornate sugli ultimi 7 giorni.
- Scrivi in italiano, tono business, concreto per CISO, manager e sales.
- Non inventare CVE, acquisizioni, certificazioni, importi o date: se non sei certo, ometti o scrivi "n.d.".
- Non aggiungere testo narrativo fuori dai JSON, salvo i titoli esatti:
  BRIEF_JSON
  MARKET_ANALYSIS_JSON
- Mantieni week=${WEEK} e generated_at="${DATE}" in entrambi i file.
- Il secondo JSON deve essere coerente con vendor, segnali e priorita del primo.

BRIEF_JSON deve avere questa struttura esatta:
{
  "week": ${WEEK},
  "date": "${DATE_IT}",
  "generated_at": "${DATE}",
  "sections": [
    {
      "id": "ma-funding",
      "items": [{"vendor": "...", "deal": "...", "amount": "...", "summary": "2-3 frasi."}],
      "implication": "Una sola azione concreta per manager o sales."
    },
    {
      "id": "ai-releases",
      "items": [{"vendor": "...", "deal": "...", "summary": "2-3 frasi."}],
      "implication": "Una sola azione concreta per manager o sales."
    },
    {
      "id": "threat-landscape",
      "items": [{"vendor": "...", "deal": "...", "summary": "2-3 frasi."}],
      "implication": "Una sola azione concreta prioritaria."
    },
    {
      "id": "market-moves",
      "items": [{"vendor": "...", "deal": "...", "summary": "2-3 frasi."}],
      "implication": "Una sola azione concreta per manager o sales."
    },
    {
      "id": "backup-dr-ai",
      "items": [{"vendor": "...", "deal": "...", "summary": "2-3 frasi su backup/DR/AI."}],
      "implication": "Una sola azione concreta nel settore backup/DR."
    }
  ]
}

Vincoli BRIEF_JSON:
- Esattamente 5 sezioni, con gli id indicati sopra.
- Massimo 5 item per sezione.
- Ogni item deve avere vendor, deal, summary. amount e opzionale.

MARKET_ANALYSIS_JSON deve avere questa struttura esatta:
{
  "week": ${WEEK},
  "generated_at": "${DATE}",
  "summary": "2-3 frasi executive summary.",
  "brands": [{
    "name": "...",
    "segment": "...",
    "momentum": "rising|stable|declining",
    "momentum_reason": "...",
    "ai_integration": {
      "score": 0,
      "label": "None|Basic|Advanced|Native",
      "features": [],
      "llm_model": "..."
    },
    "products_in_focus": [{
      "name": "...",
      "category": "...",
      "key_differentiator": "...",
      "ai_feature": "...",
      "target_buyer": "..."
    }],
    "competitive_threat": "...",
    "sales_angle": "..."
  }],
  "market_signals": [{
    "signal": "...",
    "type": "consolidation|disruption|regulation|adoption|investment",
    "impact": "high|medium|low",
    "description": "...",
    "who_wins": "...",
    "who_loses": "..."
  }],
  "ai_llm_leaderboard": [{
    "rank": 1,
    "brand": "...",
    "product": "...",
    "why": "...",
    "integration_type": "..."
  }],
  "recommendation": {
    "for_manager": "...",
    "for_sales": "...",
    "watch_next_week": "..."
  }
}

Vincoli MARKET_ANALYSIS_JSON:
- Massimo 5 brand.
- Massimo 4 market_signals.
- Massimo 5 elementi in ai_llm_leaderboard.
- score AI da 0 a 10.
- Usa solo momentum, label, type e impact ammessi dallo schema.

Brief attualmente pubblicato, da usare solo come riferimento di stile e non come fonte da copiare se datato:
${JSON.stringify(existingBrief, null, 2)}
`)
}

const args = new Set(process.argv.slice(2))

if (args.has('--prompt')) {
  printPrompt()
} else {
  validateDashboardJSON()
}
