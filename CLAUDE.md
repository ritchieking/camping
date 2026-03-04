# Camping Trip Planner - Development Guide

## Package Manager

- Always use `rpm` instead of `npm` (it is an alias for npm).
- Always use `rpx` instead of `npx` (it is an alias for npx).

## Project Overview

Family camping trip packing list PWA. Single user, no authentication. Manage a reusable item bank, create trips, and build packing lists with real-time sync across devices.

## Tech Stack

- React (Vite) + TypeScript, configured as a PWA
- Supabase (Postgres + REST API + Realtime) — client at `src/lib/supabase.ts`
- Tailwind CSS — dark mode only (`bg-slate-950` base)
- React Router — bottom tab nav (Trip / Items / Past Trips)

## Key Files

- `src/types.ts` — all TypeScript types (snake_case matching Postgres columns)
- `src/lib/hooks.ts` — data hooks (`useItems`, `useActiveTrip`, `useTrips`, `useTripDetail`, `usePackingList`)
- `src/lib/supabase.ts` — Supabase client init
- `src/components/Layout.tsx` — bottom tab bar shell
- `src/pages/` — CurrentTripPage, ItemListPage, PastTripsPage, TripDetailPage
- `src/components/` — PackingList, AddItemsModal, ItemForm, TripForm
- `supabase-schema.sql` — full DB schema (items, trips, packing_list_items)
- `seed-data.sql` — 40 starter items

## Design Principles

- Dark mode only, mobile-first
- No React Context — hooks only
- No generic wrapper components (Button, Badge, etc.) — use Tailwind classes directly
- Snake_case types matching Postgres columns
- Single hooks.ts file for all data logic
- Supabase Realtime for packing list sync (replaces WebSocket)

## DB Tables

`items` — reusable item bank
`trips` — camping trips (one active at a time)
`packing_list_items` — snapshot of items per trip, with pack status
