const INSTALL_DISMISS_KEY = 'borai-install-remind-after';
const REMIND_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

function isStandalone(displayModeMatches, navigatorStandalone) {
  return displayModeMatches === true || navigatorStandalone === true;
}

function shouldOfferInstall({ installed, enabled, remindAfter, pathname, now = Date.now() }) {
  if (installed || !enabled || Number(remindAfter) > now) return false;
  return !/^\/(?:ar|en)\/(?:cart|checkout|wallet|login|register)(?:\/|$)/.test(pathname || '') &&
    !/^\/admin(?:\/|$)/.test(pathname || '');
}

module.exports = { INSTALL_DISMISS_KEY, REMIND_AFTER_MS, isStandalone, shouldOfferInstall };
