# TheSkillsMirage — India's Open Workforce Intelligence System

> DevxLabs Hackathon 2025 · **Two Layers. One Live System. Zero Cost.**

---

## 🧠 The Problem We're Solving

India posts **0.5 Cr+ job listings every month**.  
Yet **45%+ employers still can't find the right skills**, while **8%+ graduates remain unemployed** — even in high-hiring cities.

There are two sides to this crisis, and **nothing connects them**.

| DEMAND SIDE — Enterprises | SUPPLY SIDE — Workers |
|---|---|
| Companies hire GenAI engineers while firing call-centre agents | A 38-yr BPO lead in Pune gets a generic "learn Python" suggestion |
| Signal exists in job postings but nobody reads it at sector scale | Job titles hide real skills and aspirations |
| Hiring patterns reveal strategy months before press releases | Most tools ignore geography and local job supply |
| No open India-specific workforce intelligence exists | Graduate unemployment persists even in hiring cities |

**SkillsMirage bridges this gap**

> **Live Market Signals → Personal Risk Score → Free Reskilling Path**

Built entirely using **open Indian data**.  
**Cost to build: ₹0**

---

## 🚀 Quick Start

### 1️⃣ Create `.env`

Create a `.env` file in the project root:

```bash
GROQ_API_KEY=your_key_here
```

---

### 2️⃣ Start Backend

```bash
cd backend
pip install -r requirements.txt
```

Windows PowerShell

```bash
$env:GROQ_API_KEY="your_key"; python app.py
```

Windows CMD

```bash
set GROQ_API_KEY=your_key && python app.py
```

Backend runs on:

```
http://localhost:5000
```

---

### 3️⃣ Open Frontend

Open this file in your browser:

```
frontend/index.html
```

---

## 🏗️ Three-Layer Intelligence Architecture

### Layer 1 — Market Dashboard (Macro Intelligence)

Tracks **live workforce signals across India**

Features

- Coverage: **25+ cities × 15 sectors**
- Displays
  - Hiring trends
  - Skills demand
  - AI vulnerability index
- Data sources
  - Naukri
  - LinkedIn
  - PLFS
  - PMKVY
- Data refreshes **hourly**

---

### Layer 2 — Worker Intelligence Engine (Personal Intelligence)

Inputs

- Job title
- City
- Experience
- Personal write-up

Processing

- NLP extracts **skills and aspiration signals**

Outputs

- **AI Risk Score (0-100)**
- **Personalised reskilling path**

Risk score is grounded in **Layer 1 live signals**.

---

### Layer 3 — Floating AI Assistant (Career Guide)

- Floating **AI assistant button**
- Powered by **Groq — Llama 3.3 70B**
- Uses
  - Your risk score
  - Your extracted skills
  - Live market data
- Supports
  - English
  - Hindi (हिन्दी)

Automatically opens after analysis to guide the user's **first reskilling step**.

---

## 📊 How the AI Risk Score Works

The score is **dynamic**, not static.

| Signal | Weight | Source |
|---|---|---|
| Hiring decline | 50% | 30-day job posting change |
| AI tool mentions | 30% | % of job descriptions mentioning AI tools |
| WEF automation forecast | 40% | Role replacement probability |
| Experience bracket | Adjustment | Junior +10, Senior −15 |
| Skill extraction | Adjustment | High-demand skills reduce risk |
| Aspiration signal | Adjustment | Upskilling intent lowers risk |

---

### Dynamic WEF Risk Model

The system updates risk over time.

Examples (March 2026)

```
BPO Voice – Mumbai      0.91
BPO Voice – Dhanbad     0.95
IT Software – Bengaluru 0.45
Data Entry – Delhi      0.98
```

Adjustments include

- Temporal AI adoption growth
- City-tier opportunity differences
- Real-time risk variation

---

## 🎓 Data Sources (All Open)

| Source | Description |
|---|---|
| PLFS Microdata | Employment statistics 2017-2024 |
| PMKVY Data | Training and certification data |
| Naukri Dataset | Job titles, skills, salary |
| Naukri Live Scrape | Real-time job listings |
| LinkedIn Jobs | Company, role, seniority |
| NPTEL | IIT / IISc course catalog |
| SWAYAM | Government MOOC platform |
| WEF Future of Jobs | Automation forecasts |

---

## 🔑 What Makes SkillsMirage Different

| Generic Career Platforms | SkillsMirage |
|---|---|
| Generic advice like "Learn Python" | Personalised reskilling roadmap |
| Same recommendation for everyone | Risk score based on user input |
| Ignore geography | Risk varies by city |
| No labour market data | Live hiring signals |
| English only | Bilingual AI assistant |
| Paid courses | Uses **free Indian courses** |

Example recommendation

```
NPTEL Data Basics
→ SWAYAM AI Fundamentals
→ PMKVY Digital Marketing
→ Target role: AI Content Reviewer
→ Openings available in user's city
```

---

## 📁 Project Structure

```
TheSkillsMirage
│
├── START.bat
├── README.md
│
├── backend
│   ├── app.py
│   ├── requirements.txt
│   │
│   ├── data
│   │   └── job_market_data.py
│   │
│   └── routes
│       ├── hiring_trends.py
│       ├── skills_intelligence.py
│       ├── ai_vulnerability.py
│       ├── worker_engine.py
│       ├── chatbot.py
│       └── meta.py
│
└── frontend
    ├── index.html
    ├── live-data.html
    │
    ├── css
    │   └── styles.css
    │
    └── js
        ├── api.js
        ├── dashboard.js
        ├── worker.js
        ├── chatbot.js
        └── app.js
```

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| /api/health | GET | Health check |
| /api/hiring-trends | GET | Hiring trends |
| /api/hiring-trends/timeseries | GET | Trend time series |
| /api/hiring-trends/cities | GET | City list |
| /api/skills | GET | Skills demand |
| /api/vulnerability | GET | AI vulnerability |
| /api/vulnerability/heatmap | GET | Risk heatmap |
| /api/worker/analyze | POST | Worker analysis |
| /api/chat | POST | AI chatbot |
| /api/meta/sources | GET | Data sources |

---

## 🤖 AI Chatbot (Context-Aware)

Powered by **Groq — Llama 3.3 70B**

The chatbot receives the same data the user sees

- risk score
- extracted skills
- reskilling path
- live market signals

Example queries

```
Why is my risk score high?
What should I learn first?
How many jobs exist in my city?
Is an NPTEL certificate valuable?
मुझे कहाँ से शुरू करना चाहिए?
```

---

## 🎯 Hackathon Criteria Mapping

| Requirement | Implementation |
|---|---|
| Live workforce signals | Dashboard updates hourly |
| Dynamic risk scoring | Market data + NLP signals |
| Actionable reskilling | Week-by-week course path |
| Context-aware AI assistant | Groq Llama model |
| Open datasets | 8 free Indian sources |
| National scalability | Designed for millions of users |

---

## 🌐 Covered Cities

Tier 1

Mumbai  
Delhi  
Bengaluru  
Chennai  
Hyderabad  
Kolkata  
Pune  

Tier 2

Ahmedabad  
Jaipur  
Lucknow  
Kanpur  
Nagpur  
Indore  
Bhopal  
Patna  
Vadodara  
Nashik  

Tier 3

Rajkot  
Varanasi  
Ranchi  
Dhanbad  
Amritsar  
Aurangabad  
Gwalior  

---

## 🛠️ Tech Stack

Backend

- Python
- Flask
- Flask-CORS

AI

- Groq
- Llama 3.3 70B

Frontend

- HTML5
- CSS3
- Vanilla JavaScript

Charts

- Chart.js

Data

- Open Indian datasets

Deployment

- Single `START.bat`
- No Docker required

---

## 🌍 Impact Vision

India has **30+ crore workers** vulnerable to technological disruption.

SkillsMirage provides

- Live workforce intelligence
- Personal automation risk scores
- Free reskilling pathways

**Built in 48 hours.  
₹0 data cost.  
Designed for national scale.**

---

**Team DevxLabs — TheSkillsMirage**
