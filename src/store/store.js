import { configureStore } from "@reduxjs/toolkit";
import timesheetReducer from "./timesheetSlice";

const store = configureStore({
  reducer: {
    timesheet: timesheetReducer,
  },
  // Optional: disable serializable check for Dexie objects if needed
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
