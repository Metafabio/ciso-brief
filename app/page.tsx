'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types — Brief ────────────────────────────────────────────────────────────

type SectionId = 'ma-funding' | 'product-releases' | 'threat-ransomware' | 'ai-orchestration' | 'market-trends'
type Theme = 'slate' | 'ember' | 'arctic'
type Tab = 'backup' | 'brief' | 'analysis' | 'business' | 'actions' | 'risk'

type Confidence = 'high' | 'medium' | 'low'

interface Source {
  title: string
  url: string
  publisher: string
  published_at: string
}

interface BriefItem {
  vendor: string
  deal: string
  amount?: string
  summary: string
  confidence: Confidence
  sources: Source[]
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
  confidence: Confidence
  sources: Source[]
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
  brands?: Brand[]
  market_signals?: MarketSignal[]
  ai_llm_leaderboard?: LeaderboardEntry[]
  recommendation: {
    for_manager: string
    for_sales: string
    watch_next_week: string
  }
}

interface VendorAPI {
  version: string
  endpoints: string
  auth: string
  webhook: boolean
  sdks: string[]
}

interface VendorDeployment {
  options: string[]
  requirements: string
  setup_time: string
}

interface VendorPricing {
  model: string
  indicative_range: string
}

interface VendorTech {
  name: string
  api: VendorAPI
  deployment: VendorDeployment
  pricing: VendorPricing
}

interface BestPractice {
  scenario: string
  steps: string[]
  tips: string[]
}

interface VendorTechnicalData {
  vendors: VendorTech[]
  best_practices: BestPractice[]
}

// ─── Backup Intelligence ────────────────────────────────

interface BackupAI {
  score: number
  label: 'None' | 'Basic' | 'Advanced' | 'Native'
  features: string[]
  llm_model?: string
}

interface BackupProduct {
  name: string
  category?: string
  key_differentiator: string
  ai_feature?: string
  target_buyer?: string
}

interface BackupVendor {
  name: string
  segment: string
  momentum: 'rising' | 'stable' | 'declining'
  momentum_reason: string
  ai_integration: BackupAI
  products: BackupProduct[]
  competitive_threat?: string
  sales_angle?: string
}

interface BackupLeaderboard {
  rank: number
  vendor: string
  product: string
  ai_score: number
  why: string
  use_case?: string
  key_feature?: string
}

interface BackupSummary {
  headline: string
  key_points: string[]
  trend: 'rising' | 'stable' | 'declining'
}

interface BackupNewsItem {
  section: string
  title: string
  vendor: string
  amount: string
  description: string
  implication: string
}

interface BackupData {
  week: number
  generated_at: string
  summary: BackupSummary | string
  news?: BackupNewsItem[]
  sections?: BriefSection[]
  vendors?: BackupVendor[]
  ai_leaderboard?: BackupLeaderboard[]
  recommendations?: {
    for_engineer?: string
    for_sales?: string
    watch_next_week?: string
  }
  sales_data?: SalesData
  comparison_data?: ComparisonData
  usecases_data?: UseCasesData
  technical_data?: VendorTechnicalData
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

// ─── Types — Risk Score ───────────────────────────────────────────────────────

interface RiskSector {
  id: string
  name: string
  risk_score: number
  risk_level: 'critical' | 'high' | 'medium' | 'low'
  trend: 'rising' | 'stable' | 'declining'
  signals: string[]
  top_threats: string[]
  prediction: string
  recommended_action: string
  mauden_service: string
  service_price: string
  action_urgency: 'high' | 'medium' | 'low'
}

interface VendorRisk {
  vendor: string
  risk: 'high' | 'medium' | 'low'
  risk_type: string
  reason: string
  signal: string
  impact_for_clients: string
  action: string
}

interface RiskScoreData {
  week: number
  generated_at: string
  algorithm: string
  weekly_prediction: {
    highest_risk_sector: string
    most_likely_attack: string
    vendor_to_watch: string
    confidence: string
    summary: string
  }
  sectors: RiskSector[]
  vendor_risk: VendorRisk[]
}

// ─── Types — Action Register ──────────────────────────────────────────────────

interface ActionItem {
  id: string
  source_signal: string
  risk: string
  action: string
  owner: string
  priority: 'high' | 'medium' | 'low'
  mauden_service: string
  service_price: string
  status: 'open' | 'in-progress' | 'closed'
  deadline: string
}

interface ActionRegisterData {
  week: number
  generated_at: string
  actions: ActionItem[]
}

// ─── Types — Business Packages ──────────────────────────────────────────────

interface BusinessPackage {
  name: string
  buyer: string
  price: string
  pitch: string
  deliverables: string[]
}

interface BusinessMetric {
  label: string
  value: string
  note: string
  accent: string
}

interface BusinessData {
  metrics: BusinessMetric[]
  packages: BusinessPackage[]
  differentiators: string[]
}

// ─── Section metadata ─────────────────────────────────────────────────────────

const SECTION_META: Record<SectionId, { title: string; icon: string; accent: string }> = {
  'ma-funding':       { title: 'M&A / Funding',        icon: '◈', accent: '#f59e0b' },
  'product-releases': { title: 'Release & Feature AI',  icon: '◎', accent: '#8b5cf6' },
  'threat-ransomware': { title: 'Threat & Ransomware',  icon: '◉', accent: '#ef4444' },
  'ai-orchestration': { title: 'AI Orchestration',      icon: '◇', accent: '#10b981' },
  'market-trends':    { title: 'Trend di Mercato',      icon: '◫', accent: '#06b6d4' },
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
const CONFIDENCE_STYLE: Record<Confidence, { bg: string; border: string; color: string; label: string }> = {
  high: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#10b981', label: 'Alta' },
  medium: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', label: 'Media' },
  low: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', label: 'Da verificare' },
}

function SourceTrail({ sources = [], confidence }: { sources?: Source[]; confidence?: Confidence }) {
  if (!sources.length && !confidence) return null
  const confidenceStyle = confidence ? CONFIDENCE_STYLE[confidence] : null
  const hasUrl = sources.some(s => s.url)
  const showWarning = confidence === 'high' && !hasUrl

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
      {confidenceStyle && (
        <span style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
          color: confidenceStyle.color, background: confidenceStyle.bg, border: `1px solid ${confidenceStyle.border}`,
          padding: '3px 8px', borderRadius: '4px',
        }}>
          Confidence: {confidenceStyle.label}
        </span>
      )}
      {showWarning && (
        <span style={{
          fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
          color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
          padding: '3px 8px', borderRadius: '4px',
        }}>
          ⚠️ URL Mancante
        </span>
      )}
      {sources.map((source, index) => {
        const label = `${source.publisher} · ${source.published_at}`
        if (!source.url) {
          return (
            <span key={`${source.title}-${index}`} title={source.title} style={{
              fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              padding: '3px 8px', borderRadius: '4px',
            }}>
              Fonte: {label}
            </span>
          )
        }

        return (
          <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" title={source.title} style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--accent)',
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
            padding: '3px 8px', borderRadius: '4px', textDecoration: 'none',
          }}>
            Fonte: {label}
          </a>
        )
      })}
    </div>
  )
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
          <SourceTrail sources={item.sources} confidence={item.confidence} />
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
          {(data.brands ?? []).map((brand, i) => <BrandCard key={brand.name} brand={brand} index={i} />)}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px', paddingLeft: '4px' }}>
          Market Signals
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(data.market_signals ?? []).map((s, i) => {
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
                <SourceTrail sources={s.sources} confidence={s.confidence} />
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
          {current.ai_leaderboard.map((entry) => {
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

const NEWS_SECTION_STYLE: Record<string, { color: string; label: string }> = {
  market:  { color: '#f59e0b', label: 'Market' },
  release: { color: '#8b5cf6', label: 'Release' },
  threat:  { color: '#ef4444', label: 'Threat' },
}

function BackupView({ data }: { data: BackupData }) {
  const summary = data.summary
  const isObjectSummary = summary !== null && typeof summary === 'object' && 'headline' in summary
  const summaryObj = isObjectSummary ? (summary as BackupSummary) : null
  const summaryText = isObjectSummary ? (summary as BackupSummary).headline : (summary as string)

  const recs = [
    ...(data.recommendations?.for_engineer ? [{ label: 'Per il Backup Engineer', value: data.recommendations.for_engineer, accent: '#06b6d4' }] : []),
    ...(data.recommendations?.for_sales ? [{ label: 'Per il Sales', value: data.recommendations.for_sales, accent: '#10b981' }] : []),
    ...(data.recommendations?.watch_next_week ? [{ label: 'Da monitorare', value: data.recommendations.watch_next_week, accent: '#f59e0b' }] : []),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '12px' }}>
          Executive Summary
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: summaryObj ? '16px' : 0 }}>
          {summaryText}
        </p>
        {summaryObj && (
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {summaryObj.key_points.map((pt, i) => (
              <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{pt}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px', paddingLeft: '4px' }}>
          AI Leaderboard
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(data.ai_leaderboard ?? []).map((entry) => (
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
                {(entry.key_feature || entry.use_case) && (
                  <span style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#06b6d4',
                    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                    padding: '4px 10px', borderRadius: '4px',
                  }}>💡 {entry.key_feature || entry.use_case}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.news && data.news.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px', paddingLeft: '4px' }}>
            News & Segnali
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.news.map((item, i) => {
              const style = NEWS_SECTION_STYLE[item.section] || { color: '#64748b', label: item.section }
              return (
                <div key={i} className="card" style={{ padding: '16px 20px', borderLeft: `3px solid ${style.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{item.title}</span>
                    <span style={{
                      fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: style.color, background: `${style.color}18`, border: `1px solid ${style.color}44`,
                      padding: '3px 8px', borderRadius: '4px',
                    }}>{style.label}</span>
                    <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>{item.vendor}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 10px' }}>{item.description}</p>
                  <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderLeft: '2px solid #6366f1', borderRadius: '0 6px 6px 0' }}>
                    <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>→ </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.implication}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px', paddingLeft: '4px' }}>
          Vendor Analysis
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(data.vendors ?? []).map((vendor, i) => <BackupVendorCard key={vendor.name} vendor={vendor} index={i} />)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {recs.map((r) => (
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
                AI Integration · {vendor.ai_integration.label}{vendor.ai_integration.llm_model ? ` · ${vendor.ai_integration.llm_model}` : ''}
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
                  {(p.category || p.target_buyer) && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {[p.category, p.target_buyer].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 8px' }}>{p.key_differentiator}</p>
                {p.ai_feature && p.ai_feature !== 'n.d.' && (
                  <p style={{ fontSize: '13px', color: '#06b6d4', lineHeight: 1.6, margin: 0 }}>⬡ {p.ai_feature}</p>
                )}
              </div>
            ))}

            {vendor.competitive_threat && (
              <div>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ef4444', marginBottom: '6px' }}>Minaccia competitiva</div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{vendor.competitive_threat}</p>
              </div>
            )}

            {vendor.sales_angle && (
              <div style={{ padding: '14px 16px', background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981', borderRadius: '0 8px 8px 0' }}>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10b981', marginBottom: '6px' }}>Sales Angle</div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{vendor.sales_angle}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Risk Score — Zola View ───────────────────────────────────────

const RISK_LEVEL_STYLE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: 'Critico' },
  high:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'Alto' },
  medium:   { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',  border: 'rgba(6,182,212,0.3)',  label: 'Medio' },
  low:      { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: 'Basso' },
}

function RiskScoreView({ data }: { data: RiskScoreData | null }) {
  if (!data) return (
    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', color: 'var(--text-secondary)', padding: '60px 0', textAlign: 'center' }}>
      risk_score.json non trovato
    </div>
  )

  const pred = data.weekly_prediction

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div className="card" style={{ padding: '20px 24px', borderLeft: '3px solid #ef4444' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ef4444' }}>
            {data.algorithm} · Settimana {data.week}
          </div>
          <span style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '10px',
            color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            padding: '3px 8px', borderRadius: '4px',
          }}>Confidence: Alta</span>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          {pred.summary}
        </p>
      </div>

      {/* Weekly prediction strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {[
          { label: 'Settore più a rischio', value: pred.highest_risk_sector, accent: '#ef4444' },
          { label: 'Attacco più probabile', value: pred.most_likely_attack, accent: '#f59e0b' },
          { label: 'Vendor da monitorare', value: pred.vendor_to_watch, accent: '#8b5cf6' },
        ].map(item => (
          <div key={item.label} className="card" style={{ padding: '14px 18px', borderTop: `3px solid ${item.accent}` }}>
            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: item.accent, marginBottom: '8px' }}>{item.label}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Sector risk scores */}
      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Risk Score per Settore
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.sectors.map(sector => {
            const style = RISK_LEVEL_STYLE[sector.risk_level]
            const trendColor = sector.trend === 'rising' ? '#ef4444' : sector.trend === 'stable' ? '#64748b' : '#10b981'
            const trendIcon = sector.trend === 'rising' ? '↑' : sector.trend === 'stable' ? '→' : '↓'
            return (
              <div key={sector.id} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', minWidth: '140px' }}>{sector.name}</span>
                  <span style={{ color: trendColor, fontSize: '14px', fontWeight: 700 }}>{trendIcon}</span>
                  <div style={{ flex: 1, height: '6px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sector.risk_score}%`, background: style.color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '13px', fontWeight: 700, color: style.color, minWidth: '32px', textAlign: 'right' }}>{sector.risk_score}</span>
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: style.color, background: style.bg, border: `1px solid ${style.border}`, padding: '2px 8px', borderRadius: '4px' }}>{style.label}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px' }}>{sector.prediction}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {sector.top_threats.map(t => (
                    <span key={t} style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 8px', borderRadius: '4px' }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Azione raccomandata:</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{sector.recommended_action}</span>
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '2px 8px', borderRadius: '4px', marginLeft: 'auto' }}>{sector.service_price}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Vendor risk */}
      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Rischio Vendor — Business Continuity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.vendor_risk.map(vr => {
            const style = RISK_LEVEL_STYLE[vr.risk]
            return (
              <div key={vr.vendor} className="card" style={{ padding: '16px 20px', borderLeft: `3px solid ${style.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{vr.vendor}</span>
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: style.color, background: style.bg, border: `1px solid ${style.border}`, padding: '2px 8px', borderRadius: '4px' }}>{style.label}</span>
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px' }}>{vr.risk_type}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 6px' }}>{vr.reason}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 10px', fontStyle: 'italic' }}>Segnale: {vr.signal}</p>
                <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 500 }}>Impatto clienti: {vr.impact_for_clients}</div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

// ─── Business — View ─────────────────────────────────────────────

function BusinessView({ data, sales, matrix }: { data: BusinessData | null; sales: SalesData | null; matrix: ComparisonData | null }) {
  if (!data) return (
    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', color: 'var(--text-secondary)', padding: '60px 0', textAlign: 'center' }}>
      business_packages.json non trovato
    </div>
  )

  const { metrics, packages, differentiators } = data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div className="card" style={{ padding: '24px', borderLeft: '3px solid #10b981' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#10b981', marginBottom: '12px' }}>
          Mauden GTM
        </div>
        <h1 style={{ fontSize: '28px', lineHeight: 1.2, marginBottom: '12px' }}>
          Cyber resilience intelligence per vendere assessment, architetture e servizi backup.
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '720px' }}>
          Dashboard locale per trasformare segnali di mercato, ransomware e vendor moves in offerte concrete per clienti enterprise e mid-market.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {metrics.map(metric => (
          <div key={metric.label} className="card" style={{ padding: '18px 20px', borderTop: `3px solid ${metric.accent}` }}>
            <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '28px', fontWeight: 700, color: metric.accent, lineHeight: 1 }}>{metric.value}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '10px' }}>{metric.label}</div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '6px' }}>{metric.note}</p>
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Offerte vendibili
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {packages.map(pkg => (
            <div key={pkg.name} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{pkg.name}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: '#10b981' }}>{pkg.price}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px' }}>{pkg.buyer}</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '12px' }}>{pkg.pitch}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {pkg.deliverables.map(item => (
                  <span key={item} style={{
                    fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-secondary)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    padding: '3px 8px', borderRadius: '4px',
                  }}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '20px 24px', borderLeft: '3px solid #06b6d4' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#06b6d4', marginBottom: '12px' }}>
          Differenziazione
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {differentiators.map(item => (
            <div key={item} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '20px 24px', borderLeft: '3px solid #f59e0b' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f59e0b', marginBottom: '12px' }}>
          Prossima milestone locale
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
          Aggiungere action register: ogni fonte genera azione, owner, priorita, servizio Mauden collegato, stato, export PDF.
        </p>
      </div>

      {sales && (
        <div>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Sales Playbook
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '12px' }}>
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '12px' }}>Pitch Angles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sales.pitch_angles.map((p, i) => (
                  <div key={i} style={{ paddingBottom: '12px', borderBottom: i < sales.pitch_angles.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.vendor}</span>
                      <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px' }}>{p.target}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 8px' }}>{p.pitch}</p>
                    <div style={{ fontSize: '12px', color: '#8b5cf6', fontStyle: 'italic' }}>Objection: {p.objection_handler}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ef4444', marginBottom: '12px' }}>Competitive Battles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sales.competitive_battles.map((b, i) => (
                  <div key={i} style={{ paddingBottom: '12px', borderBottom: i < sales.competitive_battles.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{b.competitor} vs {b.vs_vendor}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>Win Strategy:</span> {b.win_strategy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {matrix && (
        <div>
          <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Vendor Matrix
          </div>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vendor</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Score</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price</th>
                  <th style={{ padding: '12px 16px', fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Security</th>
                </tr>
              </thead>
              <tbody>
                {matrix.vendors.map((v, i) => (
                  <tr key={v.name} style={{ borderBottom: i < matrix.vendors.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>{v.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {v.enterprise && <span style={{ fontSize: '9px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '2px 4px', borderRadius: '3px' }}>ENT</span>}
                        {v.smb && <span style={{ fontSize: '9px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 4px', borderRadius: '3px' }}>SMB</span>}
                        {v.government && <span style={{ fontSize: '9px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', padding: '2px 4px', borderRadius: '3px' }}>GOV</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ flex: 1, minWidth: '40px', height: '4px', background: 'var(--surface)', borderRadius: '2px' }}>
                          <div style={{ width: `${v.ai_features * 10}%`, height: '100%', background: '#8b5cf6', borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px' }}>{v.ai_features}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#10b981' }}>{v.price_tier.toUpperCase()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {v.ransomware_warranty && <span title="Ransomware Warranty" style={{ cursor: 'help' }}>🛡️</span>}
                        {v.fedramp && <span title="FedRAMP Certified" style={{ cursor: 'help' }}>🏛️</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Action Register — View ───────────────────────────────────────────────────

const PRIORITY_STYLE: Record<string, { bg: string; border: string; color: string; label: string }> = {
  high:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   color: '#ef4444', label: 'Alta' },
  medium: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  color: '#f59e0b', label: 'Media' },
  low:    { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', color: '#64748b', label: 'Bassa' },
}

const STATUS_STYLE: Record<string, { bg: string; border: string; color: string; label: string }> = {
  'open':        { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)',  color: '#6366f1', label: 'Aperta' },
  'in-progress': { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  color: '#10b981', label: 'In corso' },
  'closed':      { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', color: '#64748b', label: 'Chiusa' },
}

function ActionRegisterView({ data }: { data: ActionRegisterData | null }) {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'closed'>('all')

  if (!data) return (
    <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '14px', color: 'var(--text-secondary)', padding: '60px 0', textAlign: 'center' }}>
      action_register.json non trovato
    </div>
  )

  const filtered = data.actions.filter(a =>
    (priorityFilter === 'all' || a.priority === priorityFilter) &&
    (statusFilter === 'all' || a.status === statusFilter)
  )

  const highCount = data.actions.filter(a => a.priority === 'high' && a.status === 'open').length
  const openCount = data.actions.filter(a => a.status === 'open').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div className="card" style={{ padding: '20px 24px', borderLeft: '3px solid #ef4444' }}>
        <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ef4444', marginBottom: '12px' }}>
          Action Register · Week {data.week}
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '14px' }}>
          Ogni segnale di mercato genera un&apos;azione concreta. Prioritizza, assegna un owner e collegala a un servizio Mauden.
        </p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#ef4444' }}>
            ◉ {highCount} ad alta priorità
          </span>
          <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: '#6366f1' }}>
            ◈ {openCount} aperte
          </span>
          <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
            {data.actions.length} totali
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: '4px' }}>
          Priorità:
        </span>
        {(['all', 'high', 'medium', 'low'] as const).map(p => (
          <button key={p} onClick={() => setPriorityFilter(p)} style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '5px 12px', borderRadius: '4px', border: '1px solid', cursor: 'pointer',
            background: priorityFilter === p
              ? (p === 'all' ? 'var(--accent)' : PRIORITY_STYLE[p].bg)
              : 'transparent',
            borderColor: priorityFilter === p
              ? (p === 'all' ? 'var(--accent)' : PRIORITY_STYLE[p].border)
              : 'var(--border)',
            color: priorityFilter === p
              ? (p === 'all' ? 'white' : PRIORITY_STYLE[p].color)
              : 'var(--text-muted)',
          }}>
            {p === 'all' ? 'Tutte' : p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Bassa'}
          </button>
        ))}
        <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '12px', marginRight: '4px' }}>
          Stato:
        </span>
        {(['all', 'open', 'in-progress', 'closed'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '5px 12px', borderRadius: '4px', border: '1px solid', cursor: 'pointer',
            background: statusFilter === s
              ? (s === 'all' ? 'var(--accent)' : STATUS_STYLE[s].bg)
              : 'transparent',
            borderColor: statusFilter === s
              ? (s === 'all' ? 'var(--accent)' : STATUS_STYLE[s].border)
              : 'var(--border)',
            color: statusFilter === s
              ? (s === 'all' ? 'white' : STATUS_STYLE[s].color)
              : 'var(--text-muted)',
          }}>
            {s === 'all' ? 'Tutti' : s === 'open' ? 'Aperta' : s === 'in-progress' ? 'In corso' : 'Chiusa'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 && (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-dm-mono)', fontSize: '13px' }}>
            Nessuna azione trovata con questi filtri.
          </div>
        )}
        {filtered.map((action) => {
          const pStyle = PRIORITY_STYLE[action.priority]
          const sStyle = STATUS_STYLE[action.status]
          return (
            <div key={action.id} className="card" style={{ padding: '18px 20px', borderLeft: `3px solid ${pStyle.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: pStyle.color, background: pStyle.bg, border: `1px solid ${pStyle.border}`,
                  padding: '3px 8px', borderRadius: '4px',
                }}>
                  {pStyle.label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: sStyle.color, background: sStyle.bg, border: `1px solid ${sStyle.border}`,
                  padding: '3px 8px', borderRadius: '4px',
                }}>
                  {sStyle.label}
                </span>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  Scadenza: {action.deadline}
                </span>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Segnale
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{action.source_signal}</div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ef4444', marginBottom: '4px' }}>
                  Rischio
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{action.risk}</div>
              </div>

              <div style={{ padding: '12px 14px', background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981', borderRadius: '0 6px 6px 0', marginBottom: '14px' }}>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10b981', marginBottom: '4px' }}>
                  Azione
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>{action.action}</div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>Owner: </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{action.owner}</span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-dm-mono)', fontSize: '11px',
                  color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                  padding: '4px 10px', borderRadius: '4px',
                }}>
                  🎯 {action.mauden_service}
                </span>
                <span style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color: '#f59e0b' }}>
                  {action.service_price}
                </span>
              </div>
            </div>
          )
        })}
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
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [salesPlaybook, setSalesPlaybook] = useState<SalesData | null>(null)
  const [vendorMatrix, setVendorMatrix] = useState<ComparisonData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set())
  const [actionRegister, setActionRegister] = useState<ActionRegisterData | null>(null)
  const [riskScore, setRiskScore] = useState<RiskScoreData | null>(null)
  const [clientName, setClientName] = useState('')
  const [showClientInput, setShowClientInput] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateMsg, setGenerateMsg] = useState('')
  const [generateLog, setGenerateLog] = useState<{ type: string; label?: string; msg: string; headlines?: string[] }[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/brief.json').then(r => r.json()) as Promise<BriefData>,
      fetch('/market_analysis.json').then(r => r.json()) as Promise<MarketAnalysis>,
      fetch('/backupl.json').then(r => r.json()) as Promise<BackupData>,
      fetch('/archive/market-analysis-w16-2026-04-20.json').then(r => r.json()).catch(() => null),
      fetch('/action_register.json').then(r => r.json()).catch(() => null),
      fetch('/risk_score.json').then(r => r.json()).catch(() => null),
      fetch('/business_packages.json').then(r => r.json()).catch(() => null),
      fetch('/sales_playbook.json').then(r => r.json()).catch(() => null),
      fetch('/vendor_matrix.json').then(r => r.json()).catch(() => null),
    ]).then(([b, a, bu, prev, ar, rs, bus, sp, vm]) => {
      setBrief(b)
      setAnalysis(a)
      setBackup(bu)
      setBackupPrev(prev as BackupData | null)
      setActionRegister(ar as ActionRegisterData | null)
      setRiskScore(rs as RiskScoreData | null)
      setBusinessData(bus as BusinessData | null)
      setSalesPlaybook(sp as SalesData | null)
      setVendorMatrix(vm as ComparisonData | null)
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

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setGenerateLog([])
    setGenerateMsg('Avvio...')
    try {
      const res = await fetch('/api/generate', { method: 'POST' })
      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let success = false
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)
            if (event.type === 'rss_start') {
              setGenerateMsg('RSS...')
              setGenerateLog(l => [...l, { type: 'rss', msg: event.msg }])
            } else if (event.type === 'rss_done') {
              setGenerateLog(l => [...l, { type: 'rss_done', msg: event.msg, headlines: event.headlines }])
            } else if (event.type === 'llm_start') {
              setGenerateMsg(event.label)
              setGenerateLog(l => [...l, { type: 'llm_start', label: event.label, msg: event.msg }])
            } else if (event.type === 'llm_done') {
              setGenerateLog(l => l.map(e => e.label === event.label && e.type === 'llm_start' ? { ...e, type: 'llm_done', msg: event.msg } : e))
            } else if (event.type === 'llm_error') {
              setGenerateLog(l => l.map(e => e.label === event.label && e.type === 'llm_start' ? { ...e, type: 'llm_error', msg: event.msg } : e))
            } else if (event.type === 'complete') {
              success = event.success
              setGenerateMsg(success ? 'Completato!' : 'Completato con errori')
            }
          } catch { /* linea non JSON */ }
        }
      }
      if (success) setTimeout(() => window.location.reload(), 2000)
      else setTimeout(() => { setIsGenerating(false); setGenerateMsg('') }, 6000)
    } catch {
      setGenerateMsg('Errore di rete')
      setGenerateLog(l => [...l, { type: 'error', msg: 'Connessione interrotta' }])
      setTimeout(() => { setIsGenerating(false); setGenerateMsg(''); setGenerateLog([]) }, 4000)
    }
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
        lines.push(`Confidence: ${item.confidence}`)
        for (const source of item.sources) {
          lines.push(source.url ? `Fonte: [${source.publisher} · ${source.published_at}](${source.url})` : `Fonte: ${source.publisher} · ${source.published_at} · ${source.title}`)
        }
        lines.push('')
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

      {/* Print-only header — shown only when printing */}
      <div className="print-only" style={{ padding: '24px 32px 20px', borderBottom: '2px solid #333', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>Resilience Revenue Brief</div>
          <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>Week {currentWeek} · {currentDate}</div>
        </div>
        {clientName && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Preparato per</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginTop: '2px' }}>{clientName}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>da Mauden</div>
          </div>
        )}
      </div>

      <header className="header-blur no-print" style={{
        borderBottom: '1px solid var(--border)', padding: '10px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
        position: 'sticky', top: 0, background: 'rgba(10, 14, 23, 0.9)', zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Resilience Revenue Brief
          </span>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
            <span>{currentDate ? `W${currentWeek} · ${currentDate}` : 'Loading...'}</span>
            {brief && (() => {
              const allItems = brief.sections.flatMap(s => s.items)
              const verified = allItems.filter(i => i.sources?.some(s => s.url)).length
              const total = allItems.length
              return (
                <span style={{ color: verified === total ? '#10b981' : '#f59e0b', fontWeight: 500 }}>
                  ◈ {verified}/{total} verificate
                </span>
              )
            })()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--surface)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)', marginRight: '8px' }}>
            <button onClick={handleGenerate} disabled={isGenerating} className="btn-icon" title="Rigenera brief" style={{ color: isGenerating ? 'var(--accent)' : undefined }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: isGenerating ? 'spin 1s linear infinite' : 'none' }}>
                <path d="M7 1l1.5 3h3L9 6l1 3.5L7 8l-3 1.5L5 6 2.5 4h3z" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </button>
            <button onClick={handleRefresh} disabled={isRefreshing} className="btn-icon" title="Refresh">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}>
                <path d="M12 7a5 5 0 11-8.5-3.5M12 3v4H8M12 3L9 1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={handleExportPDF} className="btn-sm" title="Export PDF">PDF</button>
            <button onClick={handleExport} className="btn-sm" title="Export Markdown">MD</button>
            {backupPrev && (
              <button onClick={() => setShowCompare(v => !v)} className={`btn-sm ${showCompare ? 'active' : ''}`} title="Compare">
                Compare
              </button>
            )}
          </div>

          <div style={{ height: '20px', width: '1px', background: 'var(--border)', margin: '0 4px' }} />

          {showClientInput ? (
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              onBlur={() => { if (!clientName) setShowClientInput(false) }}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setShowClientInput(false) }}
              placeholder="Nome cliente..."
              autoFocus
              className="client-input-sm"
            />
          ) : (
            <button onClick={() => setShowClientInput(true)} className="btn-sm" style={{ color: clientName ? 'var(--accent)' : undefined }}>
              {clientName ? `📄 ${clientName}` : '📄 Client'}
            </button>
          )}

          <ThemeSwitcher current={theme} onChange={handleTheme} />
        </div>
      </header>

      {generateLog.length > 0 && (
        <div className="no-print" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 32px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {generateLog.map((entry, i) => {
            const color = entry.type === 'llm_done' ? '#10b981' : entry.type === 'llm_error' ? '#ef4444' : entry.type === 'rss_done' ? '#06b6d4' : 'var(--text-muted)'
            const prefix = entry.type === 'llm_done' ? '✓' : entry.type === 'llm_error' ? '✗' : entry.type === 'llm_start' ? '◌' : '→'
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', color, display: 'flex', gap: '8px' }}>
                  <span style={{ opacity: 0.5 }}>{prefix}</span>
                  <span>{entry.label ? `[${entry.label}] ` : ''}{entry.msg}</span>
                </div>
                {entry.headlines && entry.headlines.length > 0 && (
                  <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {entry.headlines.map((h, j) => (
                      <div key={j} style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{h}</div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="no-print" style={{ borderBottom: '1px solid var(--border)', padding: '0 32px', display: 'flex', gap: '4px', background: 'var(--bg)' }}>
        {([
          { id: 'brief' as Tab, label: 'Executive' },
          { id: 'actions' as Tab, label: 'Actions' },
          { id: 'risk' as Tab, label: 'Risk Score' },
          { id: 'analysis' as Tab, label: 'Vendors' },
          { id: 'backup' as Tab, label: 'AI' },
          { id: 'business' as Tab, label: 'Business' },
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '20px 24px', borderLeft: '3px solid #6366f1' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6366f1', marginBottom: '12px' }}>
                Executive Summary
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {brief.sections.map(s => s.implication).join(' • ')}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {brief.sections.map((section) => (
                <AccordionSection
                  key={section.id}
                  section={section}
                  isOpen={openSections.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                />
              ))}
            </div>
          </div>
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

        {tab === 'business' && <BusinessView data={businessData} sales={salesPlaybook} matrix={vendorMatrix} />}
        {tab === 'actions' && <ActionRegisterView data={actionRegister} />}
        {tab === 'risk' && <RiskScoreView data={riskScore} />}
      </main>

      <footer className="no-print" style={{ borderTop: '1px solid var(--border)', padding: '20px 32px', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Backup & Resilience Intelligence · Ultimo aggiornamento: {currentDate}
        </span>
      </footer>
    </div>
  )
}
