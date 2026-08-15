(() => {
  "use strict";

  const loader = document.currentScript;
  const measurementId = loader && loader.dataset.measurementId;
  const storageKey = "magnotex-analytics-consent";
  let analyticsLoaded = false;

  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) {
    console.error("Google Analytics: falta un ID de medicion GA4 valido.");
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });

  function getStoredConsent() {
    try {
      const value = window.localStorage.getItem(storageKey);
      return value === "granted" || value === "denied" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function storeConsent(value) {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch (error) {
      // The choice remains valid for this page when storage is unavailable.
    }
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    script.dataset.googleAnalytics = measurementId;
    document.head.appendChild(script);

    window.gtag("js", new Date());
    window.gtag("config", measurementId);
  }

  function removeAnalyticsCookies() {
    const hostParts = window.location.hostname.split(".");
    const domains = [window.location.hostname];
    for (let index = 1; index < hostParts.length - 1; index += 1) {
      domains.push("." + hostParts.slice(index).join("."));
    }

    document.cookie.split(";").forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      if (!name.startsWith("_ga")) return;
      document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax";
      domains.forEach(domain => {
        document.cookie = name + "=; Max-Age=0; path=/; domain=" + domain + "; SameSite=Lax";
      });
    });
  }

  function updateConsent(value) {
    const granted = value === "granted";
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: granted ? "granted" : "denied"
    });
    storeConsent(value);

    if (granted) loadAnalytics();
    else removeAnalyticsCookies();
  }

  function buildControls() {
    const panel = document.createElement("section");
    panel.className = "analytics-consent";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "analytics-consent-title");
    panel.innerHTML = [
      '<h2 class="analytics-consent__title" id="analytics-consent-title">Tu privacidad</h2>',
      '<p class="analytics-consent__text">Usamos Google Analytics para conocer el uso de la web y mejorarla. Solo se activará si aceptas.</p>',
      '<div class="analytics-consent__actions">',
      '<button class="analytics-consent__button analytics-consent__button--reject" type="button" data-consent="denied">Rechazar</button>',
      '<button class="analytics-consent__button analytics-consent__button--accept" type="button" data-consent="granted">Aceptar analítica</button>',
      "</div>"
    ].join("");

    const settings = document.createElement("button");
    settings.className = "analytics-settings";
    settings.type = "button";
    settings.textContent = "Cookies";
    settings.setAttribute("aria-label", "Configurar cookies analíticas");

    panel.querySelectorAll("[data-consent]").forEach(button => {
      button.addEventListener("click", () => {
        updateConsent(button.dataset.consent);
        panel.hidden = true;
        settings.hidden = false;
        settings.focus();
      });
    });

    settings.addEventListener("click", () => {
      settings.hidden = true;
      panel.hidden = false;
      panel.querySelector("[data-consent]").focus();
    });

    document.body.append(panel, settings);

    const storedConsent = getStoredConsent();
    panel.hidden = Boolean(storedConsent);
    settings.hidden = !storedConsent;
  }

  const storedConsent = getStoredConsent();
  if (storedConsent) updateConsent(storedConsent);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildControls, { once: true });
  } else {
    buildControls();
  }
})();
