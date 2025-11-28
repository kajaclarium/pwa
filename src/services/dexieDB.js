import Dexie from "dexie";

export const db = new Dexie("TimesheetDB");
export const cloneDb = new Dexie("TimesheetDBClone");

db.version(1).stores({
  timesheets: "id, date, start_time, end_time, hours, task, created_at, synced"
});

cloneDb.version(1).stores({
  timesheets: "id, date, start_time, end_time, hours, task, created_at, synced"
});

export async function markSynced(id) {
  await db.timesheets.update(id, { synced: 1 });
  const row = await db.timesheets.get(id);
  await cloneDb.timesheets.put(row);
}
