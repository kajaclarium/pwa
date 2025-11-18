import { syncTimesheets } from "../store/timesheetSlice";

export function setupOnlineSync(store) {
  window.addEventListener("online", () => {
    store.dispatch(syncTimesheets());
  });
}
