'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId = 'ma-funding' | 'ai-releases' | 'threat-landscape' | 'market-moves'
type Theme = 'slate' | 'ember' | 'arctic'

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

// ─── Section metadata ─────────────────────────────────────────────────────────

const SECTION_META: Record<SectionId, { title: string; icon: string; accent: string }> = {
  'ma-funding':        { title: 'M&A / Funding',        icon: '◈', accent: '#f59e0b' },
  'ai-releases':       { title: 'Release & Feature AI',  icon: '◎', accent: '#6366f1' },
  'threat-landscape':  { title: 'Threat Landscape',      icon: '◉', accent: '#ef4444' },
  'market-moves':      { title: 'Mosse di Mercato',      icon: '◇', accent: '#10b981' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function buildExportMd(brief: BriefData): string {
  const lines = [
    `# CISO Intelligence Brief — Week ${brief.week}`,
    `*${brief.date}*`,
    '', '---', '',
  ]
  for (const section of brief.sections) {
    const meta = SECTION_META[section.id]
    if (!meta) continue
    lines.push(`## ${meta.icon} ${meta.title}`, '')
    for (const item of section.items) {
      const heading = item.amount
        ? `**${item.vendor}** — ${item.deal} · ${item.amount}`
        : `**${item.vendor}** — ${item.deal}`
      lines.push(heading, '', item.summary, '')
    }
    lines.push(`---`, `⚡ **Implicazione per il CISO:** ${section.implication}`, '', '---', '')
  }
  return lines.join('\n')
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ padding: '2px 0' }}>
      {[88, 100, 72, 100, 58, 82, 100, 42].map((w, i) => (
        <div
          key={i}
          className="skel"
          style={{ width: `${w}%`, animationDelay: `${i * 0.06}s` }}
        />
      ))}
    </div>
  )
}

// ─── Section body ─────────────────────────────────────────────────────────────

function SectionBody({ section, accent }: { section: BriefSection; accent: string }) {
  return (
    <div>
      {section.items.map((item, i) => (
        <div
          key={i}
          style={{
            marginBottom: i < section.items.length - 1 ? '18px' : '14px',
            paddingBottom: i < section.items.length - 1 ? '18px' : 0,
            borderBottom: i < section.items.length - 1
              ? '1px solid var(--border)'
              : 'none',
          }}
        >
          {/* Vendor + deal */}
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px', marginBottom: '5px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {item.vendor}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              — {item.deal}{item.amount ? ` · ${item.amount}` : ''}
            </span>
          </div>
          {/* Summary */}
          <p style={{ fontSize: '13px', lineHeight: 1.85, color: 'var(--text-secondary)', margin: 0 }}>
            {item.summary}
          </p>
        </div>
      ))}

      {/* Implication */}
      <div
        style={{
          marginTop: '6px',
          padding: '10px 12px',
          background: hexToRgba(accent, 0.08),
          borderLeft: `2px solid ${accent}`,
          borderRadius: '0 4px 4px 0',
          fontSize: '13px',
          lineHeight: 1.75,
          color: 'var(--text-secondary)',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>⚡ Implicazione per il CISO:</span>{' '}
        {section.implication}
      </div>
    </div>
  )
}

// ─── Accordion ────────────────────────────────────────────────────────────────

function AccordionSection({
  section,
  isOpen,
  onToggle,
  isLoading,
}: {
  section: BriefSection
  isOpen: boolean
  onToggle: () => void
  isLoading: boolean
}) {
  const meta = SECTION_META[section.id]

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${meta.accent}`,
        borderRadius: '6px',
        background: 'var(--surface)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '13px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ color: meta.accent, fontSize: '14px', lineHeight: 1, flexShrink: 0 }}>
          {meta.icon}
        </span>

        <span style={{
          fontFamily: 'var(--font-dm-mono)',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          letterSpacing: '0.02em',
          flex: 1,
        }}>
          {meta.title}
        </span>

        {!isLoading && (
          <span style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: meta.accent,
            background: hexToRgba(meta.accent, 0.1),
            border: `1px solid ${hexToRgba(meta.accent, 0.25)}`,
            padding: '2px 7px',
            borderRadius: '3px',
            flexShrink: 0,
          }}>
            {section.items.length} news
          </span>
        )}

        <svg
          className={`chevron ${isOpen ? 'open' : ''}`}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ flexShrink: 0 }}
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Body */}
      <div className={`accordion-grid ${isOpen ? 'open' : ''}`}>
        <div className="accordion-inner">
          <div style={{ padding: '0 18px 18px' }}>
            {isLoading ? <Skeleton /> : <SectionBody section={section} accent={meta.accent} />}
          </div>
        </div>
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
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              fontFamily: 'var(--font-dm-mono)',
              fontSize: '10px',
              letterSpacing: '0.1em',
              padding: '4px 8px',
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '3px',
              background: active ? hexToRgba('#ffffff', 0.04) : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
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
  const [brief, setBrief] = useState<BriefData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set())

  // Persist theme
  useEffect(() => {
    const stored = localStorage.getItem('ciso_theme') as Theme | null
    if (stored) setTheme(stored)
  }, [])

  // Fetch brief.json on mount
  useEffect(() => {
    fetch('/brief.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<BriefData>
      })
      .then((data) => {
        setBrief(data)
        // Auto-open all sections
        setOpenSections(new Set(data.sections.map((s) => s.id)))
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  const handleTheme = useCallback((t: Theme) => {
    setTheme(t)
    localStorage.setItem('ciso_theme', t)
  }, [])

  const toggleSection = useCallback((id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleExport = useCallback(() => {
    if (!brief) return
    const md = buildExportMd(brief)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ciso-brief-w${brief.week}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [brief])

  const headerTitle = brief
    ? `CISO Intelligence · Week ${brief.week}`
    : 'CISO Intelligence'
  const headerDate = brief
    ? `ultimo aggiornamento: ${brief.date}`
    : '—'

  return (
    <div
      data-theme={theme}
      style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}
    >
      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        position: 'sticky',
        top: 0,
        background: 'var(--bg)',
        zIndex: 20,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            fontWeight: 500,
          }}>
            {headerTitle}
          </div>
          <div style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '11px',
            color: '#475569',
            marginTop: '2px',
          }}>
            {headerDate}
          </div>
        </div>
        <ThemeSwitcher current={theme} onChange={handleTheme} />
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, padding: '28px 24px 56px', maxWidth: '760px', width: '100%', margin: '0 auto' }}>

        {/* Error state */}
        {error && (
          <div style={{
            fontFamily: 'var(--font-dm-mono)',
            fontSize: '12px',
            color: '#f87171',
            padding: '12px 16px',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '6px',
            marginBottom: '20px',
          }}>
            Errore caricamento brief.json: {error}
          </div>
        )}

        {/* Loading placeholders */}
        {isLoading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(SECTION_META).map(([id, meta]) => (
              <div key={id} style={{
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${meta.accent}`,
                borderRadius: '6px',
                background: 'var(--surface)',
                padding: '13px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <span style={{ color: meta.accent, fontSize: '14px' }}>{meta.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-dm-mono)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  flex: 1,
                }}>
                  {meta.title}
                </span>
                <span className="pulse-dot" style={{ background: meta.accent }} />
              </div>
            ))}
          </div>
        )}

        {/* Accordions */}
        {brief && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {brief.sections.map((section) => (
              <AccordionSection
                key={section.id}
                section={section}
                isOpen={openSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
                isLoading={false}
              />
            ))}
          </div>
        )}

        {/* Export */}
        {brief && (
          <div className="fade-in" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              onClick={handleExport}
              style={{
                fontFamily: 'var(--font-dm-mono)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '5px 12px',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              export .md
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
