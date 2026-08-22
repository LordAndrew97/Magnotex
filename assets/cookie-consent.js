(function () {
  'use strict';

  var CONSENT_KEY = 'magnotex.analyticsConsent';
  var ACCEPTED = 'accepted';
  var REJECTED = 'rejected';
  var scriptElement = document.currentScript;
  var measurementId = scriptElement ? scriptElement.getAttribute('data-ga-measurement-id') : '';
  var privacyPolicyHref = scriptElement ? scriptElement.getAttribute('data-privacy-policy-href') : 'politica-de-privacidad.html';
  var cookiePolicyHref = scriptElement ? scriptElement.getAttribute('data-cookie-policy-href') : 'politica-de-cookies.html';

  function readConsent() {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch (error) { return null; }
  }

  function saveConsent(value) {
    try { window.localStorage.setItem(CONSENT_KEY, value); } catch (error) {}
  }

  function prepareConsentState() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    if (window.__magnotexConsentPrepared) return;
    window.__magnotexConsentPrepared = true;
    window.gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
    });
  }

  function loadAnalytics() {
    if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;
    if (window.__magnotexGa4MeasurementId === measurementId) return;
    window.__magnotexGa4MeasurementId = measurementId;
    prepareConsentState();
    window.gtag('consent', 'update', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted'
    });
    var source = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    var analyticsScript = document.querySelector('script[data-magnotex-ga4]') || document.querySelector('script[src="' + source + '"]');
    if (!analyticsScript) {
      analyticsScript = document.createElement('script');
      analyticsScript.async = true;
      analyticsScript.src = source;
      analyticsScript.setAttribute('data-magnotex-ga4', measurementId);
      document.head.appendChild(analyticsScript);
    }
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: true });
    window.__magnotexAnalyticsReady = true;
  }

  function revokeAnalytics() {
    prepareConsentState();
    window.gtag('consent', 'update', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
    });
    window.__magnotexAnalyticsReady = false;
    window.__magnotexGa4MeasurementId = null;
    try {
      var hostParts = window.location.hostname.split('.');
      var domains = [window.location.hostname];
      for (var index = 1; index < hostParts.length - 1; index += 1) {
        domains.push('.' + hostParts.slice(index).join('.'));
      }
      document.cookie.split(';').forEach(function (cookie) {
        var name = cookie.split('=')[0].trim();
        if (!/^_(ga|gid|gat)/.test(name)) return;
        var expired = name + '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
        document.cookie = expired;
        domains.forEach(function (domain) { document.cookie = expired + '; domain=' + domain; });
      });
    } catch (error) {}
  }

  window.magnotexTrack = function (eventName, eventParams) {
    if (!window.__magnotexAnalyticsReady || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, eventParams || {});
  };

  function closeBanner(banner) {
    banner.classList.remove('is-visible');
    banner.classList.add('is-closing');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(function () { banner.remove(); }, reducedMotion ? 0 : 300);
  }

  function showBanner() {
    var banner = document.createElement('section');
    banner.className = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-labelledby', 'cookie-consent-title');
    banner.setAttribute('aria-describedby', 'cookie-consent-description');
    banner.innerHTML =
      '<div class="cookie-consent__card">' +
        '<div class="cookie-consent__art" aria-hidden="true"><svg viewBox="0 0 96 96" role="img">' +
          '<path d="M79 44c-10 0-18-8-18-18 0-3 .7-6 2-8A34 34 0 1 0 82 45l-3-1Z" fill="#E8B86A" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>' +
          '<circle cx="37" cy="34" r="5" fill="#0D1C5E"/><circle cx="30" cy="59" r="4.5" fill="#0D1C5E"/><circle cx="54" cy="69" r="5" fill="#1D7124"/><circle cx="55" cy="45" r="3.5" fill="#1D7124"/>' +
        '</svg></div>' +
        '<div class="cookie-consent__content">' +
          '<p class="cookie-consent__eyebrow">Tu privacidad</p>' +
          '<h2 class="cookie-consent__title" id="cookie-consent-title">&iquest;Nos ayudas a mejorar?</h2>' +
          '<p class="cookie-consent__text" id="cookie-consent-description">Nos gustar&iacute;a conocer qu&eacute; contenidos resultan m&aacute;s &uacute;tiles para seguir mejorando esta web. T&uacute; decides si quieres permitir esta medici&oacute;n.</p>' +
          '<p class="cookie-consent__links"><a href="' + cookiePolicyHref + '">Pol&iacute;tica de cookies</a><span aria-hidden="true">&middot;</span><a href="' + privacyPolicyHref + '">Privacidad</a></p>' +
        '</div>' +
        '<div class="cookie-consent__actions"><button class="cookie-consent__button cookie-consent__button--reject" type="button" data-cookie-choice="reject">Rechazar</button><button class="cookie-consent__button cookie-consent__button--accept" type="button" data-cookie-choice="accept">Aceptar</button></div>' +
      '</div>';
    document.body.appendChild(banner);
    window.requestAnimationFrame(function () { banner.classList.add('is-visible'); });
    banner.addEventListener('click', function (event) {
      var button = event.target.closest('[data-cookie-choice]');
      if (!button) return;
      banner.querySelectorAll('[data-cookie-choice]').forEach(function (item) { item.disabled = true; });
      if (button.getAttribute('data-cookie-choice') === 'accept') { saveConsent(ACCEPTED); prepareConsentState(); loadAnalytics(); }
      else { saveConsent(REJECTED); revokeAnalytics(); }
      closeBanner(banner);
    });
  }

  window.magnotexOpenConsent = function () { if (!document.querySelector('.cookie-consent')) showBanner(); };
  var consent = readConsent();
  if (consent === ACCEPTED) { prepareConsentState(); loadAnalytics(); }
  else if (consent !== REJECTED) showBanner();
})();
