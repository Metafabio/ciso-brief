'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types — Brief ────────────────────────────────────────────────────────────

type SectionId = 'ma-funding' | 'ai-releases' | 'threat-landscape' | 'market-moves' | 'backup-dr-ai'
type Theme = 'slate' | 'ember' | 'arctic'
type Tab = 'brief' | 'analysis'

interface BriefItem {
  vendor: string
  deal: string
  amount?: string
  summary: string
}

interface BriefSection {
  id: SectionId
  items: BriefItem[]
  implication: string
}

interface BriefData {
  week: number
  date: string
  generated_at: string
  sections: BriefSection[]
}

// ─── Types — Market Analysis ──────────────────────────────────────────────────

interface AIIntegration {
  score: number
  label: 'None' | 'Basic' | 'Advanced' | 'Native'
  features: string[]
  llm_model: string
}

interface ProductFocus {
  name: string
  category: string
  key_differentiator: string
  ai_feature: string
  target_buyer: string
}

interface Brand {
  name: string
  segment: string
  momentum: 'rising' | 'stable' | 'declining'
  momentum_reason: string
  ai_integration: AIIntegration
  products_in_focus: ProductFocus[]
  competitive_threat: string
  sales_angle: string
}

interface MarketSignal {
  signal: string
  type: 'consolidation' | 'disruption' | 'regulation' | 'adoption' | 'investment'
  impact: 'high' | 'medium' | 'low'
  description: string
  who_wins: string
  who_loses: string
}

interface LeaderboardEntry {
  rank: number
  brand: string
  product: string
  why: string
  integration_type: string
}

interface MarketAnalysis {
  week: number
  generated_at: string
  summary: string
  brands: Brand[]
  market_signals: MarketSignal[]
  ai_llm_leaderboard: LeaderboardEntry[]
  recommendation: {
    for_manager: string
    for_sales: string
    watch_next_week: string
  }
}

// ─── Section metadata ─────────────────────────────────────────────────────────

const SECTION_META: Record<SectionId, { title: string; icon: string; accent: string }> = {
  'ma-funding':       { title: 'M&A / Funding',        icon: '◈', accent: '#f59e0b' },
  'ai-releases':      { title: 'Release & Feature AI',  icon: '◎', accent: '#6366f1' },
  'threat-landscape': { title: 'Threat Landscape',      icon: '◉', accent: '#ef4444' },
  'market-moves':     { title: 'Mosse di Mercato',      icon: '◇', accent: '#10b981' },
  'backup-dr-ai':     { title: 'Backup & DR / AI',      icon: '◫', accent: '#06b6d4' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const MOMENTUM_ICON: Record<string, string> = { rising: '↑', stable: '→', declining: '↓' }
const MOMENTUM_COLOR: Record<string, string> = { rising: '#10b981', stable: '#94a3b8', declining: '#ef4444' }
const SIGNAL_COLOR: Record<string, string> = {
  consolidation: '#f59e0b', disruption: '#ef4444',
  regulation: '#6366f1', adoption: '#10b981', investment: '#06b6d4',
}
const IMPACT_COLOR: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#94a3b8' }

function buildBriefMd(brief: BriefData): string {
  const lines = [`# CISO Intelligence Brief — Week ${brief.week}`, `*${brief.date}*`, '', '---', '']
  for (const section of brief.sections) {
    const meta = SECTION_META[section.id]
    if (!meta) continue
    lines.push(`## ${meta.icon} ${meta.title}`, '')
    for (const item of section.items) {
      lines.push(item.amount ? `**${item.vendor}** — ${item.deal} · ${item.amount}` : `**${item.vendor}** — ${item.deal}`, '', item.summary, '')
    }
    lines.push('---', `⚡ **Implicazione:** ${section.implication}`, '', '---', '')
  }
  return lines.join('\n')
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ padding: '2px 0' }}>
      {[88, 100, 72, 100, 58, 82, 100, 42].map((w, i) => (
        <div key={i} className="skel" style={{ width: `${w}%`, animationDelay: `${i * 0.06}s` }} />
      ))}
    </div>
  )
}

// ─── Brief — Section body ─────────────────────────────────────────────────────

function SectionBody({ section, accent }: { section: BriefSection; accent: string }) {
  return (
    <div>
      {section.items.map((item, i) => (
        <div key={i} style={{
          marginBottom: i < section.items.length - 1 ? '18px' : '14px',
          paddingBottom: i < section.items.length - 1 ? '18px' : 0,
          borderBottom: i < section.items.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px', marginBottom: '5px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.vendor}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              — {item.deal}{item.amount ? ` · ${item.amount}` : ''}
            </span>
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.85, color: 'var(--text-secondary)', margin: 0 }}>{item.summary}</p>
        </div>
      ))}
      <div style={{
        marginTop: '6px', padding: '10px 12px',
        background: hexToRgba(accent, 0.08),
        borderLeft: `2px solid ${accent}`,
        borderRadius: '0 4px 4px 0',
        fontSize: '13px', lineHeight: 1.75, color: 'var(--text-secondary)',
      }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>⚡ Implicazione per il CISO:</span>{' '}{section.implication}
      </div>
    </div>
  )
}

// ─── Brief — Accordion ────────────────────────────────────────────────────────

function AccordionSection({ section, isOpen, onToggle }: {
  section: BriefSection; isOpen: boolean; onToggle: () => void
}) {
  const meta = SECTION_META[section.id]
  return (
    <div style={{ border: '1px solid var(--border)', borderLeft: `3px solid ${meta.accent}`, borderRadius: '6px', background: 'var(--surface)', overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ width: '100%', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ color: meta.accent, fontSize: '14px', lineHeight: 1, flexShrink: 0 }}>{meta.icon}</span>
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.02em', flex: 1 }}>{meta.title}</span>
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: meta.accent, background: hexToRgba(meta.accent, 0.1), border: `1px solid ${hexToRgba(meta.accent, 0.25)}`, padding: '2px 7px', borderRadius: '3px', flexShrink: 0 }}>
          {section.items.length} news
        </span>
        <svg className={`chevron ${isOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className={`accordion-grid ${isOpen ? 'open' : ''}`}>
        <div className="accordion-inner">
          <div style={{ padding: '0 18px 18px' }}>
            <SectionBody section={section} accent={meta.accent} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Analysis — Brand card ────────────────────────────────────────────────────

function BrandCard({ brand }: { brand: Brand }) {
  const [open, setOpen] = useState(false)
  const mColor = MOMENTUM_COLOR[brand.momentum]
  const scoreColor = brand.ai_integration.score >= 8 ? '#10b981' : brand.ai_integration.score >= 5 ? '#f59e0b' : '#64748b'

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--surface)', overflow: 'hidden' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        {/* Momentum */}
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '16px', color: mColor, lineHeight: 1, flexShrink: 0 }}>
          {MOMENTUM_ICON[brand.momentum]}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{brand.name}</span>
            <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-secondary)', background: hexToRgba('#ffffff', 0.04), border: '1px solid var(--border)', padding: '1px 6px', borderRadius: '3px' }}>{brand.segment}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>{brand.momentum_reason}</div>
        </div>
        {/* AI score */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '16px', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{brand.ai_integration.score}</div>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>AI</div>
        </div>
        <svg className={`chevron ${open ? 'open' : ''}`} width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={`accordion-grid ${open ? 'open' : ''}`}>
        <div className="accordion-inner">
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* AI integration detail */}
            <div style={{ padding: '10px 12px', background: hexToRgba('#6366f1', 0.06), borderLeft: '2px solid #6366f1', borderRadius: '0 4px 4px 0' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6366f1', marginBottom: '6px' }}>
                AI Integration · {brand.ai_integration.label} · {brand.ai_integration.llm_model}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {brand.ai_integration.features.map((f, i) => (
                  <span key={i} style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-secondary)', background: hexToRgba('#ffffff', 0.04), border: '1px solid var(--border)', padding: '2px 7px', borderRadius: '3px' }}>{f}</span>
                ))}
              </div>
            </div>

            {/* Products */}
            {brand.products_in_focus.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.category} · {p.target_buyer}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: '0 0 4px' }}>{p.key_differentiator}</p>
                {p.ai_feature !== 'n.d.' && (
                  <p style={{ fontSize: '12px', color: '#6366f1', lineHeight: 1.6, margin: 0 }}>⬡ {p.ai_feature}</p>
                )}
              </div>
            ))}

            {/* Competitive threat */}
            <div>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ef4444', marginBottom: '4px' }}>Minaccia competitiva</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{brand.competitive_threat}</p>
            </div>

            {/* Sales angle */}
            <div style={{ padding: '10px 12px', background: hexToRgba('#10b981', 0.06), borderLeft: '2px solid #10b981', borderRadius: '0 4px 4px 0' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981', marginBottom: '4px' }}>Sales Angle</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{brand.sales_angle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Analysis — View ──────────────────────────────────────────────────────────

function AnalysisView({ data }: { data: MarketAnalysis }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Executive summary */}
      <div style={{ padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.85 }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '8px' }}>Executive Summary</div>
        {data.summary}
      </div>

      {/* AI/LLM Leaderboard */}
      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '10px' }}>AI / LLM Leaderboard</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.ai_llm_leaderboard.map((entry) => (
            <div key={entry.rank} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '18px', fontWeight: 700, color: entry.rank === 1 ? '#f59e0b' : entry.rank === 2 ? '#94a3b8' : 'var(--text-secondary)', lineHeight: 1, flexShrink: 0, width: '24px', textAlign: 'center' }}>
                {entry.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.brand}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{entry.product}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 3px' }}>{entry.why}</p>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#6366f1', background: hexToRgba('#6366f1', 0.08), border: `1px solid ${hexToRgba('#6366f1', 0.2)}`, padding: '1px 6px', borderRadius: '3px' }}>{entry.integration_type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand cards */}
      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '10px' }}>Brand Analysis</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.brands.map((brand) => <BrandCard key={brand.name} brand={brand} />)}
        </div>
      </div>

      {/* Market signals */}
      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '10px' }}>Market Signals</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.market_signals.map((s, i) => (
            <div key={i} style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${SIGNAL_COLOR[s.type]}`, borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{s.signal}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: SIGNAL_COLOR[s.type], background: hexToRgba(SIGNAL_COLOR[s.type], 0.1), border: `1px solid ${hexToRgba(SIGNAL_COLOR[s.type], 0.25)}`, padding: '2px 6px', borderRadius: '3px' }}>{s.type}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: IMPACT_COLOR[s.impact], background: hexToRgba(IMPACT_COLOR[s.impact], 0.1), border: `1px solid ${hexToRgba(IMPACT_COLOR[s.impact], 0.25)}`, padding: '2px 6px', borderRadius: '3px' }}>{s.impact}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: '0 0 8px' }}>{s.description}</p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#10b981' }}>↑ {s.who_wins}</span>
                <span style={{ fontSize: '12px', color: '#ef4444' }}>↓ {s.who_loses}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
        {[
          { label: 'Per il Manager', value: data.recommendation.for_manager, accent: '#6366f1' },
          { label: 'Per il Sales', value: data.recommendation.for_sales, accent: '#10b981' },
          { label: 'Da monitorare', value: data.recommendation.watch_next_week, accent: '#f59e0b' },
        ].map((r) => (
          <div key={r.label} style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `2px solid ${r.accent}`, borderRadius: '6px' }}>
            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: r.accent, marginBottom: '6px' }}>{r.label}</div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Theme switcher ───────────────────────────────────────────────────────────

const THEMES: { id: Theme; label: string }[] = [
  { id: 'slate', label: 'SLATE' },
  { id: 'ember', label: 'EMBER' },
  { id: 'arctic', label: 'ARCTIC' },
]

function ThemeSwitcher({ current, onChange }: { current: Theme; onChange: (t: Theme) => void }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {THEMES.map((t) => {
        const active = t.id === current
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.1em',
            padding: '4px 8px', border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '3px', background: active ? hexToRgba('#ffffff', 0.04) : 'transparent',
            color: active ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [theme, setTheme] = useState<Theme>('slate')
  const [tab, setTab] = useState<Tab>('brief')
  const [brief, setBrief] = useState<BriefData | null>(null)
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem('ciso_theme') as Theme | null
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/brief.json').then(r => r.json()) as Promise<BriefData>,
      fetch('/market_analysis.json').then(r => r.json()) as Promise<MarketAnalysis>,
    ]).then(([b, a]) => {
      setBrief(b)
      setAnalysis(a)
      setOpenSections(new Set(b.sections.map(s => s.id)))
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [])

  const handleTheme = useCallback((t: Theme) => {
    setTheme(t)
    localStorage.setItem('ciso_theme', t)
  }, [])

  const toggleSection = useCallback((id: SectionId) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }, [])

  const handleExport = useCallback(() => {
    if (!brief) return
    const md = buildBriefMd(brief)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ciso-brief-w${brief.week}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [brief])

  const headerTitle = brief ? `CISO Intelligence · Week ${brief.week}` : 'CISO Intelligence'
  const headerDate = brief ? `ultimo aggiornamento: ${brief.date}` : '—'

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header style={{ borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-primary)', fontWeight: 500 }}>
            {headerTitle}
          </div>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#475569', marginTop: '2px' }}>
            {headerDate}
          </div>
        </div>
        <ThemeSwitcher current={theme} onChange={handleTheme} />
      </header>

      {/* ── Tab bar ── */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '0 24px', display: 'flex', gap: '0', background: 'var(--bg)' }}>
        {([
          { id: 'brief' as Tab, label: 'Brief Settimanale' },
          { id: 'analysis' as Tab, label: 'Analisi Comparativa' },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
            transition: 'all 0.15s', marginBottom: '-1px',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <main style={{ flex: 1, padding: '24px 24px 56px', maxWidth: '760px', width: '100%', margin: '0 auto' }}>

        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(SECTION_META).map(([id, meta]) => (
              <div key={id} style={{ border: '1px solid var(--border)', borderLeft: `3px solid ${meta.accent}`, borderRadius: '6px', background: 'var(--surface)', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: meta.accent, fontSize: '14px' }}>{meta.icon}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>{meta.title}</span>
                <span className="pulse-dot" style={{ background: meta.accent }} />
              </div>
            ))}
          </div>
        )}

        {/* Brief tab */}
        {!isLoading && tab === 'brief' && brief && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {brief.sections.map(section => (
                <AccordionSection key={section.id} section={section} isOpen={openSections.has(section.id)} onToggle={() => toggleSection(section.id)} />
              ))}
            </div>
            <div className="fade-in" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={handleExport} style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                export .md
              </button>
            </div>
          </>
        )}

        {/* Analysis tab */}
        {!isLoading && tab === 'analysis' && analysis && (
          <AnalysisView data={analysis} />
        )}

        {!isLoading && tab === 'analysis' && !analysis && (
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--text-secondary)', padding: '40px 0', textAlign: 'center' }}>
            market_analysis.json non trovato
          </div>
        )}
      </main>
    </div>
  )
}
