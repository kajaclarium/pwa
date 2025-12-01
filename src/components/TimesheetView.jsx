import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient"; // Assuming supabase is imported here
import { db, cloneDb } from "../services/dexieDB";

export default function TimesheetView() {
  const [data, setData] = useState([]);

  // Function to load data from either Supabase or cloneDb
  async function loadData() {
    try {
      console.log("Checking online status:", navigator.onLine);

      if (navigator.onLine) {
        const { data: supaData, error } = await supabase
          .from("timesheet")
          .select("*")
          .order("created_at", { ascending: false });
      
        const localUnsynced = await cloneDb.timesheets
          .where("synced")
          .equals(0)
          .toArray();
      
        const merged = [...localUnsynced, ...supaData];
      
        setData(merged);
        return;
      }      

      const offlineData = await cloneDb.timesheets.toArray();
      console.log("📦 Offline data from cloneDb:", offlineData);
      setData(offlineData);
    } catch (err) {
      console.error("❌ loadData error:", err);
    }
  }

  // Use effect hook to run the data loading logic
  useEffect(() => {
    // Initial data load
    loadData();

    // Set an interval to refresh data every 6 seconds
    const id = setInterval(loadData, 6000);

    // Clean up the interval when the component is unmounted
    return () => clearInterval(id);
  }, []); // Empty dependency array ensures this runs once when the component mounts

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Timesheet Records</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm -collapse">
          <thead>
            <tr className="bg-gray-200">
              {[
                "Date",
                "Start Time",
                "End Time",
                "Hours",
                "Task",
                "Created At",
              ].map((h) => (
                <th key={h} className="p-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="p-2 text-center">
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
