# Analisi: Tool di Intelligence per System Integrator

## Contesto

Il tool attuale (Backup & Resilience Intelligence) è una dashboard che mostra notizie, classifiche AI, e informazioni sui vendor di backup. Il problema è che gli utenti lo guardano ma non sanno用它 per risolvere problemi concreti.

---

## IL MERCATO

### Dimensioni e Crescita

| Segmento | Valore 2026 | Crescita |
|----------|-------------|----------|
| Backup & Recovery Services | $24B | +11% CAGR |
| Enterprise Backup Software | $17B | +8.4% CAGR |
| Backup as a Service | 46% del mercato | in crescita |

**Il mercato è in espansione**: ransomware, cloud adoption, e AI stanno guidando investimenti massicci.

---

## IL PROBLEMA

### I System Integrator come Mauden hanno bisogno di:

1. **Pre-sales più veloce** - ridurre tempo per preparare proposte
2. **Selezione vendor informata** - scegliere il migliore per ogni cliente
3. **Competitive intelligence** - sapere come vincere contro altri vendor
4. **Validation** - dimostrare ROI ai clienti

### Cosa manca oggi

| Problema | Soluzione attuale | Gap |
|----------|----------------|-----|
| Selezione vendor | Gartner/analyst report | Non specifico per cliente/industria |
| Competitive | Word of mouth | Non strutturato |
| Pricing | Listini vendor | Non aggiornato, nascosto |
| Technical docs | Vendor website | Troppo dispersivo |
| Use cases | Case study vendor | Bias verso vendor stesso |

---

## OPPORTUNITÀ

### Tool che risolve problemi concreti

| Funzione | Chi lo usa | Perché lo usa |
|----------|-----------|-------------|
| **Quick Selector** | Pre-sales | "Ho cliente X → quale vendor" in 30 secondi |
| **Competitive Deck** | Sales | "Come battere Rubrik/Cohesity" |
| **Pricing Calculator** | Commerciali | Preventivi veloci e accurati |
| **Technical Blueprint** | Engineer | "Come progettare il backup" |
| **Risk Assessment** | Consultant | Audit ransomware per clienti |

---

## PROPOSTA - DASHBOARD INTEGRATA

### Concept

```
┌─────────────────────────────────────────────────────────┐
│  Mauden Intelligence Hub                                 │
├─────────────────────────────────────────────────────────┤
│  [🔍 Client Finder]  [📊 Competitor]  [💰 Pricing]    │
│  [🛠️ Project Builder] [📋 Compliance]                   │
├─────────────────────────────────────────────────────────┤
│  Input: "Ho un cliente Manufacturing 500 dipendenti"    │
│  ↓                                                    │
│  Output:                                              │
│  → Raccomandazione: Veeam                              │
│  → Perché: flessibilità, pricing accessibile             │
│  → Prezzo indicativo: €15-000-30,000/anno            │
│  → Progetto tipo: 4 settimane                        │
│  → Win rate tipica: 70%                              │
└─────────────────────────────────────────────────────────┘
```

### Tab Necessari

| Tab | Funzione | Output |
|-----|---------|--------|
| **Quick Selector** | Inserisci industria + dimensione → vendor consigliato | "Vai con X perché..." |
| **Competitive** | Competitor vs → come batterlo | Obiections handling |
| **Pricing** | Configurazione → prezzo indicativo | Listino anteprima |
| **Project Builder** | Requisiti → architettura raccomandata | Design 3-2-1 |
| **Risk Assessment** | Client → score ransomware readiness | Gap analysis |

---

## COME MONETIZZARLO

| Modello | Prezzo | Note |
|---------|---------|------|
| **Subscription** | €500-2000/mese | Accesso completo |
| **Per progetto** | €200-500 | Report singolo |
| **White-label** | €3000+/mese | Rivendita ai clienti SI |
| **Lead generation** | Free | Genera opportunità |

### Stima ricavi potenziali

- 10 clienti SI × €1000/mese = €120.000/anno
- 20 progetti/mese × €300 = €72.000/anno

---

## PROSSIMI STEP

### Fase 1 (gratuita, 1-2 mesi)
- Tool interno per il tuo team
- Testare e validare con usage reale

### Fase 2 (beta, 2-3 mesi)
- Offrilo a 3-5 clienti Mauden selezionati
- Raccolta feedback

### Fase 3 (paid, 3-6 mesi)
- Subscription per clienti
- Altri System Integrator

---

## DOMANDE APERTE

### Risposte

1. **Caso d'uso primario**: Rivendita a clienti SI + mostrare a Maudan competenze AI
2. **Tab prioritari**:
   - ⭐ Quick Selector (riduce tempo drasticamente)
   - ⭐ Pricing Calculator
   - Technical Blueprint
   - ❌ Competitive (evitato)
3. **Commvault**: Era escluso per errore, è in calo ma presente (3.6% vs 7.4% anno scorso)

---

## PIANO D'AZIONE

### Step 1: Quick Selector + Pricing (priorità max)

**Quick Selector - Input:**
```
industria: Manufacturing
dimensione: 500 dipendenti
budget: €20k/anno
compliance: GDPR
```

**Quick Selector - Output:**
```
✅ Raccomandazione: Veeam
💰 Prezzo: €15,000-25,000/anno
📋 Perché: Flessibilità, pricing accessibile, ecosistema
🛠️ Progetto tipo: 4 settimane
🎯 Win rate stimata: 65-75%
```

**Pricing Calculator - Input:**
```
vendor: Veeam
 workload: 100 VM
 cloud: AWS + Azure
 retention: 30 giorni
```

**Pricing Calculator - Output:**
```
€18,500/anno (indicativo)
Breakdown:
  -Licenza: €12,000
  -Cloud storage: €4,500
  -Supporto: €2,000
```

### Step 2: Da definire dopo test

- Technical Blueprint
- Risk Assessment (opzionale)
- White-label per rivendita

---

## APPENDICE - Mercato Vendor

### Leader di mercato
- Veeam: 16.5% → 6.1% market share (Gartner), leader Gartner da 9 anni
- Rubrik: 7.8% → 3.6%, FedRAMP unico
- Cohesity: 3.8% → 1.9%, merger Veritas in corso
- Commvault: 7.4% → 3.6%, in calo ma esiste
- Dell: ancora presente ma meno rilevante

### Perché Commvault non è nei primissimi?
- Commvault esiste ma in calo: 7.4% → 3.6% in un anno
- Focus su enterprise legacy, meno cloud-native
- UI/UX meno moderna dei competitor
- Meno investimenti AI recenti vs Veeam/Rubrik
- Ancora rilevante per grandi enterprise con NetBackup

### Trend 2026
- AI orchestration: requisito minimo
- Ransomware warranty: differenziatore
- Cloud-native: 60% workload
- Compliance: GDPR, NIS2 driver

---

*Analisi del 20 Aprile 2026*
*Mauden Internal Use Only*