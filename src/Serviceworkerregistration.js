export function register() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/pwa/service-worker.js")
          .then((registration) => {
            console.log("SW registered:", registration);
  
            // Listen for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed") {
                    if (navigator.serviceWorker.controller) {
                      console.log("New content available; please refresh.");
                    } else {
                      console.log("Content cached for offline use.");
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error("SW registration failed:", error);
          });
      });
    }
  }
  
  export function unregister() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.unregister();
      });
    }
  }
  