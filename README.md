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

## Next Steps

- [ ] Set up Supabase database
- [ ] Implement authentication
- [ ] Connect forms to backend
- [ ] Add wine image uploads
- [ ] Build social features (follow, like, comment)

## License

MIT