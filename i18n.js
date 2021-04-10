'use strict';

const chalk = require('chalk');
const get = require('lodash.get');
const templite = require('templite');

module.exports = function (
  key,
  data = {},
  localeOverride,
  pluginOptions = {},
  page
) {
  const {
    translations = {},
    fallbackLocales: fallbackLocales = {},
    lookupFn : lookupFn = (key, locale, translations) => get(translations, `[${key}][${locale}]`),
    useTemplite = true,
    notFoundCallback,
    silent = false
  } = pluginOptions;

  // Use explicit `locale` argument if passed in, otherwise infer it from URL prefix segment
  const url = get(page, 'url', '');
  const contextLocale = url.split('/')[1];
  const locale = localeOverride || contextLocale;

  // Preferred translation
  const translation = lookupFn(key, locale, translations, data);

  if (translation !== undefined) {
      if (useTemplite) {
          return templite(translation, data);
      }
      return translation;
  }

  // Fallback translation
  const fallbackLocale =
    get(fallbackLocales, locale) || get(fallbackLocales, '*');
  const fallbackTranslation = lookupFn(key, fallbackLocale, translations, data);

  if (fallbackTranslation !== undefined) {
    if (!silent) {
      console.warn(
        chalk.yellow(
          `[i18n] Could not find '${key}' in '${locale}'. Using '${fallbackLocale}' fallback.`
        )
      );
    }
    if (useTemplite) {
        return templite(fallbackTranslation, data);          
    }
    return fallbackTranslation;
  }

  // Not found
  if (notFoundCallback) {
    key = notFoundCallback(key, locale) || key;
  } else {
    console.warn(
      chalk.red(
        `[i18n] Translation for '${key}' in '${locale}' not found. No fallback locale specified.`
      )
    );
  }
  return key;
};
