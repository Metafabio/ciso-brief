# CISO Brief / Resilience Revenue Brief

## Obiettivo

Trasformare il progetto locale `ciso-brief` in una dashboard intelligence per System Integrator, MSP e aziende che vendono o gestiscono servizi di storage, backup, disaster recovery, cyber resilience e architetture IT.

Focus specifico: Mauden / System Integrator.

Il prodotto non deve essere una newsletter generica. Deve trasformare segnali di mercato, ransomware, vendor news e trend AI in:

- azioni tecniche
- opportunita commerciali
- assessment vendibili
- report executive
- battlecard per sales
- raccomandazioni per CISO / CIO / IT manager

## Posizionamento

Nome operativo:

`Resilience Revenue Brief`

Value proposition:

`Cyber resilience intelligence per vendere assessment, architetture e servizi backup.`

Target:

- System Integrator
- MSP / MSSP
- rivenditori Veeam, Rubrik, Cohesity, Dell, Commvault
- team storage / backup / infrastructure
- CISO mid-market
- CIO
- IT manager
- cyber resilience consultant

## Problema Da Risolvere

Le aziende leggono molte news cyber, ma raramente le trasformano in decisioni operative.

I System Integrator hanno bisogno di:

- spunti per aprire conversazioni cliente
- evidenze per proporre assessment
- argomenti per vendere DR test
- comparazioni vendor
- contenuti board-ready
- action plan pratici
- insight aggiornati su backup, ransomware, AI, data governance

## Funzionalita Core

### 1. Executive Brief

Brief settimanale con sezioni:

- M&A / Funding
- Product Releases
- Threat & Ransomware
- AI Orchestration
- Market Trends

Ogni item deve avere:

- vendor
- deal / evento
- summary
- implication
- confidence
- sources

### 2. Fonti E Confidence

Ogni claim rilevante deve avere fonti.

Schema fonte:

```json
{
  "title": "Titolo fonte",
  "url": "https://...",
  "publisher": "Publisher",
  "published_at": "YYYY-MM-DD"
}
```

Confidence:

- `high`: fonte primaria conferma direttamente
- `medium`: fonte affidabile ma claim interpretato
- `low`: claim da verificare editorialmente

Obiettivo: evitare dashboard AI non verificabile.

### 3. Vendor Analysis

Analisi settimanale vendor:

- Veeam
- Rubrik
- Cohesity
- Dell
- Commvault
- Veritas
- Microsoft
- AWS Backup
- Azure Backup

Campi:

- momentum
- segment
- AI score
- products in focus
- competitive threat
- sales angle

### 4. Business / Mauden GTM

Sezione dedicata a monetizzazione per System Integrator.

Pacchetti iniziali:

#### Cyber Recovery Assessment

Buyer: CISO / IT Manager  
Prezzo indicativo: €4k-€12k  
Output:

- recovery readiness score
- RPO/RTO gap
- immutability check
- 30-day action plan

#### Ransomware Restore Test

Buyer: Operations / Security  
Prezzo indicativo: €6k-€20k  
Output:

- restore evidence
- runbook
- lessons learned
- board summary

#### Backup Architecture Modernization

Buyer: CIO / Infrastructure  
Prezzo indicativo: €15k-€80k  
Output:

- target architecture
- vendor matrix
- migration plan
- TCO estimate

#### Monthly Resilience Brief

Buyer: CISO / Board  
Prezzo indicativo: €1.5k-€5k/mese  
Output:

- PDF executive
- vendor watchlist
- risk memo
- action register

### 5. Sales Playbook

Sezione per sales / pre-sales:

- pitch per segmento
- objection handling
- competitive battles
- vendor battlecards
- reason-to-call
- trigger event

Esempio:

`Veeam report: 90% confidence, 28% full recovery. Pitch: serve recovery validation assessment.`

### 6. Action Register

Prossima feature consigliata.

Ogni segnale deve generare azione:

```json
{
  "source_signal": "Veeam Data Trust Report",
  "risk": "Recovery confidence gap",
  "action": "Eseguire restore test su 3 workload critici",
  "owner": "Backup / Infrastructure",
  "priority": "high",
  "mauden_service": "Ransomware Restore Test",
  "status": "open"
}
```

UI:

- tabella azioni
- priorita
- owner
- servizio collegato
- export PDF / Markdown

## Architettura Attuale

Stack:

- Next.js 16
- React 19
- TypeScript
- JSON statici in `public/`
- nessun backend
- nessun database
- nessun login
- nessun deploy obbligatorio

File principali:

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `generate-brief.mjs`
- `public/brief.json`
- `public/market_analysis.json`
- `public/backupl.json`

## Stato Attuale

Verifiche recenti:

- `npm run lint`: OK
- `npm run build`: OK
- `npm run brief:validate`: OK con warning

Warning previsti:

- alcuni item hanno fonte interna placeholder
- alcune fonti non hanno URL
- market signals > limite consigliato
- week JSON non allineata alla settimana corrente

## Problemi Tecnici Da Correggere

### 1. Font Google

`next/font/google` ha causato errore Turbopack:

`Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'`

Fix applicato:

- rimosso `next/font/google`
- usati font di sistema in CSS

### 2. CLAUDE.md

File `CLAUDE.md` risulta modificato da contesto PromptOps/Claude. Verificare prima di committare.

### 3. Hardcoded Data

Molti dati in `app/page.tsx` sono hardcoded.

Da migliorare:

- spostare Sales data in JSON
- spostare Use Cases in JSON
- spostare Technical data in JSON
- spostare Business packages in JSON

## Roadmap Locale

### Step 1

Ripulire struttura dati.

- creare `public/business_packages.json`
- creare `public/action_register.json`
- creare `public/sales_playbook.json`
- creare `public/vendor_matrix.json`

### Step 2

UI enterprise-grade.

- hero compatto operativo
- card meno decorative
- dashboard piu business
- export PDF migliorato
- stampa board-ready

### Step 3

Action Register.

- tab dedicata
- filtro per priorita
- filtro per servizio Mauden
- stato azione
- export

### Step 4

Fonte Quality.

- sostituire placeholder con fonti reali
- bloccare `confidence: high` senza URL
- mostrare warning UI per claim non verificati

### Step 5

Local Demo Mode.

- comando stabile `npm run dev`
- porta 3000
- README aggiornato
- demo script per presentazione interna

## Monetizzazione Futura

Non fare deploy ora.

Prima validare localmente con Mauden / stakeholder.

Possibile modello:

- internal tool per sales/pre-sales
- monthly client briefing
- paid assessment generator
- white-label brief per clienti
- MSP subscription
- board reporting add-on

## Prompt Per Claude

Migliora il progetto locale seguendo questi vincoli:

- non rompere build
- non usare `next/font/google`
- mantenere Next.js
- lavorare prima su dati JSON e UI locale
- niente deploy
- niente auth
- niente database per ora
- obiettivo: renderlo appetibile per System Integrator storage/backup/IT services
- priorita: Action Register, Mauden GTM, fonti verificabili, export executive

Prima modifica consigliata:

`Implementare Action Register data-driven da JSON e tab UI dedicata.`
