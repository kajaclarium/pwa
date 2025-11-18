import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addLocal,
  loadTimesheetsFromIDB,
  syncTimesheets,
  setOnline,
  setSyncStatus,
} from "../store/timesheetSlice";
import { notify } from "../lib/notify";
import { db } from "../services/dexieDB"; // ensure path is correct
import TimesheetView from "./TimesheetView";

export default function TimesheetTable() {
  const dispatch = useDispatch();
  const {
    items: reduxRows,
    syncStatus,
    online,
  } = useSelector((s) => s.timesheet);
  const [localRows, setLocalRows] = useState([]);
  const [showTimesheet, setShowTimesheet] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load rows from IndexedDB into Redux on mount
  useEffect(() => {
    dispatch(loadTimesheetsFromIDB());
  }, [dispatch]);

  // Mirror Redux rows into component state for editing
  useEffect(() => {
    setLocalRows(
      reduxRows.map((r) => ({
        id: r.id,
        date: r.date || "",
        start_time: r.start_time || "",
        end_time: r.end_time || "",
        hours: r.hours?.toString() || "0",
        task: r.task || "",
      }))
    );
  }, [reduxRows]);

  // Online/offline detection
  useEffect(() => {
    const onOnline = () => {
      dispatch(setOnline(true));
      notify("Online", { body: "You are back online — attempting sync" });
      dispatch(syncTimesheets());
    };
    const onOffline = () => {
      dispatch(setOnline(false));
      notify("Offline", {
        body: "You are offline — timesheets will be saved locally.",
      });
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [dispatch]);

  // Calculate hours from start_time/end_time
  function calculateHours(start_time,end_time) {
    if (!start_time || !end_time) return "0";
    const start_timeTime = new Date(`2025-01-01T${start_time}:00`);
    let end_timeTime = new Date(`2025-01-01T${end_time}:00`);
    if (end_timeTime < start_timeTime) end_timeTime.setDate(end_timeTime.getDate() + 1);
    const diff = (end_timeTime - start_timeTime) / (1000 * 60 * 60);
    return diff > 0 ? diff.toFixed(2) : "0";
  }

  // Update local row
  function handleChange(id, field, value) {
    setLocalRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: value };
        if (field === "start_time" || field === "end_time") {
          updated.hours = calculateHours(updated.start_time, updated.end_time);
        }
        return updated;
      })
    );
  }

  // Add new row
  function addRow() {
    const newRow = {
      id: crypto.randomUUID(),
      date: "",
      start_time: "",
      end_time: "",
      hours: "0",
      task: "",
    };
    setLocalRows((prev) => [newRow, ...prev]);
  }

  // Save rows to Dexie + Redux + optionally sync
  async function submitTimesheet() {
    setLoading(true);
    try {
      for (const row of localRows) {
        const payload = {
          id: row.id,
          date: row.date || null,
          start_time: row.start_time || null,
          end_time: row.end_time || null,
          hours: parseFloat(row.hours) || 0,
          task: row.task || null,
          created_at: new Date().toISOString(),
          synced: 0,
          supabase_id: null,
        };

        // Save to IndexedDB (upsert)
        await db.timesheets.put(payload);

        // Update Redux state
        dispatch(addLocal(payload));
      }

      notify("Saved locally", {
        body: `${localRows.length} rows saved to local DB.`,
      });

      if (navigator.onLine) dispatch(syncTimesheets());
      else dispatch(setSyncStatus("idle"));
    } catch (err) {
      console.error("submitTimesheet error", err);
      notify("Save failed", {
        body: err?.message || "Could not save timesheet",
      });
    } finally {
      setLoading(false);
    }
  }

  // Delete row
  async function removeRow(id) {
    try {
      await db.timesheets.delete(id);
      setLocalRows((prev) => prev.filter((r) => r.id !== id));
      dispatch(loadTimesheetsFromIDB());
      notify("Row deleted", { body: "Row removed from local DB" });
    } catch (err) {
      console.error("removeRow", err);
    }
  }

  // Manual sync
  const handleManualSync = useCallback(() => {
    if (navigator.onLine) dispatch(syncTimesheets());
    else notify("Offline", { body: "Connect to internet to sync." });
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto p-3">
      {/* Header */}
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-lg font-bold">Production Timesheet</h2>
        <div className="flex gap-2 items-center">
          <div
            className={`px-2 py-1 rounded ${
              online ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {online ? "Online" : "Offline"}
          </div>
          <div
            className={`px-2 py-1 rounded ${
              syncStatus === "syncing"
                ? "bg-yellow-100 text-yellow-800"
                : syncStatus === "success"
                ? "bg-green-100 text-green-800"
                : syncStatus === "error"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {syncStatus === "syncing"
              ? "Syncing…"
              : syncStatus === "success"
              ? "Synced"
              : syncStatus === "error"
              ? "Sync failed"
              : "Idle"}
          </div>
          <button
            onClick={handleManualSync}
            className="px-3 py-1 bg-gray-800 text-white rounded"
          >
            Sync Now
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-3 rounded">
        <table className="w-full min-w-[600px]  -collapse">
          <thead className="bg-gray-200 text-left">
            <tr>
              {["Date", "start_time", "end_time", "Hours", "Task", "Actions"].map((h) => (
                <th key={h} className="p-2  ">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localRows.map((row) => (
              <tr key={row.id}>
                <td className="p-2  ">
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) =>
                      handleChange(row.id, "date", e.target.value)
                    }
                    className="w-full p-1"
                  />
                </td>
                <td className="p-2  ">
                  <input
                    type="time"
                    value={row.start_time}
                    onChange={(e) =>
                      handleChange(row.id, "start_time", e.target.value)
                    }
                    className="w-full p-1"
                  />
                </td>
                <td className="p-2  ">
                  <input
                    type="time"
                    value={row.end_time}
                    onChange={(e) =>
                      handleChange(row.id, "end_time", e.target.value)
                    }
                    className="w-full p-1"
                  />
                </td>
                <td className="p-2   text-center font-semibold">
                  {row.hours}
                </td>
                <td className="p-2  ">
                  <input
                    type="text"
                    value={row.task}
                    placeholder="Work description"
                    onChange={(e) =>
                      handleChange(row.id, "task", e.target.value)
                    }
                    className="w-full p-1"
                  />
                </td>
                <td className="p-2   flex justify-center gap-1">
                  <button
                    onClick={() => removeRow(row.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={addRow}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          + Add Row
        </button>
        <button
          onClick={submitTimesheet}
          className="px-3 py-1 bg-green-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Submit timesheet"}
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setShowTimesheet(true)}
          className="px-3 py-1 bg-red-600 text-white rounded"
          disabled={loading}
        >
          View Timesheet Records
        </button>
      </div>

      {showTimesheet && <TimesheetView />}
    </div>
  );
}
