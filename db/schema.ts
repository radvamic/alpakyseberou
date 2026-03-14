import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// RSVP
// ---------------------------------------------------------------------------
export const rsvps = sqliteTable('rsvps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').default(''),
  attending: integer('attending', { mode: 'boolean' }).notNull(),
  guests: integer('guests').default(1),
  children: integer('children', { mode: 'boolean' }).default(false),
  childrenCount: integer('children_count').default(0),
  menuPreference: text('menu_preference').default(''),
  allergies: text('allergies').default(''),
  songRequest: text('song_request').default(''),
  songNever: text('song_never').default(''),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ---------------------------------------------------------------------------
// Guestbook
// ---------------------------------------------------------------------------
export const guestbookEntries = sqliteTable('guestbook_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  message: text('message').notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ---------------------------------------------------------------------------
// Photos (shared for guestbook + wedding gallery)
// ---------------------------------------------------------------------------
export const photos = sqliteTable('photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['guestbook', 'wedding'] }).notNull(),
  guestbookEntryId: integer('guestbook_entry_id').references(
    () => guestbookEntries.id,
    { onDelete: 'cascade' },
  ),
  name: text('name').default('Anonym'),
  url: text('url').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ---------------------------------------------------------------------------
// Accommodations (room types)
// ---------------------------------------------------------------------------
export const accommodations = sqliteTable('accommodations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').default(''),
  capacity: integer('capacity').notNull(),
  pricePerNight: real('price_per_night').notNull(),
  totalUnits: integer('total_units').notNull(),
  imageUrl: text('image_url').default(''),
});

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accommodationId: integer('accommodation_id')
    .references(() => accommodations.id)
    .notNull(),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  checkIn: text('check_in').notNull(),
  checkOut: text('check_out').notNull(),
  guests: integer('guests').notNull(),
  totalPrice: real('total_price').notNull(),
  status: text('status', {
    enum: ['pending', 'paid', 'cancelled'],
  })
    .notNull()
    .default('pending'),
  variableSymbol: text('variable_symbol'),
  notes: text('notes').default(''),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ---------------------------------------------------------------------------
// Questionnaires
// ---------------------------------------------------------------------------
export const questionnaires = sqliteTable('questionnaires', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').default(''),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionnaireId: integer('questionnaire_id')
    .references(() => questionnaires.id, { onDelete: 'cascade' })
    .notNull(),
  text: text('text').notNull(),
  type: text('type', {
    enum: ['text', 'select', 'multiselect', 'boolean', 'number'],
  }).notNull(),
  options: text('options').default(''),
  required: integer('required', { mode: 'boolean' }).default(false),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const questionnaireResponses = sqliteTable('questionnaire_responses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionnaireId: integer('questionnaire_id')
    .references(() => questionnaires.id, { onDelete: 'cascade' })
    .notNull(),
  respondentName: text('respondent_name').notNull(),
  respondentEmail: text('respondent_email').default(''),
  answers: text('answers').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ---------------------------------------------------------------------------
// AI Photo Booth
// ---------------------------------------------------------------------------
export const photoboothPhotos = sqliteTable('photobooth_photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userName: text('user_name').notNull(),
  originalPhotoUrl: text('original_photo_url').notNull(),
  generatedPhotoUrl: text('generated_photo_url').notNull(),
  category: text('category').notNull(),
  motifId: text('motif_id').notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
