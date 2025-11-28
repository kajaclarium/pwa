import { supabase } from "./supabaseClient";
import { db, cloneDb, markSynced } from "./dexieDB";

export async function runFullSync() {
  console.log("🔄 Starting Full Sync…");

  if (!navigator.onLine) {
    console.log("❌ Offline - Cannot sync");
    return;
  }

  // 1️⃣ Upload unsynced rows
  const unsynced = await db.timesheets.where("synced").equals(0).toArray();
  console.log("📤 Uploading unsynced rows:", unsynced.length);

  for (const row of unsynced) {
    const { data, error } = await supabase
      .from("timesheet")
      .upsert({
        id: row.id, // use same local id
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
      await markSynced(row.id);
      console.log("✔ Copied to cloneDb:", row.id);
    } else if (error) {
      console.error("❌ Upload error for row", row.id, error);
    }
  }

  // 2️⃣ Clear primary DB AFTER syncing
  await db.timesheets.clear();
  console.log("🧹 Primary DB cleared");

  // 3️⃣ Fetch fresh Supabase data
  const { data: serverData, error: fetchError } = await supabase
    .from("timesheet")
    .select("*")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("❌ Fetch error:", fetchError);
    return;
  }

  console.log("📥 Supabase returned:", serverData.length);

  // 4️⃣ Save server data into cloneDb (avoid duplicates)
  for (const r of serverData) {
    const exists = await cloneDb.timesheets.where("id").equals(r.id).count();
    if (exists === 0) {
      await cloneDb.timesheets.add({
        id: r.id,
        date: r.date,
        start_time: r.start_time,
        end_time: r.end_time,
        hours: r.hours,
        task: r.task,
        created_at: r.created_at,
        synced: 1,
      });
      console.log("⬆ Added fresh server row to cloneDb:", r.id);
    } else {
      console.log("🚫 Duplicate skipped:", r.id);
    }
  }

  console.log("✅ Full Sync Completed!");
}
