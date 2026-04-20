#!/usr/bin/env node
/**
 * generate-brief.mjs
 * Genera brief.json e market_analysis.json tramite Gemini,
 * poi deploya su Netlify via git push.
 *
 * Uso: node generate-brief.mjs
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

// ─── Config ───────────────────────────────────────────────────────────────────

function loadEnv() {
  try {
    const raw = readFileSync(resolve(__dir, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const [k, ...v] = line.split('=')
      if (k && v.length) process.env[k.trim()] = v.join('=').trim()
    }
  } catch {}
}
loadEnv()

const GEMINI_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_KEY) {
  console.error('❌  GEMINI_API_KEY mancante in .env.local')
  process.exit(1)
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getISOWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const y = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date - y) / 86400000 + 1) / 7)
}

const now    = new Date()
const DATE   = now.toISOString().split('T')[0]
const WEEK   = getISOWeek(now)
const DATE_IT = now.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

// ─── Gemini client ────────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(GEMINI_KEY)
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  tools: [{ googleSearch: {} }],
})

async function callGemini(prompt) {
  console.log('   → chiamata Gemini in corso...')
  const result = await model.generateContent(prompt)
  return result.response.text()
}

function extractJSON(text) {
  // Rimuove eventuali ```json ... ``` attorno al JSON
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = match ? match[1] : text
  return JSON.parse(raw.trim())
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const PROMPT_1 = `Sei un analista di market intelligence specializzato in cybersecurity, data protection e AI integration.

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

Regole: massimo 5 item per sezione, italiano, tono business. JSON puro, nessun testo fuori.`

function buildPrompt2(briefJson) {
  return `Sei un analista di market intelligence specializzato in comparazione competitiva nel settore cybersecurity, data protection e AI integration.

Hai ricevuto questo brief settimanale:
${JSON.stringify(briefJson, null, 2)}

Analizza i brand citati, arricchiscili con ricerche web aggiornate, e produci analisi comparativa in JSON valido. Nessun testo fuori dal JSON.

{
  "week": ${WEEK},
  "generated_at": "${DATE}",
  "summary": "2-3 frasi executive summary.",
  "brands": [{
    "name": "...", "segment": "...", "momentum": "rising|stable|declining",
    "momentum_reason": "...",
    "ai_integration": {"score": 0, "label": "None|Basic|Advanced|Native", "features": [], "llm_model": "..."},
    "products_in_focus": [{"name": "...", "category": "...", "key_differentiator": "...", "ai_feature": "...", "target_buyer": "..."}],
    "competitive_threat": "...",
    "sales_angle": "..."
  }],
  "market_signals": [{
    "signal": "...", "type": "consolidation|disruption|regulation|adoption|investment",
    "impact": "high|medium|low", "description": "...", "who_wins": "...", "who_loses": "..."
  }],
  "ai_llm_leaderboard": [{"rank": 1, "brand": "...", "product": "...", "why": "...", "integration_type": "..."}],
  "recommendation": {"for_manager": "...", "for_sales": "...", "watch_next_week": "..."}
}

Regole: max 5 brand, max 5 leaderboard, max 4 signal, score AI 0-10, italiano, JSON puro.`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔄  CISO Brief Generator — Week ${WEEK} (${DATE_IT})\n`)

  // 1. Genera brief.json
  console.log('📰  [1/4] Generazione Brief Settimanale...')
  const raw1 = await callGemini(PROMPT_1)
  const brief = extractJSON(raw1)
  writeFileSync(resolve(__dir, 'public/brief.json'), JSON.stringify(brief, null, 2))
  console.log(`   ✓ brief.json salvato (${brief.sections.length} sezioni)`)

  // 2. Genera market_analysis.json
  console.log('\n📊  [2/4] Generazione Analisi Comparativa...')
  const raw2 = await callGemini(buildPrompt2(brief))
  const analysis = extractJSON(raw2)
  writeFileSync(resolve(__dir, 'public/market_analysis.json'), JSON.stringify(analysis, null, 2))
  console.log(`   ✓ market_analysis.json salvato (${analysis.brands.length} brand)`)

  // 3. Git commit + push
  console.log('\n🚀  [3/4] Commit e push su GitHub...')
  execSync('git add public/brief.json public/market_analysis.json', { cwd: __dir, stdio: 'inherit' })
  execSync(`git commit -m "brief: week ${WEEK} — ${DATE}"`, { cwd: __dir, stdio: 'inherit' })
  execSync('git push origin main', { cwd: __dir, stdio: 'inherit' })
  console.log('   ✓ Pushato su GitHub')

  // 4. Done
  console.log('\n✅  [4/4] Netlify rideploya automaticamente.')
  console.log('   Monitora su: https://app.netlify.com\n')
}

main().catch(err => {
  console.error('\n❌  Errore:', err.message)
  process.exit(1)
})
