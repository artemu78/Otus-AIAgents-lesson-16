# Requirements Document

## Introduction

A standalone page in the existing React frontend that displays the `goods` table from Supabase. The page subscribes to Supabase Realtime events (INSERT, UPDATE, DELETE) so the displayed data updates live without a manual refresh. The page is read-only — no editing, creating, or deleting of goods is required.

## Glossary

- **GoodsPage**: The new standalone React page/component that renders the goods table.
- **GoodsTable**: The HTML table element inside GoodsPage that displays goods rows.
- **RealtimeSubscription**: The Supabase Realtime channel that listens for changes on the `goods` table.
- **SupabaseClient**: The `@supabase/supabase-js` client instance used to query data and manage realtime subscriptions.
- **RLS**: Row Level Security — Supabase policy layer that controls which rows a user can read.
- **Good**: A single row from the `goods` table with fields: `id`, `title`, `description`, `quantity`, `cost`, `created_at`.

---

## Requirements

### Requirement 1: Display Goods Table

**User Story:** As a visitor, I want to see a table of all goods, so that I can browse available inventory at a glance.

#### Acceptance Criteria

1. WHEN GoodsPage mounts, THE SupabaseClient SHALL fetch all rows from the `goods` table ordered by `created_at` descending.
2. THE GoodsTable SHALL display the following columns for each Good: `title`, `description`, `quantity`, `cost`, and `created_at`.
3. WHILE data is being fetched, THE GoodsPage SHALL display a loading indicator.
4. IF the fetch returns zero rows, THEN THE GoodsPage SHALL display an empty-state message indicating no goods are available.
5. IF the fetch fails, THEN THE GoodsPage SHALL display an error message describing the failure.
6. THE GoodsPage SHALL format `created_at` values as a human-readable local date and time string.
7. THE GoodsPage SHALL display `cost` values with a currency symbol prefix (e.g. `$`), and display `—` when `cost` is null.
8. THE GoodsPage SHALL display `—` when `description` is null or empty.

---

### Requirement 2: Realtime Updates

**User Story:** As a visitor, I want the goods table to update automatically when data changes, so that I always see the current inventory without refreshing.

#### Acceptance Criteria

1. WHEN GoodsPage mounts, THE RealtimeSubscription SHALL subscribe to INSERT, UPDATE, and DELETE events on the `goods` table.
2. WHEN an INSERT event is received, THE GoodsTable SHALL add the new Good to the displayed list without a full re-fetch.
3. WHEN an UPDATE event is received, THE GoodsTable SHALL replace the existing Good row with the updated values.
4. WHEN a DELETE event is received, THE GoodsTable SHALL remove the corresponding Good row from the displayed list.
5. WHEN GoodsPage unmounts, THE RealtimeSubscription SHALL be unsubscribed and removed to prevent memory leaks.
6. IF the RealtimeSubscription loses connection, THEN THE GoodsPage SHALL display a reconnecting status indicator.

---

### Requirement 3: Routing and Navigation

**User Story:** As a visitor, I want to navigate to the goods page via a dedicated URL, so that I can bookmark or share a direct link.

#### Acceptance Criteria

1. THE GoodsPage SHALL be accessible at a dedicated route path (e.g. `/goods`).
2. THE App SHALL provide a navigation link to GoodsPage that is visible from the main page.
3. WHEN a user navigates away from GoodsPage, THE RealtimeSubscription SHALL be cleaned up before the component unmounts.

---

### Requirement 4: RLS Compatibility

**User Story:** As a developer, I want the goods page to respect Supabase RLS policies, so that only authorised data is displayed.

#### Acceptance Criteria

1. THE SupabaseClient SHALL use the anonymous key when fetching goods, allowing RLS policies to determine row visibility.
2. IF RLS denies access to all rows, THEN THE GoodsPage SHALL display the empty-state message rather than an error.
3. THE GoodsPage SHALL NOT expose the Supabase service role key or bypass RLS in any way.
