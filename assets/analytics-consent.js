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
      '<div class="analytics-consent__visual" aria-hidden="true">',
      '<svg class="analytics-consent__cookie" viewBox="0 0 96 96" focusable="false">',
      '<defs><mask id="analytics-cookie-bites"><rect width="96" height="96" fill="#fff"/><circle cx="78" cy="18" r="11" fill="#000"/><circle cx="88" cy="37" r="10" fill="#000"/></mask></defs>',
      '<g mask="url(#analytics-cookie-bites)">',
      '<circle cx="48" cy="48" r="36" fill="#efbd72" stroke="#b97832" stroke-width="4"/>',
      '<circle cx="34" cy="31" r="4" fill="#75411f"/><circle cx="57" cy="27" r="3.5" fill="#75411f"/>',
      '<circle cx="65" cy="49" r="4" fill="#75411f"/><circle cx="42" cy="54" r="3.5" fill="#75411f"/>',
      '<circle cx="57" cy="70" r="4" fill="#75411f"/><circle cx="28" cy="68" r="3" fill="#75411f"/>',
      '</g>',
      '<path d="M78 58v11M72.5 63.5h11M22 17v8M18 21h8" stroke="#4cc45c" stroke-width="3" stroke-linecap="round"/>',
      '</svg>',
      '</div>',
      '<div class="analytics-consent__content">',
      '<h2 class="analytics-consent__title" id="analytics-consent-title">Tu privacidad importa</h2>',
      '<p class="analytics-consent__text">Usamos Google Analytics para conocer c&oacute;mo se utiliza la web y seguir mejor&aacute;ndola. Solo se activar&aacute; si aceptas.</p>',
      '<div class="analytics-consent__actions">',
      '<button class="analytics-consent__button analytics-consent__button--reject" type="button" data-consent="denied">Rechazar</button>',
      '<button class="analytics-consent__button analytics-consent__button--accept" type="button" data-consent="granted">Aceptar anal&iacute;tica</button>',
      '</div>',
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
