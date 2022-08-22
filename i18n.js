'use strict';

const chalk = require('chalk');
const get = require('lodash.get');
const deepmerge = require('deepmerge');
const templite = require('templite');
const trueType = (val) => Object.prototype.toString.call(val).slice(8, -1).toLowerCase();

function createLangDictionary(lang, object, translations = {}) {
	if (!object) {
		return translations;
	}
	for (const [key, value] of Object.entries(object)) {
		// Create the property if it does not exist
		if (typeof translations[key] === 'undefined') {
			translations[key] = {};
		}
		// If it's an object, recursively assign
		if (trueType(value) === 'object') {
			translations[key] = deepmerge(createLangDictionary(lang, value, translations[key]), translations[key]);
		} else {
			// End of the line: set the translation value
			translations[key][lang] = value;
		}
	}
	return translations;
}

module.exports = function (
  key,
  data = {},
  localeOverride,
  pluginOptions = {},
  page,
  pageDictionary = {}
) {
  const { translations = {}, fallbackLocales: fallbackLocales = {} } =
    pluginOptions;

  // Use explicit `locale` argument if passed in, otherwise infer it from URL prefix segment
  const url = get(page, 'url', '');
  const contextLocale = url.split('/')[1];
  const locale = localeOverride || contextLocale;

  // Add additional dictionary entries if the page context provides any
  const translationsExtended = createLangDictionary(locale, pageDictionary, structuredClone(translations))

  // Preferred translation
  const translation = get(translationsExtended, `[${key}][${locale}]`);

  if (translation !== undefined) {
    return templite(translation, data);
  }

  // Fallback translation
  const fallbackLocale =
    get(fallbackLocales, locale) || get(fallbackLocales, '*');
  const fallbackTranslation = get(translationsExtended, `[${key}][${fallbackLocale}]`);

  if (fallbackTranslation !== undefined) {
    console.warn(
      chalk.yellow(
        `[i18n] Could not find '${key}' in '${locale}'. Using '${fallbackLocale}' fallback.`
      )
    );
    return templite(fallbackTranslation, data);
  }

  // Not found
  console.warn(
    chalk.red(
      `[i18n] Translation for '${key}' in '${locale}' not found. No fallback locale specified.`
    )
  );
  return key;
};
