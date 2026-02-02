# 🍷 VinoLog

**A mobile-first social wine tracking application built with Next.js 14, Supabase, and AI.**

VinoLog allows users to track their wine journey, follow friends, and discover new favorites through an interactive map and intelligent tasting notes. Unlike standard trackers, it focuses on education and social connection, featuring a "Wine Guide" for beginners and sommelier-style AI generation.

## 🚀 Key Features

* **🍷 Smart Logging:** Record wines with an intelligent form that features "Smart Location" autocomplete (OpenStreetMap) and auto-saves coordinates.
* **🤖 AI Sommelier:** Integrated OpenAI to generate professional, punchy tasting notes and educational content based on simple user keywords.
* **🌍 Interactive Maps:** Custom Leaflet map integration that auto-zooms to user's wine locations, converting raw addresses into precise pins.
* **🤝 Social Network:** Full social graph implementation (Follow/Unfollow) with a real-time activity feed to see what friends are drinking.
* **🎓 Education Hub:** Built-in "Wine Guide" teaching the "4 S's of Tasting" and wine varietals to help beginners learn as they log.
* **📊 Personal Dashboard:** Gamified profile stats tracking "Wines Tasted" and "Want to Try" lists.
* **📸 Media:** Secure image uploads for wine labels using Supabase Storage.

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS & Shadcn/UI
* **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
* **AI:** OpenAI API (GPT-4o mini)
* **Maps:** Leaflet & OpenStreetMap (Nominatim API)
* **Deployment:** Vercel

## ⚙️ Database Schema (Supabase)

This project uses Supabase for the backend. Below are the key table extensions required to run the app.

```sql
-- 1. Enable geospatial coordinates
ALTER TABLE wines ADD COLUMN lat double precision;
ALTER TABLE wines ADD COLUMN lng double precision;

-- 2. Add social graph
CREATE TABLE IF NOT EXISTS follows (
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- 3. Add wine metadata
ALTER TABLE wines ADD COLUMN type text; -- Red, White, etc.
ALTER TABLE wines ADD COLUMN status text; -- 'consumed' or 'wishlist'
ALTER TABLE wines ADD COLUMN image_url text;
```

## 🚀 Getting Started

1. **Clone the repository:**

```bash
git clone https://github.com/arcemichaelr/vino-log.git
cd vino-log
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up Environment Variables:** Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
```

4. **Run the development server:**

```bash
npm run dev
```

Open http://localhost:3000 with your browser to see the result.

## 📄 License

MIT © [Michael Arce]
