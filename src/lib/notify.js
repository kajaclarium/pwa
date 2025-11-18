// src/lib/notify.js
export function notify(title, options = {}) {
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, options);
      } else if ("Notification" in window && Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") new Notification(title, options);
        });
      }
    } catch (err) {
      // fallback: console log
      console.log("NOTIFY:", title, options);
    }
  }
  