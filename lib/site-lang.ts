export type SiteLang = 'cs' | 'en';

/** Jeden jazyk pro celý web — úvodní stránka i /fotky; nastaví ho i odkaz /en */
export const SITE_LANG_KEY = 'site-lang';
// Dřívější klíč stránky /fotky, ať se nezapomene, co si kdo už přepnul
const LEGACY_MEDIA_LANG_KEY = 'media-lang';

export function readSiteLang(): SiteLang | null {
  try {
    const stored = localStorage.getItem(SITE_LANG_KEY) ?? localStorage.getItem(LEGACY_MEDIA_LANG_KEY);
    return stored === 'en' || stored === 'cs' ? stored : null;
  } catch {
    return null;
  }
}

export function writeSiteLang(lang: SiteLang) {
  try {
    localStorage.setItem(SITE_LANG_KEY, lang);
  } catch {
    // jen do zavření stránky
  }
}
