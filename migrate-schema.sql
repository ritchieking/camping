-- Migration: drop everything and recreate with updated schema
-- Run this in the Supabase SQL Editor

-- 1. Remove from realtime publication first
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE packing_list_items;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 2. Drop tables
DROP TABLE IF EXISTS packing_list_items CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS items CASCADE;

-- 3. Drop enums
DROP TYPE IF EXISTS category CASCADE;
DROP TYPE IF EXISTS family_member CASCADE;

-- 4. Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at CASCADE;

-- 5. Recreate everything (copied from supabase-schema.sql)

CREATE TYPE category AS ENUM (
  'kitchen', 'food', 'gear', 'shoes', 'clothing', 'toiletries', 'personal', 'activities', 'medicine', 'other'
);

CREATE TYPE family_member AS ENUM (
  'Ritchie', 'Emily', 'Ada', 'Roxy', 'Kids', 'Adults', 'Girls'
);

CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category category NOT NULL DEFAULT 'other',
  assignee family_member,
  number INT NOT NULL DEFAULT 1,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE packing_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  is_packed BOOLEAN NOT NULL DEFAULT false,
  packed_by family_member,
  packed_at TIMESTAMPTZ,
  name TEXT NOT NULL,
  category category NOT NULL,
  assignee family_member,
  number INT NOT NULL DEFAULT 1,
  tags TEXT[] NOT NULL DEFAULT '{}',
  UNIQUE(trip_id, item_id)
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON packing_list_items FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE packing_list_items;
