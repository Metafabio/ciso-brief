'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types — Brief ────────────────────────────────────────────────────────────

type SectionId = 'ma-funding' | 'ai-releases' | 'threat-landscape' | 'market-moves' | 'backup-dr-ai'
type Theme = 'slate' | 'ember' | 'arctic'
type Tab = 'backup' | 'brief' | 'analysis' | 'sales' | 'compare' | 'usecases' | 'technical'

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

// ─── Types — Backup Intelligence ────────────────────────────────

interface BackupAI {
  score: number
  label: 'None' | 'Basic' | 'Advanced' | 'Native'
  features: string[]
  llm_model: string
}

interface BackupProduct {
  name: string
  category: string
  key_differentiator: string
  ai_feature: string
  target_buyer: string
}

interface BackupVendor {
  name: string
  segment: string
  momentum: 'rising' | 'stable' | 'declining'
  momentum_reason: string
  ai_integration: BackupAI
  products: BackupProduct[]
  competitive_threat: string
  sales_angle: string
}

interface BackupLeaderboard {
  rank: number
  vendor: string
  product: string
  ai_score: number
  why: string
  use_case: string
}

interface BackupData {
  week: number
  generated_at: string
  summary: string
  sections: BriefSection[]
  vendors: BackupVendor[]
  ai_leaderboard: BackupLeaderboard[]
  recommendations: {
    for_engineer: string
    for_sales: string
    watch_next_week: string
  }
  // Extended data for new tabs
  sales_data?: SalesData
  comparison_data?: ComparisonData
  usecases_data?: UseCasesData
  technical_data?: TechnicalData
}

interface SalesData {
  pitch_angles: {
    vendor: string
    target: 'enterprise' | 'smb' | 'government' | 'msp'
    pitch: string
    objection_handler: string
  }[]
  competitive_battles: {
    competitor: string
    vs_vendor: string
    win_strategy: string
  }[]
}

interface ComparisonData {
  vendors: {
    name: string
    enterprise: boolean
    smb: boolean
    government: boolean
    cloud_native: boolean
    ai_features: number
    price_tier: 'low' | 'mid' | 'high' | 'enterprise'
    ransomware_warranty: boolean
    fedramp: boolean
  }[]
}

interface UseCasesData {
  cases: {
    industry: string
    company_size: 'enterprise' | 'mid-market' | 'smb'
    vendor: string
    product: string
    use_case: string
    roi: string
  }[]
}

interface TechnicalData {
  api_integrations: {
    vendor: string
    api_type: string
    endpoints: number
    authentication: string
    webhook_support: boolean
    sdk_languages: string[]
  }[]
  orchestration: {
    vendor: string
    tools: string[]
    automation_level: 'basic' | 'advanced' | 'ai-powered'
  }[]
}

// ─── Section metadata ─────────────────────────────────────────────────────────

const SECTION_META: Record<SectionId, { title: string; icon: string; accent: string }> = {
  'ma-funding':       { title: 'M&A / Funding',        icon: '◈', accent: '#f59e0b' },
  'ai-releases':      { title: 'Release & Feature AI',  icon: '◎', accent: '#8b5cf6' },
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
const MOMENTUM_COLOR: Record<string, string> = { rising: '#10b981', stable: '#64748b', declining: '#ef4444' }
const SIGNAL_TYPE_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  consolidation: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
  disruption: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444' },
  regulation: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)', color: '#8b5cf6' },
  adoption: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
  investment: { bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)', color: '#06b6d4' },
}
const IMPACT_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  high: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444' },
  medium: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
  low: { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', color: '#64748b' },
}

// ─── Brief — Section body ─────────────────────────────────────────────────────

function SectionBody({ section, accent }: { section: BriefSection; accent: string }) {
  return (
    <div style={{ padding: '4px 0 20px' }}>
      {section.items.map((item, i) => (
        <div key={i} style={{
          padding: '16px 0',
          borderBottom: i < section.items.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.vendor}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              · {item.deal}{item.amount ? ` · ${item.amount}` : ''}
            </span>
          </div>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{item.summary}</p>
        </div>
      ))}
      <div style={{
        marginTop: '20px', padding: '16px 20px',
        background: hexToRgba(accent, 0.08),
        borderLeft: `3px solid ${accent}`,
        borderRadius: '0 8px 8px 0',
        fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)',
      }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>💡 Implicazione:</span>{' '}{section.implication}
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
    <div className="card" style={{ overflow: 'hidden', borderLeft: `3px solid ${meta.accent}` }}>
      <button onClick={onToggle} style={{
        width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px',
        background: 'var(--surface)', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ color: meta.accent, fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>{meta.icon}</span>
        <span style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '13px', fontWeight: 500,
          color: 'var(--text-primary)', letterSpacing: '0.02em', flex: 1,
        }}>{meta.title}</span>
        <span style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '11px', letterSpacing: '0.08em',
          textTransform: 'uppercase', color: meta.accent,
          background: hexToRgba(meta.accent, 0.12), border: `1px solid ${hexToRgba(meta.accent, 0.25)}`,
          padding: '4px 10px', borderRadius: '4px', flexShrink: 0,
        }}>
          {section.items.length}
        </span>
        <svg className={`chevron ${isOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M3 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className={`accordion-grid ${isOpen ? 'open' : ''}`}>
        <div className="accordion-inner">
          <div style={{ padding: '0 20px' }}>
            <SectionBody section={section} accent={meta.accent} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Analysis — Brand card ────────────────────────────────────────────────────

function BrandCard({ brand, index }: { brand: Brand; index: number }) {
  const [open, setOpen] = useState(false)
  const mColor = MOMENTUM_COLOR[brand.momentum]
  const scoreColor = brand.ai_integration.score >= 8 ? '#10b981' : brand.ai_integration.score >= 5 ? '#f59e0b' : '#64748b'

  return (
    <div className={`card stagger-${Math.min(index + 1, 5)}`} style={{ overflow: 'hidden' }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px',
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '20px', color: mColor, lineHeight: 1, flexShrink: 0 }}>
          {MOMENTUM_ICON[brand.momentum]}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{brand.name}</span>
            <span style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              padding: '3px 8px', borderRadius: '4px',
            }}>{brand.segment}</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>{brand.momentum_reason}</div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '20px', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{brand.ai_integration.score}</div>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>AI</div>
        </div>
        <svg className={`chevron ${open ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M3 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={`accordion-grid ${open ? 'open' : ''}`}>
        <div className="accordion-inner">
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div style={{ padding: '14px 16px', background: 'rgba(139,92,246,0.08)', borderLeft: '3px solid #8b5cf6', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8b5cf6', marginBottom: '8px' }}>
                AI Integration · {brand.ai_integration.label} · {brand.ai_integration.llm_model}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {brand.ai_integration.features.map((f, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--text-secondary)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    padding: '4px 10px', borderRadius: '4px',
                  }}>{f}</span>
                ))}
              </div>
            </div>

            {brand.products_in_focus.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.category} · {p.target_buyer}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 8px' }}>{p.key_differentiator}</p>
                {p.ai_feature !== 'n.d.' && (
                  <p style={{ fontSize: '13px', color: '#8b5cf6', lineHeight: 1.6, margin: 0 }}>⬡ {p.ai_feature}</p>
                )}
              </div>
            ))}

            <div>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ef4444', marginBottom: '6px' }}>Minaccia competitiva</div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{brand.competitive_threat}</p>
            </div>

            <div style={{ padding: '14px 16px', background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10b981', marginBottom: '6px' }}>Sales Angle</div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{brand.sales_angle}</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '12px' }}>
          Executive Summary
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{data.summary}</p>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px', paddingLeft: '4px' }}>
          AI / LLM Leaderboard
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.ai_llm_leaderboard.map((entry) => (
            <div key={entry.rank} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px 20px' }}>
              <div style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '24px', fontWeight: 700,
                color: entry.rank === 1 ? '#f59e0b' : entry.rank === 2 ? '#94a3b8' : 'var(--text-muted)',
                lineHeight: 1, flexShrink: 0, width: '32px', textAlign: 'center',
              }}>
                #{entry.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.brand}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{entry.product}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 10px' }}>{entry.why}</p>
                <span style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#8b5cf6',
                  background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
                  padding: '4px 10px', borderRadius: '4px',
                }}>{entry.integration_type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px', paddingLeft: '4px' }}>
          Brand Analysis
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.brands.map((brand, i) => <BrandCard key={brand.name} brand={brand} index={i} />)}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px', paddingLeft: '4px' }}>
          Market Signals
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.market_signals.map((s, i) => {
            const typeStyle = SIGNAL_TYPE_STYLE[s.type]
            const impactStyle = IMPACT_STYLE[s.impact]
            return (
              <div key={i} className="card" style={{
                padding: '16px 20px', borderLeft: `3px solid ${typeStyle.color}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{s.signal}</span>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: typeStyle.color, background: typeStyle.bg, border: `1px solid ${typeStyle.border}`,
                    padding: '4px 10px', borderRadius: '4px',
                  }}>{s.type}</span>
                  <span style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: impactStyle.color, background: impactStyle.bg, border: `1px solid ${impactStyle.border}`,
                    padding: '4px 10px', borderRadius: '4px',
                  }}>{s.impact}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 12px' }}>{s.description}</p>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#10b981' }}>↑ {s.who_wins}</span>
                  <span style={{ fontSize: '13px', color: '#ef4444' }}>↓ {s.who_loses}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Per il Manager', value: data.recommendation.for_manager, accent: '#8b5cf6' },
          { label: 'Per il Sales', value: data.recommendation.for_sales, accent: '#10b981' },
          { label: 'Da monitorare', value: data.recommendation.watch_next_week, accent: '#f59e0b' },
        ].map((r) => (
          <div key={r.label} className="card" style={{ padding: '16px 20px', borderTop: `3px solid ${r.accent}` }}>
            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: r.accent, marginBottom: '10px' }}>{r.label}</div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Comparison — View ─────────────────────────────────────────────────────

function ComparisonView({ current, previous }: { current: BackupData; previous: BackupData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      <div className="card" style={{ padding: '20px 24px', borderTop: '3px solid #10b981' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#10b981', marginBottom: '12px' }}>
          Week {previous.week} → Week {current.week} Comparison
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Track how vendors and market signals evolved between weeks.
        </p>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
          AI Leaderboard Changes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {current.ai_leaderboard.map((entry, i) => {
            const prevEntry = previous.ai_leaderboard.find(p => p.vendor === entry.vendor)
            const prevRank = prevEntry?.rank || 0
            const change = prevRank - entry.rank
            return (
              <div key={entry.vendor} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px' }}>
                <div style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '16px', fontWeight: 700,
                  color: change > 0 ? '#10b981' : change < 0 ? '#ef4444' : 'var(--text-muted)',
                  width: '24px', textAlign: 'center',
                }}>
                  {change > 0 ? `+${change}` : change < 0 ? `${change}` : '—'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', width: '32px' }}>#{entry.rank}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.vendor}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>{entry.product}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#10b981' }}>AI: {entry.ai_score}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Vendor Momentum Changes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {current.vendors.map((vendor) => {
            const prevVendor = previous.vendors.find(p => p.name === vendor.name)
            const prevMomentum = prevVendor?.momentum || 'stable'
            const changed = prevMomentum !== vendor.momentum
            return (
              <div key={vendor.name} className={`card ${changed ? 'card-elevated' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px' }}>
                <span style={{ fontSize: '16px', color: MOMENTUM_COLOR[vendor.momentum] }}>
                  {MOMENTUM_ICON[vendor.momentum]}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{vendor.name}</span>
                  {changed && (
                    <span style={{
                      fontSize: '10px', color: 'var(--text-muted)', marginLeft: '8px',
                      background: 'rgba(245,158,11,0.2)', padding: '2px 6px', borderRadius: '3px',
                    }}>
                      {prevMomentum} → {vendor.momentum}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {vendor.momentum_reason.substring(0, 60)}...
                </span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

// ─── Backup — View ────────────────────────────────────────────────────────

function BackupView({ data }: { data: BackupData }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '12px' }}>
          Executive Summary
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{data.summary}</p>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px', paddingLeft: '4px' }}>
          AI Leaderboard
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.ai_leaderboard.map((entry) => (
            <div key={entry.rank} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px 20px' }}>
              <div style={{
                fontFamily: 'var(--font-dm-mono)', fontSize: '24px', fontWeight: 700,
                color: entry.rank === 1 ? '#f59e0b' : entry.rank === 2 ? '#94a3b8' : 'var(--text-muted)',
                lineHeight: 1, flexShrink: 0, width: '32px', textAlign: 'center',
              }}>
                #{entry.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.vendor}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{entry.product}</span>
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>AI: {entry.ai_score}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 10px' }}>{entry.why}</p>
                <span style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#06b6d4',
                  background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                  padding: '4px 10px', borderRadius: '4px',
                }}>💡 {entry.use_case}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px', paddingLeft: '4px' }}>
          Vendor Analysis
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.vendors.map((vendor, i) => <BackupVendorCard key={vendor.name} vendor={vendor} index={i} />)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Per il Backup Engineer', value: data.recommendations.for_engineer, accent: '#06b6d4' },
          { label: 'Per il Sales', value: data.recommendations.for_sales, accent: '#10b981' },
          { label: 'Da monitorare', value: data.recommendations.watch_next_week, accent: '#f59e0b' },
        ].map((r) => (
          <div key={r.label} className="card" style={{ padding: '16px 20px', borderTop: `3px solid ${r.accent}` }}>
            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: r.accent, marginBottom: '10px' }}>{r.label}</div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BackupVendorCard({ vendor, index }: { vendor: BackupVendor; index: number }) {
  const [open, setOpen] = useState(false)
  const mColor = MOMENTUM_COLOR[vendor.momentum]
  const scoreColor = vendor.ai_integration.score >= 8 ? '#10b981' : vendor.ai_integration.score >= 5 ? '#f59e0b' : '#64748b'

  return (
    <div className={`card stagger-${Math.min(index + 1, 5)}`} style={{ overflow: 'hidden' }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px',
        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '20px', color: mColor, lineHeight: 1, flexShrink: 0 }}>
          {MOMENTUM_ICON[vendor.momentum]}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{vendor.name}</span>
            <span style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              padding: '3px 8px', borderRadius: '4px',
            }}>{vendor.segment}</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>{vendor.momentum_reason}</div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '20px', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{vendor.ai_integration.score}</div>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>AI</div>
        </div>
        <svg className={`chevron ${open ? 'open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <path d="M3 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={`accordion-grid ${open ? 'open' : ''}`}>
        <div className="accordion-inner">
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div style={{ padding: '14px 16px', background: 'rgba(6,182,212,0.08)', borderLeft: '3px solid #06b6d4', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#06b6d4', marginBottom: '8px' }}>
                AI Integration · {vendor.ai_integration.label} · {vendor.ai_integration.llm_model}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {vendor.ai_integration.features.map((f, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: 'var(--text-secondary)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    padding: '4px 10px', borderRadius: '4px',
                  }}>{f}</span>
                ))}
              </div>
            </div>

            {vendor.products.map((p, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.category} · {p.target_buyer}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 8px' }}>{p.key_differentiator}</p>
                {p.ai_feature !== 'n.d.' && (
                  <p style={{ fontSize: '13px', color: '#06b6d4', lineHeight: 1.6, margin: 0 }}>⬡ {p.ai_feature}</p>
                )}
              </div>
            ))}

            <div>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ef4444', marginBottom: '6px' }}>Minaccia competitiva</div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{vendor.competitive_threat}</p>
            </div>

            <div style={{ padding: '14px 16px', background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10b981', marginBottom: '6px' }}>Sales Angle</div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{vendor.sales_angle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sales — View ─────────────────────────────────────────────────────

function SalesView({ data }: { data: BackupData | null | undefined }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div className="card" style={{ padding: '20px 24px', borderLeft: '3px solid #10b981' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#10b981', marginBottom: '12px' }}>
          Sales Pitch & Competitive Playbook
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Pitch angle per segmento cliente e come vincere contro i competitor.
        </p>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Pitch per Segmento
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { vendor: 'Veeam', target: 'enterprise', title: 'Enterprise', pitch: 'ROI misurabile: -30% tempo admin. Intelligent Hub automatizza orchestrazione backup.', objection: 'Prezzo alto → Rispondi con TCO analysis: quanto costa un downtime?' },
            { vendor: 'Rubrik', target: 'government', title: 'Government', pitch: 'Unico AI analyst certificato FedRAMP.Compliance automatica per sector regolamentati.', objection: 'Non hanno budget → Rispondi con costo breach: $4.5M medio peratta ransomware' },
            { vendor: 'Cohesity', target: 'smb', title: 'SMB', pitch: 'DataHound AI risolve problemi GDPR in  click. Semplice da gestire.', objection: 'Troppo complesso → Rispondi con setup in 15 minuti, no admin dedicato' },
            { vendor: 'Veeam', target: 'msp', title: 'MSP', pitch: 'Multi-tenant nativo, billing integrato. Margine elevato su backup-as-a-service.', objection: 'Competitor più basso → Rispondi con ransomware warranty inclusa' },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.vendor}</span>
                <span style={{ fontSize: '10px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '3px', color: 'var(--text-muted)' }}>{item.title}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 8px' }}>{item.pitch}</p>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>💬 {item.objection}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Competitive Battles
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { competitor: 'Veeam', vs: 'Cohesity', win: 'Intellgent Hub > DataHound per orchestrazione. Più integrazioni cloud.' },
            { competitor: 'Rubrik', vs: 'Dell', win: 'Ruby AI > PowerProtect per AI. FedRAMP sblocca mercato government.' },
            { competitor: 'Cohesity', vs: 'Veeam', win: 'DataHound vince su GDPR compliance. Prezzo migliore per SMB.' },
          ].map((item, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', width: '80px' }}>vs {item.vs}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>{item.win}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Comparison — Table View ───────────────────────────────────────────

function CompareView() {
  const vendors = [
    { name: 'Veeam', enterprise: true, smb: true, government: true, cloud: true, ai: 8, price: 'Mid-High', rw: true, fedramp: false },
    { name: 'Rubrik', enterprise: true, smb: false, government: true, cloud: true, ai: 9, price: 'High', rw: true, fedramp: true },
    { name: 'Cohesity', enterprise: true, smb: true, government: false, cloud: true, ai: 8, price: 'Mid', rw: true, fedramp: false },
    { name: 'Dell', enterprise: true, smb: true, government: true, cloud: false, ai: 6, price: 'Mid', rw: false, fedramp: false },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '20px 24px', borderLeft: '3px solid #8b5cf6' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8b5cf6', marginBottom: '12px' }}>
          Vendor Comparison Matrix
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Comparazione feature, pricing e target per segmento.
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>Vendor</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Enterprise</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>SMB</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Government</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Cloud Native</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>AI Score</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Price Tier</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>Ransomware Warranty</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>FedRAMP</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.name} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: v.enterprise ? '#10b981' : '#ef4444' }}>{v.enterprise ? '✓' : '—'}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: v.smb ? '#10b981' : '#ef4444' }}>{v.smb ? '✓' : '—'}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: v.government ? '#10b981' : '#ef4444' }}>{v.government ? '✓' : '—'}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: v.cloud ? '#10b981' : '#ef4444' }}>{v.cloud ? '✓' : '—'}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: v.ai >= 8 ? '#10b981' : '#f59e0b' }}>{v.ai}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>{v.price}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: v.rw ? '#10b981' : '#ef4444' }}>{v.rw ? '✓' : '—'}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: v.fedramp ? '#10b981' : '#ef4444' }}>{v.fedramp ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', marginBottom: '8px' }}>✓ = Supported</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>— = Not available</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b', marginBottom: '8px' }}>AI Score: 8-9 = Leader</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI Score: 5-7 = Average</div>
        </div>
      </div>
    </div>
  )
}

// ─── Use Cases — View ─────────────────────────────────────────────

function UseCasesView() {
  const cases = [
    { industry: 'Finance', size: 'Enterprise', vendor: 'Rubrik', product: 'Security Cloud', use: 'Compliance GDPR + FedRAMP per banking regolamentato', roi: '40% riduzione tempo compliance' },
    { industry: 'Healthcare', size: 'enterprise', vendor: 'Veeam', product: 'Data Platform', use: 'Backup EHR e PHI compliance HIPAA', roi: '99.9% recovery SLA garantito' },
    { industry: 'Manufacturing', size: 'mid-market', vendor: 'Cohesity', product: 'DataPlatform', use: 'Unified backup + file storage per engineering', roi: '-35% storage cost' },
    { industry: 'Retail', size: 'smb', vendor: 'Veeam', product: 'Backup & Replication', use: 'Cloud backup per POS e e-commerce', roi: 'Setup in 30 minuti' },
    { industry: 'Government', size: 'enterprise', vendor: 'Rubrik', product: 'Security Cloud', use: 'FedRAMP compliant backup per agency', roi: 'Sblocco contratti federali' },
    { industry: 'MSP', size: 'smb', vendor: 'Veeam', product: 'Service Provider', use: 'Multi-tenant per clienti SMB', roi: 'Billing automatico, margine 40%+' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '20px 24px', borderLeft: '3px solid #f59e0b' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f59e0b', marginBottom: '12px' }}>
          Use Cases per Industry & Company Size
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Case d'uso concreti con vendor, prodotto e ROI misurabile.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {cases.map((c, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.industry}</span>
              <span style={{ fontSize: '10px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '3px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{c.size}</span>
              <span style={{ fontSize: '10px', color: '#06b6d4', marginLeft: 'auto' }}>{c.vendor}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 6px' }}>{c.use}</p>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 500 }}>📈 {c.roi}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Technical — View ─────────────────────────────────────────────

function TechnicalView() {
  const apis = [
    { vendor: 'Veeam', api: 'REST API v3', endpoints: '50+', auth: 'API Key / OAuth', webhook: true, sdks: ['PowerShell', 'Python', 'Go'] },
    { vendor: 'Rubrik', api: 'API v2', endpoints: '40+', auth: 'API Key', webhook: true, sdks: ['Python', 'Go'] },
    { vendor: 'Cohesity', api: 'REST API', endpoints: '35+', auth: 'API Key / LDAP', webhook: false, sdks: ['Python'] },
    { vendor: 'Dell', api: 'DD API', endpoints: '25+', auth: 'Basic Auth', webhook: false, sdks: [] },
  ]

  const orchestration = [
    { vendor: 'Veeam', tools: ['vBO365', 'Ansible', 'Terraform', 'PowerShell'], level: 'AI-powered' },
    { vendor: 'Rubrik', tools: ['Ansible', 'Terraform', 'Python SDK'], level: 'advanced' },
    { vendor: 'Cohesity', tools: ['Ansible', 'Python SDK'], level: 'advanced' },
    { vendor: 'Dell', tools: ['PowerShell', 'CLI'], level: 'basic' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '20px 24px', borderLeft: '3px solid #06b6d4' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#06b6d4', marginBottom: '12px' }}>
          Technical Deep Dive
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          API, SDK e integrazioni per automazione.
        </p>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
          API & SDK Support
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {apis.map((item, i) => (
            <div key={i} className="card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', width: '90px' }}>{item.vendor}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.api}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.endpoints} endpoints</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', padding: '2px 8px', borderRadius: '3px', color: '#06b6d4' }}>{item.auth}</span>
                {item.webhook && <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '2px 8px', borderRadius: '3px', color: '#10b981' }}>Webhook</span>}
                {item.sdks.map(sdk => (
                  <span key={sdk} style={{ fontSize: '10px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '3px', color: 'var(--text-muted)' }}>{sdk}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Orchestration & Automation
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {orchestration.map((item, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', width: '90px' }}>{item.vendor}</span>
              <div style={{ flex: 1, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {item.tools.map(tool => (
                  <span key={tool} style={{ fontSize: '11px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: '4px', color: 'var(--text-secondary)' }}>{tool}</span>
                ))}
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: item.level === 'AI-powered' ? '#10b981' : item.level === 'advanced' ? '#f59e0b' : 'var(--text-muted)', textTransform: 'uppercase' }}>{item.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Theme switcher ───────────────────────────────────────────────────────────

const THEMES: { id: Theme; label: string; accent: string }[] = [
  { id: 'slate', label: 'Slate', accent: '#6366f1' },
  { id: 'ember', label: 'Ember', accent: '#f59e0b' },
  { id: 'arctic', label: 'Arctic', accent: '#06b6d4' },
]

function ThemeSwitcher({ current, onChange }: { current: Theme; onChange: (t: Theme) => void }) {
  return (
    <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', padding: '3px', borderRadius: '8px' }}>
      {THEMES.map((t) => {
        const active = t.id === current
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '10px', letterSpacing: '0.08em',
            padding: '6px 12px', border: 'none', borderRadius: '6px',
            background: active ? t.accent : 'transparent',
            color: active ? 'white' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
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
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'slate'
    return (localStorage.getItem('ciso_theme') as Theme | null) || 'slate'
  })
  const [tab, setTab] = useState<Tab>('backup')
  const [brief, setBrief] = useState<BriefData | null>(null)
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [backup, setBackup] = useState<BackupData | null>(null)
  const [backupPrev, setBackupPrev] = useState<BackupData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set())

  useEffect(() => {
    Promise.all([
      fetch('/brief.json').then(r => r.json()) as Promise<BriefData>,
      fetch('/market_analysis.json').then(r => r.json()) as Promise<MarketAnalysis>,
      fetch('/backupl.json').then(r => r.json()) as Promise<BackupData>,
      fetch('/archive/market-analysis-w16-2026-04-20.json').then(r => r.json()).catch(() => null),
    ]).then(([b, a, bu, prev]) => {
      setBrief(b)
      setAnalysis(a)
      setBackup(bu)
      setBackupPrev(prev as BackupData | null)
      setOpenSections(new Set(b.sections.map(s => s.id)))
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [])

  const handleTheme = useCallback((t: Theme) => {
    setTheme(t)
    localStorage.setItem('ciso_theme', t)
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }, [])

  const handleExportPDF = useCallback(() => {
    window.print()
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
    const md = lines.join('\n')
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ciso-brief-w${brief.week}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [brief])

  const currentWeek = backup?.week || analysis?.week || brief?.week || 0
  const currentDate = backup?.generated_at || analysis?.generated_at || brief?.date || ''

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      <header className="header-blur" style={{
        borderBottom: '1px solid var(--border)', padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
        position: 'sticky', top: 0, background: 'rgba(10, 14, 23, 0.85)', zIndex: 20,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-dm-mono)', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
              Week {currentWeek}
            </span>
            <span style={{ fontSize: '20px', color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '-0.02em' }}>
              Backup & Resilience
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {currentDate ? `Generated: ${currentDate}` : 'Loading...'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleRefresh} disabled={isRefreshing} className="btn" title="Refresh data">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.7, animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}>
              <path d="M12 7a5 5 0 11-8.5-3.5M12 3v4H8M12 3L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={handleExportPDF} className="btn" title="Export PDF">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.7 }}>
              <path d="M7 1v8M3 5l4 4 4-4M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            PDF
          </button>
          {backupPrev && (
            <button onClick={() => setShowCompare(v => !v)} className={`btn ${showCompare ? 'btn-primary' : ''}`} title="Compare with previous week">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.7 }}>
                <path d="M2 4h4l-4 4V4zM12 10H8l4-4v4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Compare
            </button>
          )}
          <ThemeSwitcher current={theme} onChange={handleTheme} />
        </div>
      </header>

      <div style={{ borderBottom: '1px solid var(--border)', padding: '0 32px', display: 'flex', gap: '4px', background: 'var(--bg)' }}>
        {([
          { id: 'backup' as Tab, label: 'AI' },
          { id: 'brief' as Tab, label: 'Executive' },
          { id: 'analysis' as Tab, label: 'Vendors' },
          { id: 'sales' as Tab, label: 'Sales' },
          { id: 'compare' as Tab, label: 'Compare' },
          { id: 'usecases' as Tab, label: 'Use Cases' },
          { id: 'technical' as Tab, label: 'Technical' },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`tab ${tab === t.id ? 'active' : ''}`} style={{ padding: '14px 24px' }}>
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ flex: 1, padding: '32px 32px 64px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>

        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(SECTION_META).map(([id, meta]) => (
              <div key={id} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ color: meta.accent, fontSize: '18px' }}>{meta.icon}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', color: 'var(--text-secondary)', flex: 1 }}>{meta.title}</span>
                <span className="pulse-dot" style={{ background: meta.accent }} />
              </div>
            ))}
          </div>
        )}

        {!isLoading && tab === 'brief' && brief && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {brief.sections.map(section => (
                <AccordionSection key={section.id} section={section} isOpen={openSections.has(section.id)} onToggle={() => toggleSection(section.id)} />
              ))}
            </div>
            <div className="fade-in" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button onClick={handleExport} className="btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.7 }}>
                  <path d="M7 1v8M3 5l4 4 4-4M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Export .md
              </button>
            </div>
          </>
        )}

        {!isLoading && tab === 'analysis' && analysis && (
          <AnalysisView data={analysis} />
        )}

        {!isLoading && tab === 'analysis' && !analysis && (
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', color: 'var(--text-secondary)', padding: '60px 0', textAlign: 'center' }}>
            market_analysis.json non trovato
          </div>
        )}

        {!isLoading && tab === 'backup' && backup && (
          showCompare && backupPrev ? (
            <ComparisonView current={backup} previous={backupPrev} />
          ) : (
            <BackupView data={backup} />
          )
        )}

        {!isLoading && tab === 'backup' && !backup && (
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', color: 'var(--text-secondary)', padding: '60px 0', textAlign: 'center' }}>
            backupl.json non trovato
          </div>
        )}

        {tab === 'sales' && <SalesView data={backup} />}
        {tab === 'compare' && <CompareView />}
        {tab === 'usecases' && <UseCasesView />}
        {tab === 'technical' && <TechnicalView />}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 32px', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Backup & Resilience Intelligence · Week {currentWeek} · Updated {currentDate}
        </span>
      </footer>
    </div>
  )
}