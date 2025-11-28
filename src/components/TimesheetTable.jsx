import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addLocal,
  syncTimesheets,
} from "../store/timesheetSlice";
import { notify } from "../lib/notify";
import { db } from "../services/dexieDB";
import TimesheetView from "./TimesheetView";

export default function TimesheetTable() {
  const dispatch = useDispatch();

  const { items: reduxRows, syncStatus } = useSelector((s) => s.timesheet);

  const [localRows, setLocalRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTimesheet, setShowTimesheet] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);

  // Track online/offline
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Add new row
  function addRow() {
    setLocalRows((prev) => [
      {
        id: crypto.randomUUID(),
        date: "",
        start_time: "",
        end_time: "",
        hours: "0",
        task: "",
      },
      ...prev,
    ]);
  }

  // Remove a row
  function removeRow(id) {
    setLocalRows((prev) => prev.filter((r) => r.id !== id));
  }

  // Calculate hours
  function calculateHours(start, end) {
    if (!start || !end) return "0";
    const s = new Date(`2000-01-01T${start}`);
    const e = new Date(`2000-01-01T${end}`);
    if (e < s) e.setDate(e.getDate() + 1);
    const diff = (e - s) / (1000 * 60 * 60);
    return diff > 0 ? diff.toFixed(2) : "0";
  }

  // Update local row
  function handleChange(id, field, value) {
    setLocalRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              hours:
                field === "start_time" || field === "end_time"
                  ? calculateHours(
                      field === "start_time" ? value : row.start_time,
                      field === "end_time" ? value : row.end_time
                    )
                  : row.hours,
            }
          : row
      )
    );
  }

  // Submit to IndexedDB
  async function submitTimesheet() {
    setLoading(true);

    try {
      const saved = [];

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
        };

        await db.timesheets.put(payload);
        dispatch(addLocal(payload));
        saved.push(payload);
      }

      notify("Saved locally", { body: `${saved.length} rows saved.` });

      if (navigator.onLine) dispatch(syncTimesheets());

      setLocalRows([]);
    } catch (err) {
      notify("Save failed", { body: err.message });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Manual sync
  const handleManualSync = useCallback(() => {
    if (!navigator.onLine)
      return notify("Offline", { body: "Connect to internet to sync." });

    dispatch(syncTimesheets());
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto p-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Production Timesheet</h2>

        <div className="flex items-center gap-2">

          {/* Online Badge */}
          <span
            className={`px-2 py-1 text-sm rounded-md font-medium ${
              onlineStatus
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {onlineStatus ? "Online" : "Offline"}
          </span>

          {/* Sync Status */}
          <span
            className={`px-2 py-1 text-sm rounded-md font-medium ${
              syncStatus === "syncing"
                ? "bg-yellow-100 text-yellow-800"
                : syncStatus === "success"
                ? "bg-green-100 text-green-800"
                : syncStatus === "error"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {syncStatus === "syncing"
              ? "Syncing…"
              : syncStatus === "success"
              ? "Synced"
              : syncStatus === "error"
              ? "Sync failed"
              : "Idle"}
          </span>

          <button
            onClick={handleManualSync}
            className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Sync
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full min-w-[650px] border-collapse">
          <thead className="bg-gray-100 text-left">
            <tr>
              {["Date", "Start", "End", "Hours", "Task", "Actions"].map((h) => (
                <th key={h} className="p-2 text-sm font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {localRows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">

                <td className="p-2">
                  <input
                    type="date"
                    className="input"
                    value={row.date}
                    onChange={(e) =>
                      handleChange(row.id, "date", e.target.value)
                    }
                  />
                </td>

                <td className="p-2">
                  <input
                    type="time"
                    className="input"
                    value={row.start_time}
                    onChange={(e) =>
                      handleChange(row.id, "start_time", e.target.value)
                    }
                  />
                </td>

                <td className="p-2">
                  <input
                    type="time"
                    className="input"
                    value={row.end_time}
                    onChange={(e) =>
                      handleChange(row.id, "end_time", e.target.value)
                    }
                  />
                </td>

                <td className="p-2 text-center font-semibold">{row.hours}</td>

                <td className="p-2">
                  <input
                    type="text"
                    className="input"
                    placeholder="Work description"
                    value={row.task}
                    onChange={(e) =>
                      handleChange(row.id, "task", e.target.value)
                    }
                  />
                </td>

                <td className="p-2 text-center">
                  <button
                    onClick={() => removeRow(row.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
      <div className="flex gap-2 mt-4">
        <button
          onClick={addRow}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Row
        </button>

        <button
          onClick={submitTimesheet}
          disabled={loading}
          className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Submit Timesheet"}
        </button>
      </div>

      {/* View Records */}
      <div className="mt-4">
        <button
          onClick={() => setShowTimesheet(true)}
          className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          View Timesheet Records
        </button>
      </div>

      {showTimesheet && (
        <TimesheetView submitTimesheet={submitTimesheet} syncTimesheets={syncTimesheets} />
      )}
    </div>
  );
}
