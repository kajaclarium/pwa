import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { db } from "../services/dexieDB";


export default function TimesheetView({submitTimesheet,syncTimesheets}) {
  const [data, setData] = useState([...[]]);


  async function loadData() {
    console.log("🔵 Checking online status:", navigator.onLine);

    try {
      if (navigator.onLine) {
        console.log("🌐 Online → Fetching from Supabase…");

        const { data: supaData, error } = await supabase
          .from("timesheet")
          .select("*")
          .order("created_at", { ascending: false });

        console.log("🌐 Supabase data:", supaData);
        console.log("🌐 Supabase error:", error);

        // If Supabase returns data → Use it
        if (supaData && supaData.length > 0) {
          setData(supaData);
          return;
        }

        console.log("⚠️ Supabase empty → Trying IndexedDB…");
      }

      // Fallback for offline OR empty Supabase
      const offlineData = await db.timesheets.toArray();
      console.log("📦 IndexedDB (Dexie) data:", offlineData);

      setData(offlineData);
    } catch (err) {
      console.error("❌ loadData error:", err);
    }
  }

  useEffect(() => {
    loadData();
  }, [submitTimesheet,syncTimesheets]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Timesheet Records</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm -collapse">
          <thead>
            <tr className="bg-gray-200">
              {["Date", "Start Time", "End Time", "Hours", "Task","Created At"].map((h) => (
                <th key={h} className="p-2">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-2 text-center">
                  No records found
                </td>
              </tr>
            )}

            {data.map((r) => (
              <tr key={r.id}>
                <td className="p-2">{r.date}</td>
                <td className="p-2">{r.start_time}</td>
                <td className="p-2">{r.end_time}</td>
                <td className="p-2">{r.hours}</td>
                <td className="p-2">{r.task}</td>
                <td className="p-2">{r.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
