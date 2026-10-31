// TEST DATA ONLY. Mock tables for development until the backend is wired.
// Never import this file from a component or a page. lib/data is the only
// consumer, so swapping in the real API changes only the lib/data folder.
// Remove before production.

export type MockRow = Record<string, unknown> & { id: string };

// One array per resource name. Phase D adds tables as resources are defined.
export const MOCK_TABLES: Record<string, MockRow[]> = {};
