# Pavilion

Pavilion is a real-time fantasy cricket auction app for all-time Test cricket players. It works like a live IPL-style player auction — friends join a room, take turns nominating players from history, and bid against each other with a shared virtual purse — but the player pool spans the entire history of Test cricket (Bradman to Bumrah) instead of a single league season. There's no real money, no match simulation, and no external sports API: it's a pure auction game built on top of Supabase's realtime database.

## Tech stack

- **Framework:** Next.js 14 (App Router, TypeScript, strict mode)
- **Database, realtime & session cookies:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Styling:** Tailwind CSS only — no component libraries
- **Package manager:** npm

## Local setup

1. **Clone and install**

   ```bash
   git clone <your-repo-url>
   cd pavilion
   npm install
   ```

2. **Create a Supabase project**

   Go to [supabase.com](https://supabase.com), create a new project, and wait for it to finish provisioning.

3. **Run the schema**

   Open the Supabase project's **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the `rooms`, `participants`, `auction_state`, and `bids` tables and enables Realtime on all four.

4. **Fill in your environment variables**

   Copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

   Then open `.env.local` and fill in the two values from your Supabase project's **Settings → API** page:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## How to play

1. **Create a room** — enter a display name and hit "Create Room." You'll land in a lobby with a 6-character room code.
2. **Share the code** — send the room code or the "Copy invite link" URL to friends. Each friend enters the code and their own display name to join.
3. **Start the auction** — once at least 2 players have joined, the host hits "Start Auction." Turn order is shuffled randomly.
4. **Nominate & bid** — players take turns nominating an unsold cricketer. Once nominated, everyone has 15 seconds to bid using the quick bid chips. Every bid resets the clock to 15 seconds. You can't bid so much that you wouldn't have enough purse left to fill your remaining squad slots at minimum price.
5. **Sold or unsold** — when the clock runs out, the player is sold to the highest bidder (or goes unsold if nobody bid), and the turn passes to the next nominator.
6. **Final squads** — once every participant has filled their squad, the room moves to a final squads screen showing everyone's roster, total spend, and remaining purse.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project's **Settings → Environment Variables**.
4. Deploy. Vercel will build and host the Next.js app automatically on every push to `main`.

## Customising the player pool

All players live in [`data/players.json`](data/players.json) as a flat array of objects:

```json
{
  "id": "sachin-tendulkar",
  "name": "Sachin Tendulkar",
  "country": "India",
  "era": "1989–2013",
  "role": "Batter",
  "base_price": 200,
  "tier": "Legend"
}
```

- `id` must be a unique kebab-case slug.
- `role` must be one of `Batter`, `Bowler`, `All-rounder`, `Wicket-keeper`.
- `tier` (`Legend`, `Great`, `Good`) is a display label; `base_price` (in Lakhs) drives auction economics — 200 for Legends, 100 for Greats, 50 for Good players.
- To add a new country's flag emoji to player cards, extend the `countryFlag` map in [`lib/utils.ts`](lib/utils.ts).

Add, remove, or edit entries freely — the app reads this file directly at build/runtime with no database sync required.
