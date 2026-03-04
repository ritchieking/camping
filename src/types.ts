export type Category =
  | 'kitchen'
  | 'food'
  | 'gear'
  | 'shoes'
  | 'clothing'
  | 'toiletries'
  | 'personal'
  | 'activities'
  | 'medicine'
  | 'other'

export type FamilyMember = 'Ritchie' | 'Emily' | 'Ada' | 'Roxy' | 'Kids' | 'Adults' | 'Girls'

export type Tag =
  | 'Essential'
  | 'Cold weather'
  | 'Warm weather'
  | 'Swim'
  | 'Hiking'
  | 'Workout'
  | 'Long car rides'
  | 'Rain'
  | 'Van gear'
  | 'Tent camping'
  | 'Gray box'

export interface Item {
  id: string
  name: string
  category: Category
  assignee: FamilyMember | null
  number: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  destination: string
  start_date: string
  end_date: string
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PackingListItem {
  id: string
  trip_id: string
  item_id: string
  is_packed: boolean
  packed_by: FamilyMember | null
  packed_at: string | null
  name: string
  category: Category
  assignee: FamilyMember | null
  number: number
  tags: string[]
}

export const CATEGORIES: Category[] = [
  'kitchen', 'food', 'gear', 'shoes', 'clothing', 'toiletries', 'personal', 'activities', 'medicine', 'other',
]

export const FAMILY_MEMBERS: FamilyMember[] = [
  'Ritchie', 'Emily', 'Ada', 'Roxy', 'Kids', 'Adults', 'Girls',
]

export const TAGS: Tag[] = [
  'Essential', 'Cold weather', 'Warm weather', 'Swim', 'Hiking', 'Workout', 'Long car rides', 'Rain', 'Van gear', 'Tent camping', 'Gray box',
]
