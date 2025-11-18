// dbContext.js or dexieDB.js
import Dexie from "dexie";

export const db = new Dexie("TimesheetDB");

db.version(1).stores({
  timesheets: "id, date, start_time, end_time, hours, task, created_at, synced, supabase_id"
});

export async function markSynced(id, supabase_id) {
  await db.timesheets.update(id, { synced: 1, supabase_id });
}