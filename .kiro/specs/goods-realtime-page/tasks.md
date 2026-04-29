# Implementation Plan: Goods Realtime Page

## Overview

Incrementally build the goods realtime page by first wiring up infrastructure (Supabase client, router), then the data hook with pure mutation helpers, then the UI components, and finally integrating everything into the app.

## Tasks

- [x] 1. Install dependencies and create the Supabase client
  - Run `npm install react-router-dom` and `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event fast-check jsdom` in `frontend/`
  - Create `frontend/src/lib/supabaseClient.js` that calls `createClient` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  - Add a `test` script to `frontend/package.json` using Vitest and configure `vitest.config.js` with jsdom environment
  - _Requirements: 4.1, 4.3_

- [x] 2. Implement pure state-mutation helpers and the `useGoods` hook
  - [x] 2.1 Create `frontend/src/hooks/useGoods.js`
    - Export pure helpers `applyInsert(list, newGood)`, `applyUpdate(list, updatedGood)`, `applyDelete(list, id)` from the same file
    - Implement the `useGoods()` hook: initial fetch with `select('*').order('created_at', { ascending: false })`, realtime channel subscription for INSERT/UPDATE/DELETE, `realtimeStatus` tracking (`connecting | connected | reconnecting | disconnected`), and cleanup on unmount
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.2 Write property test for INSERT mutation helper (Property 5)
    - **Property 5: INSERT event adds the Good to the list**
    - **Validates: Requirements 2.2**

  - [ ]* 2.3 Write property test for UPDATE mutation helper (Property 6)
    - **Property 6: UPDATE event replaces the existing Good**
    - **Validates: Requirements 2.3**

  - [ ]* 2.4 Write property test for DELETE mutation helper (Property 7)
    - **Property 7: DELETE event removes the Good from the list**
    - **Validates: Requirements 2.4**

  - [ ]* 2.5 Write unit tests for `useGoods` hook
    - Test that `supabase.channel().on()` is called for INSERT, UPDATE, DELETE on mount
    - Test that `supabase.removeChannel()` is called on unmount
    - _Requirements: 2.1, 2.5_

- [ ] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement formatting utilities and `GoodsTable` component
  - [ ] 4.1 Create `frontend/src/utils/formatters.js`
    - Export `formatDate(iso)` using `new Date(value).toLocaleString()`
    - Export `formatCost(value)` returning `$X.XX` or `—` when null
    - Export `formatDescription(value)` returning value or `—` when null/empty
    - _Requirements: 1.6, 1.7, 1.8_

  - [ ]* 4.2 Write property test for date formatter (Property 3)
    - **Property 3: Date formatter produces human-readable output**
    - **Validates: Requirements 1.6**

  - [ ]* 4.3 Write property test for cost and nullable field formatting (Property 4)
    - **Property 4: Cost and nullable field formatting**
    - **Validates: Requirements 1.7, 1.8**

  - [ ] 4.4 Create `frontend/src/components/GoodsTable.jsx`
    - Render an HTML `<table>` with columns: Title, Description, Quantity, Cost, Created At
    - Apply `formatDate`, `formatCost`, `formatDescription` to each row
    - _Requirements: 1.2, 1.6, 1.7, 1.8_

  - [ ]* 4.5 Write property test for GoodsTable column rendering (Property 1)
    - **Property 1: All required columns are rendered for every Good**
    - **Validates: Requirements 1.2**

- [ ] 5. Implement `StatusBanner` component and `GoodsPage`
  - [ ] 5.1 Create `frontend/src/components/StatusBanner.jsx`
    - Accept props `{ loading, error, isEmpty, realtimeStatus }`
    - Render loading spinner when `loading` is true
    - Render error message when `error` is non-null
    - Render empty-state message when `isEmpty` is true
    - Render reconnecting indicator when `realtimeStatus === 'reconnecting'`
    - Return `null` when everything is normal and goods are present
    - _Requirements: 1.3, 1.4, 1.5, 2.6_

  - [ ]* 5.2 Write property test for error surfacing (Property 2)
    - **Property 2: Error messages are always surfaced**
    - **Validates: Requirements 1.5**

  - [ ] 5.3 Create `frontend/src/components/GoodsPage.jsx`
    - Use `useGoods()` hook internally
    - Render `StatusBanner` and `GoodsTable`
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.6_

  - [ ]* 5.4 Write unit tests for `GoodsPage`
    - Test loading indicator renders when `loading: true`
    - Test empty-state message renders when `goods: []`
    - Test reconnecting banner renders when `realtimeStatus: 'reconnecting'`
    - _Requirements: 1.3, 1.4, 2.6_

- [ ] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Wire routing and navigation into `App.jsx`
  - Wrap existing app content in `<BrowserRouter>` and `<Routes>`
  - Add `<Route path="/" element={<existing content>} />` and `<Route path="/goods" element={<GoodsPage />} />`
  - Add a nav link to `/goods` in the `Header` component (or inline in `App.jsx`)
  - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 7.1 Write unit tests for routing
    - Test that `/goods` route renders `GoodsPage`
    - Test that nav link to `/goods` is present on the main page
    - _Requirements: 3.1, 3.2_

- [ ] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Pure helpers (`applyInsert`, `applyUpdate`, `applyDelete`) are exported from `useGoods.js` so they can be tested without mocking Supabase
- Property tests use `fast-check` with a minimum of 100 iterations each
- The anonymous key is the only key used; the service role key must never appear in frontend code
