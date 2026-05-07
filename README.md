# ⚡ CompIntel — Compensation Intelligence System

> Structured → Queryable → Comparable → Decision-ready

Inspired by [levels.fyi](https://levels.fyi), built for India tech. A production-grade compensation intelligence platform where **levels matter** — not just job titles.

---

## 🧠 Why This Exists

Most salary platforms (AmbitionBox, Glassdoor) fail because:
- ❌ No standardized levels (L3/L4/SDE1/SDE2)
- ❌ Titles are unstructured, non-comparable
- ❌ Can't reliably compare two offers

CompIntel fixes this with **structured, level-aware data**.

---

## 🏗️ Architecture

```
compintel/
├── backend/          # Express.js + Prisma + PostgreSQL
│   ├── prisma/       # Schema
│   └── src/
│       ├── routes/   # salary, company, compare
│       └── utils/    # normalize, validation
└── frontend/         # React + CSS (no UI lib)
    └── src/
        ├── pages/    # SalaryTable, CompanyPage, ComparePage, SubmitPage
        └── lib/      # api.js, format.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env — set your DATABASE_URL

npm install
npx prisma db push        # Creates tables
npm run db:seed           # Seeds 50+ salary records
npm run dev               # Starts on http://localhost:4000
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:4000/api

npm install
npm start                 # Starts on http://localhost:3000
```

---

## 📡 API Reference

### POST `/api/ingest-salary`
Ingest a structured salary record.

**Body:**
```json
{
  "company": "Google",
  "role": "Software Engineer",
  "level": "L5",
  "location": "Bangalore",
  "experience_years": 7,
  "base_salary": 5800000,
  "bonus": 1000000,
  "stock": 3000000,
  "confidence_score": 0.95
}
```

**Validation rules:**
- `company`, `role`, `level`, `location` — required strings
- `base_salary` — required positive number
- `bonus`, `stock` — optional, default to 0
- `experience_years` — required non-negative number
- `confidence_score` — 0–1, default 1.0

**Normalization applied:**
- Company name → lowercase, trimmed
- `total_compensation = base + bonus + stock`
- Invalid records → 400 with details

---

### GET `/api/salaries`
Query salary records.

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `company` | string | Filter by company (partial match) |
| `role` | string | Filter by role (partial match) |
| `level` | string | Filter by exact level |
| `location` | string | Filter by location (partial match) |
| `sort` | `asc`\|`desc` | Sort by total_compensation (default: desc) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Per page, max 100 (default: 50) |

**Response:**
```json
{
  "data": [...salaries],
  "meta": { "total": 50, "page": 1, "limit": 50, "totalPages": 1 },
  "filters": { "companies": [...], "roles": [...], "levels": [...], "locations": [...] }
}
```

---

### GET `/api/company/:company`
Company-level insights.

**Response:**
```json
{
  "company": "google",
  "salaries": [...],
  "stats": {
    "count": 6,
    "median_total_compensation": 6500000,
    "avg_base_salary": 5100000,
    "avg_bonus": 900000,
    "avg_stock": 2550000,
    "min_total": 3800000,
    "max_total": 15500000
  },
  "level_distribution": [{"level": "L5", "count": 2}, ...],
  "role_distribution": [{"role": "Software Engineer", "count": 4}, ...]
}
```

---

### GET `/api/compare?salaryId1=xxx&salaryId2=yyy`
Side-by-side salary comparison.

**Response:**
```json
{
  "salary1": {...},
  "salary2": {...},
  "comparison": {
    "base_salary": { "absolute": 1600000, "percentage": 38 },
    "bonus": { "absolute": 300000, "percentage": 43 },
    "stock": { "absolute": 1500000, "percentage": 100 },
    "total_compensation": { "absolute": 3400000, "percentage": 54 },
    "level_difference": "L5 vs L4",
    "experience_difference": { "absolute": 3, "percentage": 75 }
  }
}
```

---

## 🗃️ Database Schema

```sql
CREATE TABLE salaries (
  id                TEXT PRIMARY KEY,
  company           TEXT NOT NULL,          -- normalized: lowercase
  role              TEXT NOT NULL,
  level             TEXT NOT NULL,          -- standardized: L3, SDE1, etc.
  location          TEXT NOT NULL,
  experience_years  FLOAT NOT NULL,
  base_salary       FLOAT NOT NULL,
  bonus             FLOAT DEFAULT 0,
  stock             FLOAT DEFAULT 0,
  total_compensation FLOAT NOT NULL,        -- computed: base+bonus+stock
  confidence_score  FLOAT DEFAULT 1.0,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP
);
```

---

## 🔄 Integration Contract

If you're feeding AI-processed data via `/api/ingest-salary`:

```json
{
  "company": "string (raw, will be normalized)",
  "role": "string",
  "level_standardized": "L3|L4|SDE1|...",
  "base_salary": 2500000,
  "bonus": 300000,
  "stock": 800000,
  "confidence": 0.85
}
```

**The backend always re-validates everything.** Never trust AI output blindly.

---

## ⚠️ Edge Cases Handled

| Case | Handling |
|------|---------|
| Missing bonus/stock | Default to 0 |
| `"google "`, `"GOOGLE"`, `"Google"` | Normalized to `"google"` |
| Invalid numbers | 400 rejection |
| Negative salaries | 400 rejection |
| confidence_score out of range | 400 rejection |
| Compare same record twice | 400 rejection |
| Company not found | 404 |

---

## 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Express.js, Node.js |
| ORM | Prisma |
| DB | PostgreSQL |
| Frontend | React 18, React Router v6 |
| Styling | Pure CSS with CSS Variables |
| Fonts | Syne, JetBrains Mono, Inter |

---

## 📦 Deployment

### Backend (Railway / Render)
1. Set `DATABASE_URL` env var
2. Run `npx prisma migrate deploy`
3. Run `npm start`

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend.railway.app/api`
2. `npm run build` → deploy `build/` folder

---

## 🎯 What's NOT Built (intentional)
- ❌ Auth / user accounts
- ❌ Reviews or ratings
- ❌ Chat / comments
- ❌ Company logos / fancy media
- ❌ AI features

**Focus = structured compensation data. That's it.**
