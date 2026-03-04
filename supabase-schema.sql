-- Camping Trip Planner - Supabase Schema

-- Enums
CREATE TYPE category AS ENUM (
  'kitchen', 'food', 'gear', 'shoes', 'clothing', 'toiletries', 'personal', 'activities', 'medicine', 'other'
);

CREATE TYPE family_member AS ENUM (
  'Ritchie', 'Emily', 'Ada', 'Roxy', 'Kids', 'Adults', 'Girls'
);

-- Items bank (reusable across trips)
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

-- Trips
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

-- Packing list items (snapshot of item data per trip)
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

-- Updated_at trigger
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

-- RLS (permissive, single user, no auth)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON trips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON packing_list_items FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for packing list
ALTER PUBLICATION supabase_realtime ADD TABLE packing_list_items;
