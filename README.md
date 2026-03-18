# TWN Human-in-the-Loop Dashboard
### Trinidad Wiseman — Entity Matching System

A full Next.js 14 dashboard for reviewing AI entity matches with human oversight.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → Open http://localhost:3000
```

## 🏗 Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with NavBar
│   ├── page.tsx            # Redirects to /admin
│   ├── globals.css         # TWN design tokens + animations
│   ├── admin/
│   │   └── page.tsx        # Admin dashboard (stats, charts)
│   ├── review/
│   │   └── page.tsx        # Review queue (entity comparison)
│   ├── analytics/
│   │   └── page.tsx        # Analytics (performance, matrix)
│   └── management/
│       └── page.tsx        # Management (users, settings, log)
├── components/
│   ├── layout/
│   │   └── NavBar.tsx      # Sticky nav with active routing
│   └── ui/
│       └── index.tsx       # Badge, Button, Card, Toggle, etc.
└── lib/
    └── data.ts             # Mock data + TypeScript types
```

---

## 🎨 TWN Brand Colors

| Token          | Hex       | Usage                    |
|----------------|-----------|--------------------------|
| `--coral`      | `#E8452A` | Primary CTA, active nav  |
| `--teal`       | `#1AA39A` | Secondary accent, success|
| `--teal-light` | `#22C4BA` | Chart lines, badges      |
| `--amber`      | `#F0A500` | Warning, pending states  |
| `--navy`       | `#1A2B4A` | Card surfaces            |
| `--bg`         | `#0F1C32` | Page background          |

---

## 📦 Key Dependencies

- **Next.js 14** — App Router
- **Recharts** — Line chart, Pie/Donut chart
- **Lucide React** — Icons
- **Tailwind CSS** — Utility styling
- **DM Sans + Syne** — Typography (Google Fonts)

---

## 🔗 Pages

| Route          | Page             |
|----------------|------------------|
| `/`            | → redirects to `/admin` |
| `/admin`       | Admin Dashboard  |
| `/review`      | Review Queue     |
| `/analytics`   | Analytics        |
| `/management`  | Management       |

---

Built for Trinidad Wiseman OÜ — Human-in-the-Loop AI project.
