# 🍷 VinoLog

*A mobile-first social wine tracking application built with Next.js 14, Supabase, and AI.*

VinoLog allows users to track their wine journey, follow friends, and discover new favorites through an interactive map and intelligent tasting notes. Unlike standard trackers, it focuses on education and social connection, featuring a "Wine Guide" for beginners and sommelier-style AI generation.

**Live Demo:** [https://vino-log.vercel.app](https://vino-log.vercel.app)

<img width="2303" height="1371" alt="image" src="https://github.com/user-attachments/assets/293d521e-c7b8-4e85-95e0-1e69f23fe782" />

## ✨ Key Features
* **Smart Logging:** Record wines with an intelligent form that features "Smart Location" autocomplete (OpenStreetMap) and auto-saves coordinates.
* **AI Sommelier:** Integrated OpenAI to generate professional, punchy tasting notes and educational content based on simple user keywords.
* **Interactive Maps:** Custom Leaflet map integration that auto-zooms to user's wine locations, converting raw addresses into precise pins.
* **Social Network:** Full social graph implementation (Follow/Unfollow) with a real-time activity feed to see what friends are drinking.
* **Progressive Web App (PWA):** Configured with a web manifest to install and run as a native full-screen app on iOS and Android.

## 🧠 Technical Challenges & Solutions
* **Handling AI Latency:** Generating dynamic tasting notes via the OpenAI API introduced a slight network delay. To prevent user drop-off and UI freezing, I implemented custom Tailwind CSS skeleton loaders (`animate-pulse`) to maintain UI layout and provide visual feedback while data is fetched.
* **Dynamic Image Constraints:** To handle unpredictable user-uploaded image sizes in the social feed, I engineered a responsive aspect-ratio container system (`aspect-[4/3]`, `object-cover`) to ensure uniform cropping and a polished, native-app feel.
* **Geospatial Coordinate Mapping:** Translating raw user text into map markers required building a custom geocoding pipeline using OpenStreetMap data to convert queries into lat/lng data, securely storing it in PostgreSQL.

## 🛠️ Tech Stack
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS & Shadcn/UI
* **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
* **AI:** OpenAI API
* **Maps:** Leaflet & OpenStreetMap (Nominatim API)
* **Deployment:** Vercel

## ⚙️ Database Schema (Supabase)
This project uses Supabase for the backend. Below are the key table extensions required to run the app:
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
ALTER TABLE wines ADD COLUMN type text;
ALTER TABLE wines ADD COLUMN status text;
ALTER TABLE wines ADD COLUMN image_url text;

```

## 🚀 Getting Started

1. Clone the repository: `git clone https://github.com/arcemichaelr/vino-log.git`
2. Install dependencies: `npm install`
3. Set up Environment Variables in a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key

```


4. Run the development server: `npm run dev`

## 👨‍💻 Author

**Michael Arce**

* [LinkedIn](https://www.linkedin.com/in/michael-arce-9a4825231/)
* [GitHub](https://github.com/arcemichaelr)
