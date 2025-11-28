export function notify(title, options = {}) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    navigator.serviceWorker.ready.then((sw) => {
      sw.showNotification(title, options);
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        navigator.serviceWorker.ready.then((sw) => {
          sw.showNotification(title, options);
        });
      }
    });
  }
}
