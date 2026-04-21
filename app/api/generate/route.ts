import { NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

export const maxDuration = 300 // 5 minuti (Vercel Pro / locale)

const ROOT = resolve(process.cwd())
const FILES = {
  brief:   resolve(ROOT, 'public/brief.json'),
  market:  resolve(ROOT, 'public/market_analysis.json'),
  backup:  resolve(ROOT, 'public/backupl.json'),
  actions: resolve(ROOT, 'public/action_register.json'),
}

const RSS_FEEDS = [
  'https://www.bleepingcomputer.com/feed/',
  'https://feeds.feedburner.com/TheHackersNews',
  'https://www.darkreading.com/rss.xml',
  'https://www.veeam.com/blog/rss.xml',
]

function getISOWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const y = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - y.getTime()) / 86400000 + 1) / 7)
}

async function fetchRSSNews(): Promise<string> {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const items: string[] = []

  for (const url of RSS_FEEDS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      const xml = await res.text()
      const entries = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)
      for (const [, entry] of entries) {
        const title = entry.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1]?.trim()
        const link = entry.match(/<link>(.*?)<\/link>/)?.[1]?.trim()
        const pubDate = entry.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim()
        if (!title) continue
        const date = pubDate ? new Date(pubDate) : null
        if (date && date.getTime() < sevenDaysAgo) continue
        items.push(`- [${date?.toISOString().split('T')[0] ?? ''}] ${title} | ${link ?? ''}`)
        if (items.length >= 20) break
      }
    } catch { /* feed non raggiungibile */ }
  }

  return items.length > 0
    ? '\n\nNOTIZIE REALI DEGLI ULTIMI 7 GIORNI:\n' + items.join('\n')
    : ''
}

async function callGroq(prompt: string): Promise<string> {
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
    throw new Error(`Groq error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

function extractJSON(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Nessun JSON nella risposta')
  return JSON.parse(match[0])
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export async function POST() {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY non configurata in .env.local' }, { status: 500 })
  }

  const now = new Date()
  const DATE = now.toISOString().split('T')[0]
  const WEEK = getISOWeek(now)
  const DATE_IT = now.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

  // Fetch notizie RSS
  const newsContext = await fetchRSSNews()

  const BRIEF_PROMPT = `Sei un analista di market intelligence specializzato in cybersecurity, data protection e AI.
La data di oggi è ${DATE}. La settimana ISO corrente è ${WEEK}.
Produci SOLO un oggetto JSON valido con questa struttura esatta, nessun testo prima o dopo:
{"week":${WEEK},"date":"${DATE_IT}","generated_at":"${DATE}","sections":[{"id":"ma-funding","items":[{"vendor":"...","deal":"...","amount":"...","summary":"2-3 frasi.","confidence":"high","sources":[{"title":"...","url":"https://...","publisher":"...","published_at":"${DATE}"}]}],"implication":"Azione concreta."},{"id":"product-releases","items":[{"vendor":"...","deal":"...","summary":"2-3 frasi.","confidence":"high","sources":[{"title":"...","url":"https://...","publisher":"...","published_at":"${DATE}"}]}],"implication":"Azione concreta."},{"id":"threat-ransomware","items":[{"vendor":"...","deal":"...","summary":"2-3 frasi.","confidence":"high","sources":[{"title":"...","url":"https://...","publisher":"...","published_at":"${DATE}"}]}],"implication":"Azione concreta."},{"id":"ai-orchestration","items":[{"vendor":"...","deal":"...","summary":"2-3 frasi.","confidence":"medium","sources":[{"title":"...","url":"https://...","publisher":"...","published_at":"${DATE}"}]}],"implication":"Azione concreta."},{"id":"market-trends","items":[{"vendor":"...","deal":"...","summary":"2-3 frasi.","confidence":"medium","sources":[{"title":"...","url":"https://...","publisher":"...","published_at":"${DATE}"}]}],"implication":"Azione concreta."}]}
Max 3 item per sezione. Tutto in italiano.${newsContext}`

  const MARKET_PROMPT = `Sei un analista di market intelligence specializzato in backup, DR e cybersecurity.
La data di oggi è ${DATE}. La settimana ISO corrente è ${WEEK}.
Produci SOLO un oggetto JSON valido, nessun testo prima o dopo:
{"week":${WEEK},"generated_at":"${DATE}","summary":"Executive summary 2-3 frasi.","brands":[{"name":"Veeam","segment":"Backup & DR","momentum":"rising","momentum_reason":"...","ai_integration":{"score":8,"label":"Advanced","features":["feature"],"llm_model":"n.d."},"products_in_focus":[{"name":"...","category":"...","key_differentiator":"...","ai_feature":"...","target_buyer":"IT Manager"}],"competitive_threat":"...","sales_angle":"..."}],"market_signals":[{"signal":"...","type":"consolidation","impact":"high","description":"...","who_wins":"...","who_loses":"...","confidence":"high","sources":[{"title":"...","url":"https://...","publisher":"...","published_at":"${DATE}"}]}],"ai_llm_leaderboard":[{"rank":1,"brand":"...","product":"...","why":"...","integration_type":"..."}],"recommendation":{"for_manager":"...","for_sales":"...","watch_next_week":"..."}}
5 brand (Veeam, Rubrik, Cohesity, HYCU, Commvault), 4 signals, 5 leaderboard. Tutto in italiano.${newsContext}`

  const BACKUP_PROMPT = `Sei un analista di backup e cyber resilience.
La data di oggi è ${DATE}. La settimana ISO corrente è ${WEEK}.
Produci SOLO un oggetto JSON valido, nessun testo prima o dopo:
{"version":"1.0","generated_at":"${DATE}","week":${WEEK},"summary":{"headline":"Tema dominante settimana.","key_points":["punto 1","punto 2","punto 3","punto 4"],"trend":"rising"},"ai_leaderboard":[{"rank":1,"vendor":"Rubrik","product":"...","ai_score":9,"key_feature":"...","why":"2 frasi."},{"rank":2,"vendor":"Veeam","product":"...","ai_score":8,"key_feature":"...","why":"2 frasi."},{"rank":3,"vendor":"Cohesity","product":"...","ai_score":8,"key_feature":"...","why":"2 frasi."},{"rank":4,"vendor":"HYCU","product":"...","ai_score":7,"key_feature":"...","why":"2 frasi."},{"rank":5,"vendor":"Commvault","product":"...","ai_score":5,"key_feature":"...","why":"2 frasi."}],"news":[{"section":"market","title":"...","vendor":"...","amount":"n.d.","description":"2-3 frasi.","implication":"Azione concreta."},{"section":"threat","title":"...","vendor":"...","amount":"n.d.","description":"2-3 frasi.","implication":"Azione concreta."},{"section":"product","title":"...","vendor":"...","amount":"n.d.","description":"2-3 frasi.","implication":"Azione concreta."}]}
Tutto in italiano.${newsContext}`

  const ACTIONS_PROMPT = `Sei un consulente commerciale per system integrator italiani specializzati in backup e DR.
La data di oggi è ${DATE}. La settimana ISO corrente è ${WEEK}.
Produci SOLO un oggetto JSON valido con 5 azioni commerciali concrete per Mauden, nessun testo prima o dopo:
{"week":${WEEK},"generated_at":"${DATE}","actions":[{"id":"act-001","source_signal":"...","risk":"2 frasi rischio cliente.","action":"Azione specifica con chi e come.","owner":"Sales","priority":"high","mauden_service":"Ransomware Restore Test","service_price":"€6k–€20k","status":"open","deadline":"${new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]}"},{"id":"act-002","source_signal":"...","risk":"...","action":"...","owner":"Pre-Sales","priority":"high","mauden_service":"Backup Architecture Modernization","service_price":"€15k–€80k","status":"open","deadline":"${new Date(Date.now() + 10*24*60*60*1000).toISOString().split('T')[0]}"},{"id":"act-003","source_signal":"...","risk":"...","action":"...","owner":"Sales / Pre-Sales","priority":"medium","mauden_service":"Cyber Recovery Assessment","service_price":"€4k–€12k","status":"open","deadline":"${new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0]}"},{"id":"act-004","source_signal":"...","risk":"...","action":"...","owner":"Technical","priority":"medium","mauden_service":"...","service_price":"...","status":"open","deadline":"${new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0]}"},{"id":"act-005","source_signal":"...","risk":"...","action":"...","owner":"Sales","priority":"low","mauden_service":"...","service_price":"...","status":"open","deadline":"${new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0]}"}]}
Tutto in italiano. Azioni concrete e specifiche, non generiche.${newsContext}`

  const jobs = [
    { label: 'brief.json',           prompt: BRIEF_PROMPT,   file: FILES.brief },
    { label: 'market_analysis.json', prompt: MARKET_PROMPT,  file: FILES.market },
    { label: 'backupl.json',         prompt: BACKUP_PROMPT,  file: FILES.backup },
    { label: 'action_register.json', prompt: ACTIONS_PROMPT, file: FILES.actions },
  ]

  const results: Record<string, string> = {}

  for (const [i, job] of jobs.entries()) {
    if (i > 0) await sleep(30000)
    let lastErr = ''
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (attempt > 1) await sleep(15000)
        const text = await callGroq(job.prompt)
        const data = extractJSON(text)
        if (existsSync(job.file)) {
          writeFileSync(job.file.replace('.json', `.backup-${DATE}.json`), readFileSync(job.file))
        }
        writeFileSync(job.file, JSON.stringify(data, null, 2))
        results[job.label] = 'ok'
        break
      } catch (err) {
        lastErr = err instanceof Error ? err.message : String(err)
        if (attempt === 3) results[job.label] = `errore: ${lastErr}`
      }
    }
  }

  const allOk = Object.values(results).every(v => v === 'ok')
  return NextResponse.json({ success: allOk, week: WEEK, date: DATE, results })
}
