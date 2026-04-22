import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export const maxDuration = 300

const ROOT = resolve(process.cwd())
const FILES = {
  brief:   resolve(ROOT, 'public/brief.json'),
  market:  resolve(ROOT, 'public/market_analysis.json'),
  backup:  resolve(ROOT, 'public/backupl.json'),
  actions: resolve(ROOT, 'public/action_register.json'),
}

const MODEL = 'perplexity/sonar-pro'

function getISOWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const y = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - y.getTime()) / 86400000 + 1) / 7)
}

async function callLLM(prompt: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ciso-brief.vercel.app',
      'X-Title': 'Resilience Revenue Brief',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

function extractJSON(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Nessun JSON nella risposta')
  return JSON.parse(match[0])
}

export async function POST() {
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({ type: 'error', msg: 'OPENROUTER_API_KEY non configurata in .env.local' }) + '\n',
      { status: 500, headers: { 'Content-Type': 'application/x-ndjson' } }
    )
  }

  const enc = new TextEncoder()
  const now = new Date()
  const DATE = now.toISOString().split('T')[0]
  const WEEK = getISOWeek(now)
  const DATE_IT = now.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

  const stream = new ReadableStream({
    async start(controller) {
      const push = (obj: object) => controller.enqueue(enc.encode(JSON.stringify(obj) + '\n'))

      push({ type: 'rss_start', msg: `Perplexity online — ricerca web integrata, nessun RSS necessario` })
      push({ type: 'rss_done', msg: `Modello: ${MODEL}`, headlines: [] })

      const SEARCH_INSTRUCTION = `Cerca online le notizie più recenti degli ultimi 7 giorni (da ${new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]} a ${DATE}) su backup, ransomware, Veeam, Rubrik, Cohesity, HYCU, Commvault, cyber resilience, data protection. Usa le notizie trovate come base per il JSON.`

      const BRIEF_PROMPT = `Sei un analista di market intelligence specializzato in cybersecurity, data protection e AI. ${SEARCH_INSTRUCTION}
La data di oggi è ${DATE}. La settimana ISO corrente è ${WEEK}.
Produci SOLO un oggetto JSON valido con questa struttura esatta, nessun testo prima o dopo:
{"week":${WEEK},"date":"${DATE_IT}","generated_at":"${DATE}","sections":[{"id":"ma-funding","items":[{"vendor":"...","deal":"...","amount":"...","summary":"2-3 frasi su notizia reale trovata online.","confidence":"high","sources":[{"title":"titolo articolo reale","url":"https://url-reale.com","publisher":"publisher reale","published_at":"${DATE}"}]}],"implication":"Azione concreta per system integrator."},{"id":"product-releases","items":[{"vendor":"...","deal":"...","summary":"2-3 frasi.","confidence":"high","sources":[{"title":"...","url":"https://...","publisher":"...","published_at":"${DATE}"}]}],"implication":"Azione concreta."},{"id":"threat-ransomware","items":[{"vendor":"...","deal":"...","summary":"2-3 frasi.","confidence":"high","sources":[{"title":"...","url":"https://...","publisher":"...","published_at":"${DATE}"}]}],"implication":"Azione concreta."},{"id":"ai-orchestration","items":[{"vendor":"...","deal":"...","summary":"2-3 frasi.","confidence":"medium","sources":[{"title":"...","url":"https://...","publisher":"...","published_at":"${DATE}"}]}],"implication":"Azione concreta."},{"id":"market-trends","items":[{"vendor":"...","deal":"...","summary":"2-3 frasi.","confidence":"medium","sources":[{"title":"...","url":"https://...","publisher":"...","published_at":"${DATE}"}]}],"implication":"Azione concreta."}]}
Max 3 item per sezione. Tutto in italiano. Usa solo notizie reali trovate con la ricerca web.`

      const MARKET_PROMPT = `Sei un analista di market intelligence specializzato in backup, DR e cybersecurity. ${SEARCH_INSTRUCTION}
La data di oggi è ${DATE}. La settimana ISO corrente è ${WEEK}.
Produci SOLO un oggetto JSON valido, nessun testo prima o dopo:
{"week":${WEEK},"generated_at":"${DATE}","summary":"Executive summary 2-3 frasi basato su notizie reali.","brands":[{"name":"Veeam","segment":"Backup & DR","momentum":"rising","momentum_reason":"motivazione basata su notizie reali","ai_integration":{"score":8,"label":"Advanced","features":["feature reale"],"llm_model":"n.d."},"products_in_focus":[{"name":"...","category":"...","key_differentiator":"...","ai_feature":"...","target_buyer":"IT Manager"}],"competitive_threat":"...","sales_angle":"..."}],"market_signals":[{"signal":"...","type":"consolidation","impact":"high","description":"...","who_wins":"...","who_loses":"...","confidence":"high","sources":[{"title":"...","url":"https://...","publisher":"...","published_at":"${DATE}"}]}],"ai_llm_leaderboard":[{"rank":1,"brand":"...","product":"...","why":"...","integration_type":"..."}],"recommendation":{"for_manager":"...","for_sales":"...","watch_next_week":"..."}}
5 brand (Veeam, Rubrik, Cohesity, HYCU, Commvault), 4 signals, 5 leaderboard. Tutto in italiano.`

      const BACKUP_PROMPT = `Sei un analista di backup e cyber resilience. ${SEARCH_INSTRUCTION}
La data di oggi è ${DATE}. La settimana ISO corrente è ${WEEK}.
Produci SOLO un oggetto JSON valido, nessun testo prima o dopo:
{"version":"1.0","generated_at":"${DATE}","week":${WEEK},"summary":{"headline":"Tema dominante settimana basato su notizie reali.","key_points":["punto 1","punto 2","punto 3","punto 4"],"trend":"rising"},"ai_leaderboard":[{"rank":1,"vendor":"Rubrik","product":"...","ai_score":9,"key_feature":"...","why":"2 frasi."},{"rank":2,"vendor":"Veeam","product":"...","ai_score":8,"key_feature":"...","why":"2 frasi."},{"rank":3,"vendor":"Cohesity","product":"...","ai_score":8,"key_feature":"...","why":"2 frasi."},{"rank":4,"vendor":"HYCU","product":"...","ai_score":7,"key_feature":"...","why":"2 frasi."},{"rank":5,"vendor":"Commvault","product":"...","ai_score":5,"key_feature":"...","why":"2 frasi."}],"news":[{"section":"market","title":"...","vendor":"...","amount":"n.d.","description":"2-3 frasi su notizia reale.","implication":"Azione concreta."},{"section":"threat","title":"...","vendor":"...","amount":"n.d.","description":"2-3 frasi.","implication":"Azione concreta."},{"section":"product","title":"...","vendor":"...","amount":"n.d.","description":"2-3 frasi.","implication":"Azione concreta."}]}
Tutto in italiano. Solo notizie reali trovate online.`

      const ACTIONS_PROMPT = `Sei un consulente commerciale per system integrator italiani specializzati in backup e DR. ${SEARCH_INSTRUCTION}
La data di oggi è ${DATE}. La settimana ISO corrente è ${WEEK}.
Basandoti sulle notizie reali trovate online, produci SOLO un oggetto JSON valido con 5 azioni commerciali concrete per Mauden, nessun testo prima o dopo:
{"week":${WEEK},"generated_at":"${DATE}","actions":[{"id":"act-001","source_signal":"notizia reale trovata online","risk":"2 frasi rischio cliente basate su notizia reale.","action":"Azione specifica con chi contattare e come.","owner":"Sales","priority":"high","mauden_service":"Ransomware Restore Test","service_price":"€6k–€20k","status":"open","deadline":"${new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]}"},{"id":"act-002","source_signal":"...","risk":"...","action":"...","owner":"Pre-Sales","priority":"high","mauden_service":"Backup Architecture Modernization","service_price":"€15k–€80k","status":"open","deadline":"${new Date(Date.now() + 10*24*60*60*1000).toISOString().split('T')[0]}"},{"id":"act-003","source_signal":"...","risk":"...","action":"...","owner":"Sales / Pre-Sales","priority":"medium","mauden_service":"Cyber Recovery Assessment","service_price":"€4k–€12k","status":"open","deadline":"${new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0]}"},{"id":"act-004","source_signal":"...","risk":"...","action":"...","owner":"Technical","priority":"medium","mauden_service":"...","service_price":"...","status":"open","deadline":"${new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0]}"},{"id":"act-005","source_signal":"...","risk":"...","action":"...","owner":"Sales","priority":"low","mauden_service":"...","service_price":"...","status":"open","deadline":"${new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0]}"}]}
Tutto in italiano. Azioni concrete basate su notizie reali di questa settimana.`

      const jobs = [
        { label: 'brief.json',           prompt: BRIEF_PROMPT,   file: FILES.brief },
        { label: 'market_analysis.json', prompt: MARKET_PROMPT,  file: FILES.market },
        { label: 'backupl.json',         prompt: BACKUP_PROMPT,  file: FILES.backup },
        { label: 'action_register.json', prompt: ACTIONS_PROMPT, file: FILES.actions },
      ]

      const results: Record<string, string> = {}

      for (const job of jobs) {
        push({ type: 'llm_start', label: job.label, msg: `LLM in corso...` })
        const t = Date.now()
        let lastErr = ''
        let ok = false
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const text = await callLLM(job.prompt)
            const data = extractJSON(text)
            if (existsSync(job.file)) {
              writeFileSync(job.file.replace('.json', `.backup-${DATE}.json`), readFileSync(job.file))
            }
            writeFileSync(job.file, JSON.stringify(data, null, 2))
            results[job.label] = 'ok'
            ok = true
            break
          } catch (err) {
            lastErr = err instanceof Error ? err.message : String(err)
          }
        }
        if (!ok) results[job.label] = `errore: ${lastErr}`
        push({
          type: ok ? 'llm_done' : 'llm_error',
          label: job.label,
          msg: ok ? `✓ ${((Date.now() - t) / 1000).toFixed(1)}s` : `✗ ${lastErr.slice(0, 80)}`,
        })
      }

      const allOk = Object.values(results).every(v => v === 'ok')
      push({ type: 'complete', success: allOk, week: WEEK, date: DATE, results })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' },
  })
}
