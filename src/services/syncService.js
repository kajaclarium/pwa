import { supabase } from "./supabaseClient";
import { db, cloneDb, markSynced } from "./dexieDB";

export async function runFullSync() {
  console.log("🔄 Starting Full Sync…");

  if (!navigator.onLine) {
    console.log("❌ Offline - Cannot sync");
    return;
  }

  /* --------------------------
      1️⃣ Upload unsynced rows
  --------------------------- */
  const unsynced = await db.timesheets.where("synced").equals(0).toArray();
  console.log("📤 Uploading unsynced rows:", unsynced.length);

  for (const row of unsynced) {
    const { data, error } = await supabase
      .from("timesheet")
      .upsert({
        id: row.supabase_id ?? undefined,
        date: row.date,
        start_time: row.start_time,
        end_time: row.end_time,
        hours: row.hours,
        task: row.task,
        created_at: row.created_at,
      })
      .select("*")
      .single();

    if (!error && data) {
      console.log("✔ Uploaded & synced row:", row.id);

      // Save Supabase ID + mark synced
      await db.timesheets.update(row.id, { synced: 1, supabase_id: data.id });

      // Insert into cloneDb
      await cloneDb.timesheets.put({
        ...row,
        id: data.id,        // use Supabase ID
        supabase_id: data.id,
        synced: 1
      });

      console.log("✔ Copied to cloneDb:", data.id);
    }
  }

  /* --------------------------
      2️⃣ Clear primary DB AFTER syncing
  --------------------------- */
  await db.timesheets.clear();
  console.log("🧹 Primary DB cleared");

  /* --------------------------
      3️⃣ Fetch fresh Supabase data
  --------------------------- */
  const { data: serverData } = await supabase
    .from("timesheet")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("📥 Supabase returned:", serverData.length);

  /* --------------------------
      4️⃣ Save server data into cloneDb
         (avoid duplicates)
  --------------------------- */
  for (const r of serverData) {
    const exists = await cloneDb.timesheets
      .where("supabase_id")
      .equals(r.id)
      .count();

    if (exists === 0) {
      await cloneDb.timesheets.add({
        id: r.id,
        date: r.date,
        start_time: r.start_time,
        end_time: r.end_time,
        hours: r.hours,
        task: r.task,
        created_at: r.created_at,
        supabase_id: r.id,
        synced: 1,
      });

      console.log("⬆ Added fresh server row to cloneDb:", r.id);
    } else {
      console.log("🚫 Duplicate skipped:", r.id);
    }
  }

  console.log("✅ Full Sync Completed!");
}
