# KMRS Project Architecture and SEO Analysis

**School:** Kalinga Model Residential School (KMRS), Umerkote, Nabarangpur, Odisha  
**Document type:** Analysis only (no application files were modified)  
**Audience:** A later coding agent implementing SEO without breaking existing behaviour  
**Code inspected:** Full repository except `node_modules`, `.git`, `dist`, and cache directories  
**Date of analysis:** 1 November 2026

### How to read this document

- Paths are relative to the repository root unless noted.
- **Confirmed** means the finding was traced in source files.
- **Assumption** means it is inferred from architecture but not proven by a deployment config file in the repo.
- **Missing** means the file or implementation was searched for and not found.
- Secrets, tokens, and environment *values* are not documented. Environment *names* are.

---

## Table of contents

1. [Project structure](#1-project-structure)
2. [Routes and pages](#2-routes-and-pages)
3. [Component dependency mapping](#3-component-dependency-mapping)
4. [Existing SEO audit](#4-existing-seo-audit)
5. [API and dynamic content](#5-api-and-dynamic-content)
6. [Assets and media](#6-assets-and-media)
7. [Dependencies and deployment](#7-dependencies-and-deployment)
8. [Claude file reference guide](#8-claudes-file-reference-guide)
9. [Final SEO recommendations](#9-final-seo-recommendations)

---

## 1. Project structure

### 1.1 Repository shape

This is a **two-package monorepo** (no root `package.json`):

| Path | Role |
|------|------|
| `frontend/` | Vite + React 19 SPA (public website, teacher portal, admin portal) |
| `backend/` | Express 4 API, MongoDB (Mongoose), Cloudinary uploads |
| `README.md` | One-line project description |
| `PROJECT_DOCUMENTATION/` | This analysis (created for documentation only) |

There is **no** `wrangler.toml`, `_headers`, `_redirects`, `_routes.json`, `render.yaml`, `netlify.toml`, or root `sitemap.xml` / `robots.txt` in the repository (**missing**).

### 1.2 Frontend tree (important files)

```text
frontend/
├── index.html                 HTML shell; static title/description/OG tags
├── vite.config.js             Dev server, API proxy, PORT / SERVER_URL
├── package.json               Scripts and frontend dependencies
├── tailwind.config.js         Theme, fonts
├── postcss.config.js          Tailwind + Autoprefixer
├── eslint.config.js           ESLint (ignores dist)
├── .env                       Local env (do not commit secrets; not documented here)
├── .gitignore                 Ignores node_modules, dist, *.local (does NOT ignore .env)
├── public/
│   ├── icons.svg              Vite template SVG (not used as favicon in index.html)
│   └── images/                Static campus photos and logo (served as /images/...)
└── src/
    ├── main.jsx               React mount: BrowserRouter + AuthProvider + App
    ├── App.jsx                All React Router routes
    ├── index.css              Tailwind layers, fonts, UI tokens
    ├── config/
    │   ├── school.js          Canonical school facts, nav, maps, principal
    │   ├── content.js         Hero, facilities, residential copy, admissions
    │   └── options.js         Notice/gallery/activity/disclosure taxonomies
    ├── context/AuthContext.jsx
    ├── hooks/usePageTitle.js  Client-side document.title
    ├── hooks/useFetch.js      GET wrapper with loading/error
    ├── utils/api.js           Axios instance (VITE_API_URL)
    ├── utils/academicYears.js
    ├── utils/notify.jsx
    ├── utils/confirmNote.js
    ├── components/
    │   ├── layout/            Layout, Header, TopBar, Footer
    │   ├── common/            Shared UI (PageHeader, SafeImage, etc.)
    │   └── results/MarksLists.jsx
    └── pages/
        ├── public/            Indexable-candidate pages
        ├── auth/Login.jsx
        ├── teacher/
        └── admin/
```

### 1.3 Backend tree (important files)

```text
backend/
├── server.js                  Express app, CORS, Helmet, route mounts, optional SPA serve
├── package.json
├── .env.example               Env names (and a commented MONGO_URI — treat as sensitive)
├── .gitignore                 Ignores .env, uploads/, dist/, node_modules
├── config/
│   ├── db.js                  mongoose.connect
│   ├── cloudinary.js          Upload/delete; folder prefix kmrs/
│   ├── paths.js               FRONTEND_DIST, UPLOADS_DIR
│   └── options.js             Category lists (must stay aligned with frontend)
├── middleware/
│   ├── auth.js                JWT authenticate / requireRole / optionalAuth
│   ├── upload.js              Multer memory + magic-byte checks (PDF/image, 5 MB)
│   └── errorHandler.js
├── models/                    User, Academics, Result, ClassResult, Photo, Notice,
│                              Disclosure, Enquiry, Activity
├── routes/                    See section 5
├── scripts/
│   ├── createAdmin.js         Interactive admin user creation
│   └── migrateUploads.js      Legacy local-upload migration to Cloudinary
└── utils/helpers.js
```

### 1.4 React entry points and architecture

**Confirmed bootstrap:**

1. `frontend/index.html` loads `/src/main.jsx`.
2. `frontend/src/main.jsx` mounts into `#root` with:
   - `BrowserRouter`
   - `AuthProvider` (`frontend/src/context/AuthContext.jsx`)
   - `App`
3. `frontend/src/App.jsx` defines all `<Routes>`.
4. **Every route**, including login, teacher, and admin, is nested under `<Layout />`.

**Layout always renders:** skip link, `TopBar`, `Header`, `<main id="main">` + `<Outlet />`, `Footer`, `PencilCursor`, `Splash`.

**Implication:** teacher/admin screens still show the public header/footer. SEO work on `Layout`/`Header`/`Footer` will affect dashboards unless those routes are split later. Do not remove `ProtectedRoute` or auth wiring while adding metadata.

**Rendering model:** client-side SPA. There is **no** SSR, SSG, or React Helmet. Google receives the same `index.html` for every path unless a host-level rewrite is configured. Per-page titles are set in the browser via `usePageTitle` after JS runs.

### 1.5 Configuration and deployment files

| File | Purpose |
|------|---------|
| `frontend/vite.config.js` | Dev port (`PORT`, default 5173). Proxies `/api` and `/uploads` to `SERVER_URL` (default `http://localhost:5000`). `SERVER_URL` and `PORT` are loaded with `loadEnv(..., '')` and are **not** injected into browser code. |
| `frontend/src/utils/api.js` | Browser API base: `import.meta.env.VITE_API_URL` or `'/api'`. |
| `frontend/index.html` | Only static meta tags in the whole app. |
| `backend/server.js` | Production: if `NODE_ENV=production` **and** `frontend/dist` exists, serves the SPA from the API host. Cloudflare Pages architecture would **not** use this path for the public site. |
| `backend/config/paths.js` | `FRONTEND_DIST` = `../frontend/dist`; leftover `UPLOADS_DIR` for local files. |

**Environment variable names (values omitted):**

Frontend (browser): `VITE_API_URL`  
Frontend (Vite config only): `SERVER_URL`, `PORT`  
Backend: `PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Caution:** `backend/.env.example` contains a **commented** `MONGO_URI` that looks like a real Atlas string. Do not copy it into docs, commits, or SEO files. If it was ever a live credential, rotate it. `frontend/.gitignore` does **not** ignore `.env` (unlike the backend). Treat that as a secrets-hygiene risk, not an SEO task.

---

## 2. Routes and pages

**Source of truth:** `frontend/src/App.jsx`  
**Router:** `react-router-dom` v7, `BrowserRouter` in `frontend/src/main.jsx`  
**Layout for all listed routes:** `frontend/src/components/layout/Layout.jsx`

**Index recommendation key:** “Should Google index?” is an **editorial recommendation** based on public vs staff content. The app currently has **no** `robots` meta, `robots.txt`, or sitemap, so crawlers are not instructed either way.

### 2.1 Public routes (no login)

| Path | Page component | File | Nested layout | Access | Content | Index? |
|------|----------------|------|---------------|--------|---------|--------|
| `/` | `Home` | `frontend/src/pages/public/Home.jsx` | Public `Layout` | Public | Mixed: static config + `/notices` + `/gallery` | **Yes** (primary) |
| `/about` | `About` | `frontend/src/pages/public/About.jsx` | Public `Layout` | Public | Static from `school.js` | **Yes** |
| `/staff` | `Staff` | `frontend/src/pages/public/Staff.jsx` | Public `Layout` | Public | Dynamic `/staff` + principal fallback from `school.js` | **Yes** |
| `/academics` | `Academics` | `frontend/src/pages/public/Academics.jsx` | Public `Layout` | Public | Static CBSE strip + dynamic `/academics`; some pending blocks | **Yes** |
| `/results` | `Results` | `frontend/src/pages/public/Results.jsx` | Public `Layout` | Public | Dynamic `/academics`, `/results`, `/class-results` | **Yes** (official results page) |
| `/admissions` | `Admissions` | `frontend/src/pages/public/Admissions.jsx` | Public `Layout` | Public | Static `content.js` + official govt link | **Yes** |
| `/residential-life` | `ResidentialLife` | `frontend/src/pages/public/ResidentialLife.jsx` | Public `Layout` | Public | Static `residentialTopics` | **Yes** |
| `/facilities` | `Facilities` | `frontend/src/pages/public/Facilities.jsx` | Public `Layout` | Public | Static `facilities` (`status === 'confirmed'` only) | **Yes** |
| `/student-life` | `StudentLife` | `frontend/src/pages/public/StudentLife.jsx` | Public `Layout` | Public | Dynamic `/activities`; empty-state pending copy | **Yes** if activities exist; still useful as campus-life URL |
| `/gallery` | `Gallery` | `frontend/src/pages/public/Gallery.jsx` | Public `Layout` | Public | Dynamic `/gallery` | **Yes** |
| `/notices` | `Notices` | `frontend/src/pages/public/Notices.jsx` | Public `Layout` | Public | Dynamic `/notices` | **Yes** |
| `/public-disclosure` | `PublicDisclosure` | `frontend/src/pages/public/PublicDisclosure.jsx` | Public `Layout` | Public | Static Section A + dynamic `/disclosures` | **Yes** (CBSE disclosure) |
| `/contact` | `Contact` | `frontend/src/pages/public/Contact.jsx` | Public `Layout` | Public | Static school facts + POST `/contact` | **Yes** |
| `*` | `NotFound` | `frontend/src/pages/public/NotFound.jsx` | Public `Layout` | Public | Static 404 | **No** (`noindex`) |

**Reusable components used widely on public pages:** `PageHeader`, `PendingInfo`, `SafeImage`, `Reveal`/`Tilt` (`Motion.jsx`), `NoticeItem`, `Lightbox`, `MarksLists`, `Doodles`.

### 2.2 Auth routes (public URLs, should not be indexed)

| Path | Component | File | Access | Content | Index? |
|------|-----------|------|--------|---------|--------|
| `/login` | `Login` `role="teacher"` | `frontend/src/pages/auth/Login.jsx` | Public form; posts `/auth/login` | Dynamic auth | **No** |
| `/admin/login` | `Login` `role="admin"` | same | Public form | Dynamic auth | **No** |

Signed-in users hitting these paths are redirected to `/teacher` or `/admin`.

### 2.3 Teacher routes (protected)

Wrapper: `ProtectedRoute role="teacher"` then `TeacherLayout` (`frontend/src/pages/teacher/TeacherLayout.jsx` → `DashboardShell`).

| Path | Component | File | Index? |
|------|-----------|------|--------|
| `/teacher` | `TeacherDashboard` | `frontend/src/pages/teacher/TeacherDashboard.jsx` | **No** |
| `/teacher/profile` | `TeacherProfile` | `frontend/src/pages/teacher/TeacherProfile.jsx` | **No** |
| `/teacher/classes` | `TeacherClasses` | `frontend/src/pages/teacher/TeacherClasses.jsx` | **No** |
| `/teacher/results` | `TeacherResults` | `frontend/src/pages/teacher/TeacherResults.jsx` | **No** |

### 2.4 Admin routes (protected)

Wrapper: `ProtectedRoute role="admin"` then `AdminLayout` (`frontend/src/pages/admin/AdminLayout.jsx` → `DashboardShell`).

| Path | Component | File | Index? |
|------|-----------|------|--------|
| `/admin` | `AdminDashboard` | `frontend/src/pages/admin/AdminDashboard.jsx` | **No** |
| `/admin/teachers` | `AdminTeachers` | `frontend/src/pages/admin/AdminTeachers.jsx` | **No** |
| `/admin/academics` | `AdminAcademics` | `frontend/src/pages/admin/AdminAcademics.jsx` | **No** |
| `/admin/results` | `AdminResults` | `frontend/src/pages/admin/AdminResults.jsx` | **No** |
| `/admin/marks-lists` | `AdminClassResults` | `frontend/src/pages/admin/AdminClassResults.jsx` | **No** |
| `/admin/gallery` | `AdminGallery` | `frontend/src/pages/admin/AdminGallery.jsx` | **No** |
| `/admin/activities` | `AdminActivities` | `frontend/src/pages/admin/AdminActivities.jsx` | **No** |
| `/admin/notices` | `AdminNotices` | `frontend/src/pages/admin/AdminNotices.jsx` | **No** |
| `/admin/disclosures` | `AdminDisclosures` | `frontend/src/pages/admin/AdminDisclosures.jsx` | **No** |
| `/admin/enquiries` | `AdminEnquiries` | `frontend/src/pages/admin/AdminEnquiries.jsx` | **No** |

**Do not invent routes.** There is no `/privacy`, `/sitemap`, `/blog`, `/news`, or per-notice detail route. Notices and results are list pages, not individual URLs.

**Nav vs router:** `navigation` in `frontend/src/config/school.js` matches the public paths above. Header also links `/login` and `/admissions`. Footer links a subset plus external CBSE/Odisha URLs.

---

## 3. Component dependency mapping

Global chrome (all routes):

```text
App.jsx
├── Routes → Layout.jsx
│   ├── TopBar.jsx
│   ├── Header.jsx
│   ├── <main> → page Outlet
│   ├── Footer.jsx
│   ├── PencilCursor.jsx
│   └── Splash.jsx
├── ToastContainer (react-toastify)
└── ConfirmHost.jsx
```

`AuthProvider` wraps `App` in `main.jsx` (not a visual child of pages).

### 3.1 Home (`Home.jsx`)

```text
Home.jsx
├── HeroSlider (local)
├── quick-links <nav>
├── glance <section>
├── Section "About the School"
├── Section "Admissions and Residential Life"
├── Section "Facilities"          ← facilities from content.js (confirmed, first 6)
├── Section "Latest Notices"
│   └── NoticeItem.jsx (per notice)
├── Section "Photo Gallery"
│   └── SafeImage.jsx
└── Section "Find Us"
```

Also uses `Reveal`, `Tilt` from `Motion.jsx`.

| Piece | Purpose | Text | Images | API | SEO |
|-------|---------|------|--------|-----|-----|
| `HeroSlider` | 3-slide welcome | Tagline, admissions, residential copy from `school` + local `slides` | `heroImage` from `content.js`; **empty `alt=""`** | None | **Multiple `<h1>`s** (one per slide, all in DOM). First H1 is the tagline, not the school name. |
| Glance | Facts | `glance` in `school.js` | None | None | Good keyword facts (Umerkote, CBSE, residential) in an `sr-only` H2 |
| Notices | Latest 4 | API titles | Optional PDF links | `GET /notices?limit=4` | Fresh content if notices exist |
| Gallery preview | Polaroid grid | Captions | Cloudinary `p.url` | `GET /gallery?limit=6` | Image SEO depends on `alt`/`caption` set in admin |
| Facilities teaser | Text cards | `content.js` | **No photos on Home** (photos only on Facilities page) | None | Keyword-rich titles |

### 3.2 About (`About.jsx`)

```text
About.jsx
├── PageHeader.jsx
├── key facts <dl>
├── on-this-page <nav>
└── Block sections (Reveal)
    └── PrincipalPhoto (local) → /images/principal-image.jpeg
```

Static. Principal photo has a descriptive `alt`. Vision/mission from `proposedContent` (`approved: true`). Strong on-page copy for “Kalinga Model Residential School”, Nabarangpur, ST & SC Development Department.

### 3.3 Staff (`Staff.jsx`)

```text
Staff.jsx
├── PageHeader.jsx
├── PrincipalBanner → Portrait
├── StaffGroup "Teaching Staff" → StaffCard → Portrait
└── StaffGroup "Non-Teaching Staff" → StaffCard → Portrait
```

API: `GET /staff`. Fallback principal from `school.principal`. Photos: teacher `profilePic` (Cloudinary) or config path. Good portrait alts (`Portrait of {name}`).

### 3.4 Academics (`Academics.jsx`)

```text
Academics.jsx
├── PageHeader.jsx
├── CBSE affiliation <dl>
├── Curriculum (static)
├── Examination Pattern (API)
├── Classes and Subjects (API)
├── Academic Calendar → PendingInfo.jsx
└── Learning Resources → PendingInfo.jsx
```

API: `GET /academics`. Internal link to `/results` and `/notices`.

### 3.5 Results (`Results.jsx`)

```text
Results.jsx
├── PageHeader.jsx
├── tabs (documents | marks)
├── filter form
├── PDF cards (API /results)
└── MarksLists.jsx → GET /class-results
```

Do **not** break filters, tabs, or PDF `fileUrl` links during SEO work. Student PDFs may contain personal marks; they are intentionally public once published.

### 3.6 Admissions (`Admissions.jsx`)

```text
Admissions.jsx
├── PageHeader.jsx
├── official-notice banner → school.links.admissions
├── Overview
├── Admission Process (ol)
├── Documents + Previous Cycle 2026–27
├── FAQ <details>
└── Official Contact
└── Pencil (Doodles.jsx)
```

Fully static. High SEO value for “KMRS admission” / “KMRSST”. Copy correctly defers dates to the Odisha government page.

### 3.7 Residential life (`ResidentialLife.jsx`)

```text
ResidentialLife.jsx
├── PageHeader.jsx
├── intro banner
└── residentialTopics cards (content.js)
```

Static long-form copy. Good for “residential school Umerkote”.

### 3.8 Facilities (`Facilities.jsx`)

```text
Facilities.jsx
├── PageHeader.jsx
└── confirmed facilities
    └── SafeImage.jsx (first photo)
```

Pending facilities (`library`, `science-laboratories`) are **hidden** (`status: 'pending'`). Do not display them in SEO copy until confirmed.

### 3.9 Student life (`StudentLife.jsx`)

```text
StudentLife.jsx
├── PageHeader.jsx
├── category chips (options.js activityCategories)
└── activity cards → SafeImage.jsx
```

API: `GET /activities`. `content.js` still exports unused `activities = []` and a duplicate `activityCategories`; the page uses `frontend/src/config/options.js`.

### 3.10 Gallery (`Gallery.jsx`)

```text
Gallery.jsx
├── PageHeader.jsx
├── category filters
├── thumbnail grid → SafeImage.jsx
└── Lightbox.jsx → SafeImage.jsx
```

API: `GET /gallery`. Admin must fill `alt` and `caption` (`AdminGallery.jsx`) or image SEO is weak.

### 3.11 Notices (`Notices.jsx`)

```text
Notices.jsx
├── PageHeader.jsx
├── filter form
└── notice list (H2 per title) + PDF links
```

API: `GET /notices` (full list, including expired unless filtered client-side). Home preview uses `limit` which **excludes expired** on the server.

### 3.12 Public disclosure (`PublicDisclosure.jsx`)

```text
PublicDisclosure.jsx
├── PageHeader.jsx
├── Section A (school.js)
└── Sections B–E (options.js disclosureSections + GET /disclosures)
    └── DocRow PDF links
```

### 3.13 Contact (`Contact.jsx`)

```text
Contact.jsx
├── PageHeader.jsx
├── InfoCard (address / phone / hours / maps)
└── enquiry form → POST /contact (honeypot field `website`)
```

### 3.14 Login, teacher, admin (do not index)

```text
Login.jsx
├── PageHeader.jsx
└── form → AuthContext.login → POST /auth/login

TeacherLayout.jsx / AdminLayout.jsx
└── DashboardShell.jsx
    └── Outlet → dashboard pages
```

Teacher/admin pages mutate notices, gallery, results, staff photos, academics, and enquiries. **SEO agents must not change API payloads, auth checks, upload fields, or Cloudinary wiring.**

### 3.15 Shared component notes

| File | Purpose | SEO / caution |
|------|---------|----------------|
| `PageHeader.jsx` | Breadcrumb + **single H1** + subtitle | Primary H1 for almost every public page except Home |
| `SafeImage.jsx` | Lazy load, fade-in, fallback | Uses `alt` prop; empty alt if caller passes none |
| `Header.jsx` | Logo + `navigation` | Logo `alt=""` `aria-hidden`; name is adjacent text |
| `Footer.jsx` | Internal + official external links | Multiple H2s (“Quick Links”, school name, etc.) |
| `usePageTitle.js` | `{page} \| Kalinga Model Residential School, Umerkote` | Does **not** update meta description, canonical, or OG |
| `Splash.jsx` | Homepage splash once per session | Logo `alt=""`; `aria-hidden` overlay |

---

## 4. Existing SEO audit

### 4.1 What exists (confirmed)

**`frontend/index.html` (global, all routes):**

- `lang="en"`
- `meta charset`, viewport
- `meta name="description"` — school name, Umerkote, Nabarangpur, Odisha, CBSE, affiliation **1520301**, ST & SC Development Department
- `theme-color` `#14402c` (note: Tailwind “forest” in CSS is purple-toned, not the same as this green)
- `og:title` — “Kalinga Model Residential School, Umerkote”
- `og:description` — government residential school, Nabarangpur, affiliation number
- `og:type` — `website`
- Default `<title>` same as og:title
- Google Fonts preconnect + Noto Sans, Noto Sans Oriya, Source Serif 4

**Runtime titles:** `usePageTitle` in public/auth/layout files. Home uses `usePageTitle('')` so the title stays the default school name (good).

**Semantic HTML (partially strong):** `<header>`, `<nav>`, `<main id="main">`, `<footer>`, skip link, breadcrumbs, `<address>`, `<time>` on notices, `role="note"` on admissions disclaimer.

**Internal linking:** Header nav, footer quick links, Home CTAs, About → disclosure, Academics → results/notices, Staff → `/about#principal`.

**Image alts (mixed):** Facilities photos in `content.js` have descriptive alts. Principal photo has a descriptive alt. Hero images and logos use empty alt.

### 4.2 Missing (confirmed)

| Item | Status |
|------|--------|
| `frontend/public/robots.txt` | **Missing** |
| `frontend/public/sitemap.xml` | **Missing** |
| Canonical `<link rel="canonical">` | **Missing** |
| `meta name="robots"` (index/noindex) | **Missing** |
| `og:url`, `og:image`, `og:locale`, `og:site_name` | **Missing** |
| Twitter / X card tags | **Missing** |
| JSON-LD / `application/ld+json` | **Missing** (no School/EducationalOrganization/FAQPage/BreadcrumbList) |
| Favicon (`favicon.ico`, `apple-touch-icon`, `link rel="icon"`) | **Missing** (`icons.svg` exists but is not linked) |
| Per-page meta descriptions | **Missing** (only the single HTML description) |
| `react-helmet-async` or equivalent | **Not in package.json** |
| Cloudflare `_redirects` / `_headers` for SPA | **Missing** |
| `hreflang` / Oriya locale tags | **Missing** (Oriya font is loaded for glyphs, `lang` is `en` only) |

### 4.3 Incorrect or risky for SEO

1. **SPA indexing:** crawlers that do not run JS see one title and one description for every URL. Even Google’s JS rendering will still lack unique descriptions, canonicals, and structured data.
2. **Home heading:** each hero slide renders an `<h1>`. Three H1s exist in the DOM. The visible H1 is often the tagline “Learning Today. Building Tomorrow.” rather than the school name.
3. **Hero `alt=""`** on campus photographs used as LCP candidates.
4. **Logo hidden from images search** (`alt=""` + `aria-hidden`).
5. **No `noindex` on** `/login`, `/admin/login`, `/teacher/*`, `/admin/*`, 404.
6. **`websiteAddress`** in `school.js` is `https://kmrs-umerkote.pages.dev`. If a custom domain is added later, this string, OG URLs, sitemap, and canonicals must change together.
7. **Maps URL** is a Google search query, not a confirmed lat/long Place (`school.js` comment: “until exact coordinates are confirmed”).
8. **Facility alt typo:** “Drnking water…” in `content.js`.
9. **Folder names with spaces** (`computer lab`, `drinking water`, `vegetable garden`) produce uglier URLs (`%20`). Home already encodes spaces for hero `src`.
10. **Reveal animation** starts at `opacity: 0`. If a crawler snapshots before intersection, body copy could be invisible. Reduced-motion users get `is-visible` immediately; crawlers may not.
11. **Cloudflare SPA fallback:** without a rewrite of `/*` → `/index.html`, deep links (`/admissions`) can 404 at the CDN even though they work in Vite.
12. **Footer H2s** repeat “Quick Links” pattern; not wrong, but compete with page H2s.

### 4.4 Heading hierarchy snapshot (public)

| Page | H1 source | Notes |
|------|-----------|--------|
| Home | Hero slide titles (3× H1) | Should be one H1 including school name |
| Most inner pages | `PageHeader` title | Clean single H1 |
| Staff | PageHeader H1 + principal H2 + staff names H3 | Good |
| Notices / Results documents | PageHeader H1 + each item H2 | Good for keyword-rich notice titles |
| 404 | Local H1 “Page not found” | Fine; add noindex |

### 4.5 React dynamic metadata

`usePageTitle` only sets `document.title`. It does not:

- change the description meta
- set canonical
- set OG/Twitter
- inject JSON-LD

Crawlers and social scrapers that read raw HTML will always see `index.html` tags.

---

## 5. API and dynamic content

### 5.1 Client service

- **File:** `frontend/src/utils/api.js`
- **Client:** Axios instance, `baseURL = VITE_API_URL || '/api'`
- **Auth:** JWT in `localStorage` key `kmrs_token`, attached as `Authorization: Bearer …`
- **`fileUrl()`:** identity function (legacy `/uploads/...` comment). Live files are Cloudinary `https://res.cloudinary.com/...` URLs stored on documents.

**Hook:** `frontend/src/hooks/useFetch.js` — GET, loading, error, `reload`.

### 5.2 Backend mount (`backend/server.js`)

| Mount | File |
|-------|------|
| `GET /api/health` | inline |
| `/api/auth` | `backend/routes/auth.js` |
| `/api/teachers` | `backend/routes/teachers.js` |
| `/api/academics` | `backend/routes/academics.js` |
| `/api/results` | `backend/routes/results.js` |
| `/api/class-results` | `backend/routes/classResults.js` |
| `/api/gallery` | `backend/routes/gallery.js` |
| `/api/notices` | `backend/routes/notices.js` |
| `/api/disclosures` | `backend/routes/disclosures.js` |
| `/api/activities` | `backend/routes/activities.js` |
| `/api/contact` | `backend/routes/contact.js` |
| `/api/admin` | `backend/routes/admin.js` |
| `/api/staff` | `backend/routes/staff.js` |

Global: Helmet CSP (allows `https://res.cloudinary.com` images and Google Fonts), CORS from `CLIENT_ORIGIN` (comma-separated), JSON 100kb, rate limit 600/15min on `/api`. Login limited to 10/15min. Contact limited to 5/hour.

### 5.3 Public GETs vs mutations (do not break)

**Safe to call from public pages (no auth):**

| Method | Path | Used by |
|--------|------|---------|
| GET | `/academics` | Academics, Results filters, TeacherClasses, AdminClassResults |
| GET | `/results` | Results (query: className, exam, academicYear) |
| GET | `/class-results` | MarksLists |
| GET | `/gallery` | Home, Gallery, AdminGallery |
| GET | `/notices` | Home (`limit=4`, server hides expired), Notices, AdminNotices |
| GET | `/disclosures` | PublicDisclosure, AdminDisclosures |
| GET | `/activities` | StudentLife, AdminActivities |
| GET | `/staff` | Staff |
| POST | `/contact` | Contact form |

**Auth required (sensitive — do not alter for SEO):**

| Area | Endpoints (prefix `/api`) |
|------|---------------------------|
| Auth | POST `/auth/login`, GET `/auth/me`, PUT `/auth/change-password` |
| Teachers self | GET/PUT `/teachers/me`, PUT `/teachers/me/photo`, DELETE `/teachers/me/photo`, PUT `/teachers/me/classes` |
| Teachers admin | GET/POST `/teachers`, PUT `/teachers/:id`, PUT `/teachers/:id/password`, DELETE `/teachers/:id` |
| Academics write | PUT `/academics` |
| Results write | GET `/results/mine`, POST `/results`, DELETE `/results/:id` |
| Marks lists write | POST `/class-results`, DELETE `/class-results/:id` |
| Gallery write | POST `/gallery`, PUT `/gallery/:id`, DELETE `/gallery/:id` |
| Notices write | POST `/notices`, DELETE `/notices/:id` |
| Disclosures write | POST `/disclosures`, DELETE `/disclosures/:id` |
| Activities write | POST/PUT/DELETE `/activities` |
| Enquiries admin | GET `/contact`, PUT `/contact/:id/read`, DELETE `/contact/:id` |
| Stats | GET `/admin/stats` |

Uploads go to Cloudinary folder `kmrs/{gallery|notices|...}`. Images get `f_auto,q_auto,w_1200,c_limit` on the Photo virtual `url`.

### 5.4 Loading and error states

Public list pages generally show:

- `role="status"` loading text
- `role="alert"` error from `errorMessage()`
- `PendingInfo` or a forest-tinted empty message when the array is empty

Home notices empty state points to `school.links.admissions` (department site), not only the local notices page.

**Backend-dependent public content:** notices, results PDFs, marks lists, gallery, staff directory, academics classes/subjects/exams, student activities, disclosure PDFs. If Render or MongoDB is down, those sections show errors; static pages (About, Admissions, Residential Life, Facilities photos) still render.

### 5.5 School information sources

| Information | Source |
|-------------|--------|
| Name, address, phone, email, affiliation, principal message | `frontend/src/config/school.js` |
| Facilities + hero + admissions FAQ | `frontend/src/config/content.js` |
| Staff directory | Mongo `User` via `/staff` (public fields only: no email/phone) |
| Notices / gallery / results / activities / disclosures | Mongo + Cloudinary |
| Vision/mission | `proposedContent` in `school.js` |

---

## 6. Assets and media

Static files live under `frontend/public/` and are requested as root URLs (`/images/...`). The indexer did not list binary images via glob (likely ignore rules), but each path below **was opened and confirmed to exist**.

**No videos** are referenced in JS/CSS/HTML.

**No self-hosted font files.** Fonts: Google Fonts in `index.html` (Noto Sans, Noto Sans Oriya, Source Serif 4) plus Caveat in `index.css` (`font-hand`). Icons are inline CSS/SVG doodles (`Doodles.jsx`), not an icon font. `frontend/public/icons.svg` is the Vite starter asset and is **not** linked as a favicon.

### 6.1 Logo and brand

| Path | Usage | Format | SEO |
|------|--------|--------|-----|
| `frontend/public/images/KMRS-logo.png` | `Header.jsx` Wordmark, `Splash.jsx` | PNG, circular school emblem (“Kalinga Model Residential School”, Estd 2018) | Header: `alt=""` `aria-hidden`. Splash: `alt=""`. **Should be favicon + `og:image` source.** |

Favicon files: **missing**.

### 6.2 Principal

| Path | Usage | SEO |
|------|--------|-----|
| `frontend/public/images/principal-image.jpeg` | `school.principal.photo`, About `PrincipalPhoto`, Staff fallback | About alt: “Portrait of Asit Kumar Mahanty, Principal of KMRS Umerkote”. Comment in About also mentions `principal.jpg`, which is **not** the file in use. |

### 6.3 Hero (Home slider)

Configured in `heroImage` (`content.js`). Home encodes spaces to `%20`.

| Path | Slide (by array index) | Alt in hero |
|------|------------------------|-------------|
| `frontend/public/images/classrooms/classroom-1.jpeg` | 0 Welcome | empty |
| `frontend/public/images/sports/sports-2.jpeg` | 1 Admissions | empty |
| `frontend/public/images/computer lab/cslab-1.jpeg` | 2 Residential | empty |

These are full-bleed LCP images (min-height 460–600px, Ken Burns scale). They are **likely large unoptimized JPEGs**. Cloudinary is **not** used for these static public files.

### 6.4 Facilities / hostel / campus (static)

All listed on Facilities when `status: 'confirmed'`. Alts are in `content.js`.

| Path | Facility id | Alt (as coded) |
|------|-------------|----------------|
| `/images/classrooms/classroom-1.jpeg` | classrooms | Classroom at Kalinga Model Residential School |
| `/images/computer lab/cslab-1.jpeg` | computer-laboratory | Computer laboratory at … |
| `/images/sports/sports-2.jpeg` | sports-playground | Sports and playground facilities at … |
| `/images/dining/dining-1.jpg` | dining-area | Dining Area at … |
| `/images/assembly/assembly-2.jpg` | assembly-multipurpose | Assembly and Multipurpose Spaces at … |
| `/images/hostel/hostel-2.jpeg` | boys-hostel | Boys' Hostel at … |
| `/images/drinking water/water-1.jpeg` | sanitation-drinking-water | **“Drnking water…” (typo)** |
| `/images/uniform/uniform-1.jpeg` | uniform-bedsheets-blankets facilities | Uniforms, Bedsheets and Blankets distribution… |
| `/images/hostel/hostel-1.jpeg` | recreational-facilities | Girls watching television together in the school hostel |
| `/images/vegetable garden/garden-1.jpeg` | vegetable-garden | Vegetable garden at … |
| `/images/hostel/vegetable-1.jpeg` | food-storage | Vegetables stored in the school hostel storeroom |

Pending (no photos, hidden): Library, Science Laboratories.

**Filename quality:** mostly descriptive (`classroom-1`, `cslab-1`, `hostel-2`). Weaknesses: numbered suffixes (`-1`, `-2`) without location keywords; directories with spaces; `cslab` abbreviation; `KMRS-logo.png` is good.

**Assumption (file weight):** photographs are camera JPEGs used at full viewport width. They are the main performance risk vs Cloudinary gallery images (already transformed to width 1200). Exact byte sizes were not measured in this pass.

### 6.5 Dynamic media (Cloudinary)

Admin/teacher uploads: gallery photos, activity photos, staff/profile photos, notice PDFs, result PDFs, marks-list PDFs, disclosure PDFs. URLs are absolute `res.cloudinary.com`. Helmet on the **API** allows that host in `img-src`. The **Cloudflare Pages HTML** has no CSP of its own in-repo.

Gallery alt text is optional in the schema (`Photo.alt` default `''`). `AdminGallery.jsx` has an alt field — SEO depends on operators filling it.

---

## 7. Dependencies and deployment

### 7.1 Frontend (`frontend/package.json`)

| Package | Declared version | Role |
|---------|------------------|------|
| react / react-dom | ^19.3.1 | UI |
| react-router-dom | ^7.18.4 | Client routing |
| axios | ^1.20.0 | API |
| react-toastify | ^11.2.0 | Toasts (dashboards) |
| vite | ^8.3.4 | Bundler |
| @vitejs/plugin-react | ^6.1.2 | React plugin |
| tailwindcss | ^3.4.19 | CSS |
| babel-plugin-react-compiler | ^1.0.0 | React Compiler (dev) |

**SEO-related packages: none** (no `react-helmet-async`, no `sitemap`, no prerender plugin).

**Scripts:** `dev` → `vite`; `build` → `vite build`; `preview` → `vite preview`; `lint` → `eslint .`

**Output directory:** Vite default `frontend/dist`.

### 7.2 Backend (`backend/package.json`)

express ^4.22.3, mongoose ^9.11.3, cors, helmet, express-rate-limit, jsonwebtoken, bcryptjs, multer, cloudinary, dotenv.  
Scripts: `start` → `node server.js`; `dev` → nodemon; `create-admin`; `migrate-uploads`.

### 7.3 Known vs verified hosting

| Layer | Stated | Verified in repo |
|-------|--------|------------------|
| Frontend: Cloudflare Pages (free) | User-provided | **Partial:** `school.websiteAddress = 'https://kmrs-umerkote.pages.dev'` in `school.js`. **No** Cloudflare config files. |
| Backend: Render (free) | User-provided | **Assumption:** Express + `PORT` + Mongo URI pattern matches Render. **No** `render.yaml`. |
| Database: MongoDB Atlas | User-provided | **Partial:** `mongoose.connect(MONGO_URI)`; `.env.example` shows `mongodb+srv` comment; `createAdmin.js` mentions Atlas DNS. |
| Media: Cloudinary | — | **Confirmed** in `backend/config/cloudinary.js` and upload routes. |

**Frontend ↔ backend:** production SPA should set `VITE_API_URL` to the Render API origin including `/api` (exact URL not stored in source). `CLIENT_ORIGIN` on the API must include `https://kmrs-umerkote.pages.dev` and later the custom domain. Locally, Vite proxies `/api` so `VITE_API_URL` can be omitted.

**Asset hosting:** Vite `public/` files are copied to Pages CDN. User-generated files are on Cloudinary, not on Pages.

**SPA on Cloudflare Pages (recommended, currently missing):** `public/_redirects` with `/* /index.html 200`, and build settings:

- Root: `frontend` (or set output to `frontend/dist`)
- Build: `npm run build`
- Output: `dist`

**Alternative:** `backend/server.js` can serve `frontend/dist` when `NODE_ENV=production`. That would put the site on Render, not Pages. The `pages.dev` URL in config indicates Pages is the intended public host.

---

## 8. Claude’s file reference guide

Use this when implementing SEO. Change the **left column** files; avoid the **sensitive** files unless the task explicitly requires them.

### 8.1 Global metadata and HTML

| Task | File |
|------|------|
| Default title, description, OG, font links, lang | `frontend/index.html` |
| Favicon / apple icon | add under `frontend/public/` and link from `index.html` |
| Client title pattern | `frontend/src/hooks/usePageTitle.js` |
| School legal name, NAP, affiliation, site URL | `frontend/src/config/school.js` |
| Theme / heading CSS | `frontend/src/index.css`, `frontend/tailwind.config.js` |

### 8.2 Router and layouts

| Task | File |
|------|------|
| Add/remove routes | `frontend/src/App.jsx` only |
| Router provider | `frontend/src/main.jsx` |
| Chrome / skip link / main landmark | `frontend/src/components/layout/Layout.jsx` |
| Nav labels and URLs | `frontend/src/config/school.js` (`navigation`) **and** `Header.jsx` / `Footer.jsx` |
| Auth gate | `frontend/src/components/common/ProtectedRoute.jsx` |

### 8.3 Public pages (on-page SEO)

| URL | File |
|-----|------|
| `/` | `frontend/src/pages/public/Home.jsx` |
| `/about` | `frontend/src/pages/public/About.jsx` |
| `/staff` | `frontend/src/pages/public/Staff.jsx` |
| `/academics` | `frontend/src/pages/public/Academics.jsx` |
| `/results` | `frontend/src/pages/public/Results.jsx` |
| `/admissions` | `frontend/src/pages/public/Admissions.jsx` |
| `/residential-life` | `frontend/src/pages/public/ResidentialLife.jsx` |
| `/facilities` | `frontend/src/pages/public/Facilities.jsx` |
| `/student-life` | `frontend/src/pages/public/StudentLife.jsx` |
| `/gallery` | `frontend/src/pages/public/Gallery.jsx` |
| `/notices` | `frontend/src/pages/public/Notices.jsx` |
| `/public-disclosure` | `frontend/src/pages/public/PublicDisclosure.jsx` |
| `/contact` | `frontend/src/pages/public/Contact.jsx` |
| 404 | `frontend/src/pages/public/NotFound.jsx` |
| Inner-page H1/breadcrumbs | `frontend/src/components/common/PageHeader.jsx` |

Static copy/images for home/facilities/admissions/residential: `frontend/src/config/content.js`.

### 8.4 Sitemap, robots, Cloudflare

| Task | Where |
|------|--------|
| `robots.txt` | **Create** `frontend/public/robots.txt` (copied to dist root) |
| `sitemap.xml` | **Create** `frontend/public/sitemap.xml` (static public URLs only) |
| SPA fallback | **Create** `frontend/public/_redirects` |
| Security/cache headers | **Create** `frontend/public/_headers` if needed |
| Pages project settings | Cloudflare dashboard (not in repo) |

### 8.5 Images

| Task | File |
|------|------|
| Hero sources | `content.js` `heroImage` + `Home.jsx` `<img>` |
| Facility photos/alts | `content.js` `facilities` + `Facilities.jsx` + `SafeImage.jsx` |
| Logo | `Header.jsx`, `Splash.jsx`, `/images/KMRS-logo.png` |
| Principal | `school.js` + `About.jsx` |
| Gallery rendering | `Gallery.jsx`, `Home.jsx`, `Lightbox.jsx`, `SafeImage.jsx` |
| Gallery alt editing | `AdminGallery.jsx` + `PUT /api/gallery/:id` — **sensitive** |

### 8.6 Structured data (not implemented)

Natural injection points:

- Global School/EducationalOrganization JSON-LD: `index.html` or a new component mounted in `Layout.jsx` (public only).
- FAQPage: `Admissions.jsx` (`admissionFaqs`).
- BreadcrumbList: `PageHeader.jsx`.
- ImageObject: gallery — only if alts exist.

Prefer a small `Seo.jsx` used by public pages, **not** inside admin/teacher outlets. If using `Layout`, skip JSON-LD when `pathname` starts with `/admin`, `/teacher`, or is `/login`.

### 8.7 Sensitive areas — do not break

| Area | Files | Why |
|------|-------|-----|
| Authentication | `AuthContext.jsx`, `Login.jsx`, `ProtectedRoute.jsx`, `backend/routes/auth.js`, `backend/middleware/auth.js` | JWT, role split, lockout limiter |
| Admin shell | `AdminLayout.jsx`, all `pages/admin/*` | Publishing pipeline |
| Teacher shell | `TeacherLayout.jsx`, `pages/teacher/*` | PII (phone, age, gender) and result uploads |
| API client | `utils/api.js` | Token header and base URL |
| Notices | `AdminNotices.jsx`, `backend/routes/notices.js` | PDF uploads, expiry rules |
| Results / marks | `TeacherResults.jsx`, `AdminResults.jsx`, `AdminClassResults.jsx`, `Results.jsx`, `MarksLists.jsx`, `backend/routes/results.js`, `classResults.js` | Student assessment files |
| Gallery uploads | `AdminGallery.jsx`, `backend/routes/gallery.js`, `cloudinary.js`, `upload.js` | File validation + Cloudinary cleanup |
| Activities | `AdminActivities.jsx`, `activities.js` | Photo + alt required on create |
| Disclosures | `AdminDisclosures.jsx`, `disclosures.js`, `options.js` (both apps) | CBSE document taxonomy must stay in sync |
| Enquiries | `Contact.jsx`, `AdminEnquiries.jsx`, `contact.js` | Honeypot `website`, PII in Mongo |
| Staff public vs private | `Staff.jsx` vs `TeacherProfile.jsx` vs `backend/routes/staff.js` | Public staff must not expose email/phone |
| Academics write | `AdminAcademics.jsx`, `academics.js` | Public class/subject lists |

**Safe SEO edits** are mostly: `index.html`, new `public/robots.txt` / `sitemap.xml` / `_redirects`, `usePageTitle.js` (extend carefully), public page headings/alts, `school.js` / `content.js` copy, optional new SEO component imported only from public pages.

---

## 9. Final SEO recommendations

Target queries: **KMRS Umerkote**, **KMRS official website**, **Kalinga Model Residential School Umerkote**, **Kalinga Model Residential School Nabarangpur**, **KMRS admission**, **KMRS results**, **Residential school Umerkote**.

The site already has accurate, conservative copy and real affiliation data. Discoverability is blocked mainly by **SPA technical SEO**, **missing crawl files**, **weak Home H1/alts**, and **no structured data** — not by a lack of on-page topics.

### Priority 0 — Do not harm

- Keep public vs admin/teacher separation.
- Do not noindex `/`, `/admissions`, `/results`, `/public-disclosure`.
- Do not invent admission dates; keep the official Odisha link as source of truth (`school.links.admissions`).
- Do not publish pending facilities (library, science labs).

### Priority 1 — Crawl, index, SPA hosting (technical SEO)

1. Add `frontend/public/robots.txt`:
   - `Allow: /`
   - `Disallow: /login`, `/admin`, `/teacher`
   - `Sitemap: https://kmrs-umerkote.pages.dev/sitemap.xml` (update with custom domain later)
2. Add `frontend/public/sitemap.xml` listing only public GET pages in section 2.1 (exclude login, dashboards, 404). Use `school.websiteAddress` as the host.
3. Add Cloudflare Pages `_redirects`: `/* /index.html 200` so `/admissions` etc. do not CDN-404.
4. Submit the sitemap in Google Search Console for the `pages.dev` property (and later the custom domain).
5. Confirm `CLIENT_ORIGIN` includes the Pages URL so public API calls from the browser succeed (otherwise notices/gallery/staff look empty to users and crawlers).

### Priority 2 — Unique metadata (indexing quality)

Because this is a CSR app, pick **one** approach:

- **Minimum:** unique `document.title` (already mostly done) + unique `meta description` / canonical / robots updated in a `useEffect` (same hook or a new `useSeo`) on each public page. Social crawlers may still miss this.
- **Better for Google and WhatsApp/Facebook:** prerender or a small static shell per route (Cloudflare Pages + a prerender plugin, or `vite-plugin-ssr` / later migration). Not present today.
- **Must-have robots:** `noindex, nofollow` on login, teacher, admin, 404.

Suggested title pattern (already close):  
`{Intent} | Kalinga Model Residential School, Umerkote (KMRS)`  
Home should keep the full school name **and** “KMRS Umerkote”.

Suggested Home description already exists in `index.html`; clone unique 150–160 character descriptions for Admissions, Results, About, Contact, Public Disclosure.

Add `link rel="canonical"` per public path using `school.websiteAddress`.

### Priority 3 — On-page (Home and admissions)

1. **Single H1 on Home** containing “Kalinga Model Residential School, Umerkote” (tagline can be H2 or a paragraph).
2. Visible text “KMRS” near the H1 (shortName already exists in config).
3. Hero image alts that describe the photo **and** the school (do not stuff keywords).
4. Logo: meaningful alt or keep hidden but add a real favicon from `KMRS-logo.png`.
5. Fix “Drnking” typo; consider renaming folders to `computer-lab` etc. **only** if all `content.js` / Home references update together.
6. Admissions: already FAQ-shaped; wrap with FAQ JSON-LD from `admissionFaqs`.
7. Results: keep H1 “Examination Results”; in intro text include “KMRS Umerkote results” once in natural language.
8. Ensure About/Contact/Footer NAP (name, address, phone) stays consistent — it already does via `school.js`.

### Priority 4 — Structured data (local + school)

Implement JSON-LD (public pages only):

- `EducationalOrganization` or `School`: name, alternateName `KMRS Umerkote`, `url`, `logo`, address (Umerkote, Nabarangpur, Odisha, 764073), `telephone`, `email`, `sameAs` (CBSE record URL), `foundingDate` 2018, `identifier` affiliation 1520301 / school code 17471.
- `WebSite` with `url`.
- `BreadcrumbList` from `PageHeader`.
- `FAQPage` on `/admissions`.
- Optional `ImageGallery` only when photos have alts.

Do **not** emit `AggregateRating` or fake geo coordinates. Map search URL is not a Place ID.

### Priority 5 — Images and performance

1. Compress and resize static JPEGs used in the hero (target WebP/AVIF + width ~1600px). These are the LCP element.
2. Give the first hero image `fetchpriority="high"` and drop `loading="lazy"` (hero currently has neither lazy nor priority; Facilities uses `SafeImage` lazy — good).
3. Require gallery `alt` in admin UI (already collected; consider blocking publish if empty — product change, not strictly SEO).
4. Add `width`/`height` where known to reduce CLS (logo already has 56×56).
5. Keep Cloudinary transforms; do not proxy gallery bytes through Render.

### Priority 6 — Local SEO and citations

- Keep “Umerkote”, “Nabarangpur”, “Odisha”, “Kalinga Model Residential School” in title, H1, and first paragraph of Home, About, Contact.
- Google Business Profile (off-site) should use the **same** NAP as `school.js`.
- Prefer a confirmed Maps place / coordinates in `mapUrl` when the school provides them.
- School code `17471` is in `TopBar.jsx` and Public Disclosure; useful for CBSE-related queries.

### Priority 7 — Custom domain migration (future)

When moving off `kmrs-umerkote.pages.dev`:

1. Change `school.websiteAddress`.
2. Rebuild sitemap, robots Sitemap line, canonicals, JSON-LD `url`/`logo`.
3. Add the new origin to `CLIENT_ORIGIN`.
4. Set Cloudflare SSL and a 301 from `pages.dev` → custom domain (Search Console change of address).
5. Update OG `og:url` / `og:image` absolute URLs.
6. Do not leave mixed hosts in PDF/Cloudinary links (those can stay on Cloudinary).

### Suggested implementation order for a later agent

1. `frontend/public/_redirects` + `robots.txt` + `sitemap.xml`
2. Favicon + `og:image` pointing at the logo (or a dedicated 1200×630 share card)
3. `noindex` for auth/dashboard/404
4. Home H1 + hero alts
5. Per-page description/canonical hook on public pages only
6. JSON-LD School + FAQ
7. Image compression for `/images/**`
8. Search Console verification

### Out of scope / non-goals

- Rewriting teacher/admin UX
- Changing JWT, multer, or Cloudinary folder names
- Indexing individual notice or result PDFs as HTML pages (they are files on Cloudinary; list pages are the indexable URLs)
- Claiming a custom domain in code before DNS exists

---

## Appendix A — Public URL checklist for sitemap

Include:

- `/`
- `/about`
- `/staff`
- `/academics`
- `/results`
- `/admissions`
- `/residential-life`
- `/facilities`
- `/student-life`
- `/gallery`
- `/notices`
- `/public-disclosure`
- `/contact`

Exclude: `/login`, `/admin`, `/admin/*`, `/teacher`, `/teacher/*`, unmatched 404s.

## Appendix B — Accuracy notes

- Routes were read from `App.jsx`, not inferred from filenames.
- Images in section 6 were opened individually; glob tools did not enumerate `public/images` (ignore rules). There may be additional unused files in those folders that are not referenced in JS.
- Byte sizes of JPEGs were not measured.
- Live Cloudflare/Render dashboards were not accessed.
- `backend/.env` and `frontend/.env` values were not copied into this document.

---

*End of analysis. Application source files were not modified; only this documentation file was created.*
