# Phase 1: Reverse Engineering Analysis

## Product Comparisons

### 1. levels.fyi

**What they do well:**
- Standardized levels (L3, L4, E4, SDE1) as core taxonomy — this is their moat
- Total comp = base + bonus + stock (annualized RSU) — not just base
- Company-specific level systems mapped (Google L3 ≈ Meta E3 ≈ Amazon SDE1)
- Filtering by company, level, years of experience, location
- Median highlighted prominently — not just raw numbers
- Verified submissions (often linked to offer letters or pay stubs)

**What's missing / weak:**
- India data is sparse and often mixed with USD amounts
- No "confidence score" on data quality
- UX is dense — information overload on the main table

**Salary listing columns:** Company | Level | Total Comp | Base | Stock | Bonus | YoE | Date | Tags

**Filters:** Company, Level, Location, YoE, Date range, Job type

---

### 2. 6figr

**What they do well:**
- India-specific focus
- Shows ₹ amounts (not USD)
- Some level normalization

**Problems:**
- Level taxonomy is inconsistent (mix of titles + levels)
- Filtering is weak — no multi-select
- No breakdown of base vs bonus vs stock
- Company pages are shallow

---

### 3. AmbitionBox

**What they do well:**
- Large dataset for Indian companies
- Company reviews + salary in one place
- Good SEO, brand recognition

**Critical failures:**
- ❌ No levels — "Software Engineer" 0–20 yrs all lumped together
- ❌ No TC breakdown — just "salary range"
- ❌ Range is too wide to be useful: ₹4L–₹45L for "Software Engineer"
- ❌ Unstructured submissions — users type anything
- This is exactly the problem CompIntel is designed to fix

---

### 4. Glassdoor

**What they do well:**
- Reviews + salary together
- Strong brand globally

**Critical failures:**
- ❌ Same problem as AmbitionBox — no levels
- ❌ Base only, no stock/bonus breakdown
- ❌ Data quality is low — anyone can submit anything
- ❌ India data is thin

---

### 5. indiatechsalaries.com

**What they do well:**
- Attempt at level standardization
- Clean UI
- India-focused

**Problems:**
- Small dataset
- Level mapping incomplete
- No company page / deep drill-down

---

## Feature Mapping

| Feature | levels.fyi | 6figr | AmbitionBox | Glassdoor | CompIntel |
|---------|-----------|-------|-------------|-----------|-----------|
| Standardized levels | ✅ | ⚠️ partial | ❌ | ❌ | ✅ YES |
| TC = base+bonus+stock | ✅ | ⚠️ | ❌ | ❌ | ✅ YES |
| India ₹ currency | ⚠️ | ✅ | ✅ | ⚠️ | ✅ YES |
| Filtering (company/level/location) | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ YES |
| Company page with stats | ✅ | ❌ | ✅ | ✅ | ✅ YES |
| Compare two salaries | ✅ | ❌ | ❌ | ❌ | ✅ YES |
| Level distribution per company | ✅ | ❌ | ❌ | ❌ | ✅ YES |
| Median computation | ✅ | ❌ | ⚠️ | ⚠️ | ✅ YES |
| Structured ingest API | ✅ internal | ❌ | ❌ | ❌ | ✅ YES |
| Confidence scoring | ✅ | ❌ | ❌ | ❌ | ✅ YES |
| Auth / accounts | ✅ | ✅ | ✅ | ✅ | ❌ NO (intentional) |
| Reviews / ratings | ❌ | ❌ | ✅ | ✅ | ❌ NO (out of scope) |

---

## Key Design Decisions

### 1. Level is mandatory
Unlike AmbitionBox/Glassdoor, we reject submissions without a level. This is our core data quality gate.

### 2. TC = base + bonus + stock (always computed)
We never show "salary" — we show total compensation with breakdown. Bonus and stock default to 0 if not provided, but the breakdown is always visible.

### 3. Company normalization
"Google", "google ", "GOOGLE" → all stored as "google". Display layer capitalizes. This allows clean grouping and filtering.

### 4. Confidence score
Every record has a 0–1 confidence score. Human-submitted = 0.95. AI-processed = variable. This lets future features filter by data quality.

### 5. No auth (by design)
Auth adds friction to submissions. Low friction → more data. More data → better intelligence. We trade verification for volume (same tradeoff levels.fyi made early on).

---

## What We Improved vs levels.fyi

1. **₹ display in L/Cr** — Indian-native formatting (₹25.00L instead of ₹2,500,000)
2. **Simpler UX** — less dense table, cleaner visual hierarchy
3. **Level color coding** — instant visual scan of seniority distribution
4. **Ingest API** — designed from day 1 for AI/programmatic data input
