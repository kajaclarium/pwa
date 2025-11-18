import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../services/dexieDB";
import { supabase } from "../services/supabaseClient";

// SYNC FUNCTION
export const syncTimesheets = createAsyncThunk("timesheet/sync", async () => {
    const unsynced = await db.timesheets.where({ synced: 0 }).toArray();
    if (!unsynced.length) return "No pending sync";

  
    // Map Dexie rows to Supabase-friendly payload
    const payload = unsynced.map((row) => ({
      id: row.id,          // ensure matches uuid type
      date: row.date || null,
      start_time: row.start_time || null,
      end_time: row.end_time || null,
      hours: parseFloat(row.hours) || 0,
      task: row.task || null,
      created_at: row.created_at || new Date().toISOString(),
    }));

  
    const { data, error } = await supabase.from("timesheet").upsert(payload); // upsert to avoid duplicates
  
    if (error) throw error;
  
    // mark as synced locally
    unsynced.forEach((row) => db.timesheets.update(row.id, { synced: 1 }));
  
    return "Synced to Supabase";
  });
  

// LOAD FROM IDB
export const loadTimesheetsFromIDB = createAsyncThunk("timesheet/load", async () => {
  return await db.timesheets.toArray();
});

const timesheetSlice = createSlice({
  name: "timesheet",
  initialState: {
    items: [],
    syncStatus: "idle",
    message: "",
    online: navigator.onLine,
  },
  reducers: {
    addLocal(state, action) {
      // add or update item in Redux state
      const index = state.items.findIndex((i) => i.id === action.payload.id);
      if (index === -1) {
        state.items.push(action.payload);
      } else {
        state.items[index] = action.payload;
      }
    },
    notify(state, action) {
      state.message = action.payload;
    },
    setOnline(state, action) {
      state.online = action.payload;
    },
    setSyncStatus(state, action) {
      state.syncStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncTimesheets.pending, (state) => {
        state.syncStatus = "syncing";
        state.message = "Syncing…";
      })
      .addCase(syncTimesheets.fulfilled, (state, action) => {
        state.syncStatus = "success";
        state.message = action.payload;
      })
      .addCase(syncTimesheets.rejected, (state, action) => {
        state.syncStatus = "error";
        state.message = action.error.message;
      })
      .addCase(loadTimesheetsFromIDB.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { addLocal, notify, setOnline, setSyncStatus } = timesheetSlice.actions;
export default timesheetSlice.reducer;
