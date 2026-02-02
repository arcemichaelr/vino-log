# 🍷 Vino Log

A mobile-first social wine tracking app built with Next.js, TypeScript, Tailwind CSS, and Shadcn/UI.

## Features

- **Landing Page**: Beautiful welcome screen with login and sign-up options
- **Dashboard**: View your wine log feed with recent entries
- **Log Wine**: Add new wine entries with details like name, vintage, type, rating, and tasting notes

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Database**: Supabase (to be configured)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
vino-log/
├── app/                # Next.js App Router pages
│   ├── dashboard/     # Dashboard page
│   ├── log-wine/      # Log wine form page
│   ├── login/         # Login page
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Landing page
│   └── globals.css    # Global styles
├── components/        # React components
│   └── ui/           # Shadcn/UI components
├── lib/              # Utility functions
└── public/           # Static assets
```

## Database

### Wishlist / status column

The **Want to Try** (wishlist) feature uses a `status` column on the `wines` table:

- `consumed` — logged wines (dashboard, "Been" count)
- `wishlist` — want-to-try entries (wishlist page, "Want to Try" count)

If you don’t have it yet, add it:

```sql
ALTER TABLE wines ADD COLUMN IF NOT EXISTS status text;
-- Optional: backfill existing rows as consumed
UPDATE wines SET status = 'consumed' WHERE status IS NULL;
```

### Follows table (Search & Follow)

The **Search** and **Follow** features use a `follows` table:

- `follower_id` (uuid) — the user who follows
- `following_id` (uuid) — the user being followed

Create it and add RLS as needed:

```sql
CREATE TABLE IF NOT EXISTS follows (
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);
-- RLS: allow select/insert/delete for authenticated users on their own follower_id
```

### Storage bucket (image uploads)

The **ImageUpload** component (Edit Profile avatar, Log Wine photo) uses Supabase Storage:

- **Bucket name:** `images`
- **Path format:** `uploads/{userId}/{timestamp}-{filename}`

In the Supabase dashboard:

1. Create a storage bucket named `images`.
2. Set the bucket to **Public** (or use RLS policies) so `getPublicUrl()` works.
3. Add a policy so authenticated users can upload under `uploads/{auth.uid()}/` and read objects as needed.

### wines.image_url

The **Log Wine** form saves an optional photo URL to the `wines` table:

```sql
ALTER TABLE wines ADD COLUMN IF NOT EXISTS image_url text;
```

### wines.lat / wines.lng

The **Location** autocomplete (Log Wine form) saves coordinates when a place is selected:

```sql
ALTER TABLE wines ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE wines ADD COLUMN IF NOT EXISTS lng double precision;
```

### Feed (Following tab)

The **Following** feed joins `wines` with `profiles` so each card can show who logged the wine. Ensure a foreign key exists from `wines.user_id` to `profiles.id` (or `auth.users.id`). Then `.select('*, profiles(username, avatar_url, full_name)')` will work.

**Reminder — run this SQL so the Following tab can show friends’ wines:**  
Without a policy that allows reading other users’ wines, the Following tab will be empty. In Supabase SQL Editor, add a policy that allows authenticated users to read wines (e.g. public read for the feed):

```sql
-- Allow authenticated users to read all wines (for Following feed).
-- Adjust to your security needs (e.g. restrict to only followed users via a policy).
CREATE POLICY "Public read wines for feed"
ON wines FOR SELECT
TO authenticated
USING (true);
```

### Rank persistence (optional RPC)

The dashboard saves drag-and-drop order via a debounced save. The app calls Supabase RPC `update_wine_ranks` with payload `[{ id, rank }, ...]`. If that function does not exist, the app falls back to per-row updates.

To use a single RPC (e.g. for transactions), create the function in SQL:

```sql
CREATE OR REPLACE FUNCTION update_wine_ranks(updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  FOR i IN 0..jsonb_array_length(updates)-1 LOOP
    UPDATE wines
    SET rank = (updates->i->>'rank')::int
    WHERE id = ((updates->i->>'id')::bigint)
      AND auth.uid() = user_id;
  END LOOP;
END;
$$;
```

## Next Steps

- [ ] Set up Supabase database
- [ ] Implement authentication
- [ ] Connect forms to backend
- [ ] Add wine image uploads
- [ ] Build social features (follow, like, comment)

## License

MIT