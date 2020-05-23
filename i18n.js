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
    fallbackLocale: fallbackLocale = 'en-GB'
  } = pluginOptions;

  // Use explicit `locale` argument if passed in, otherwise infer it from URL prefix segment
  const url = get(page, 'url', '');
  const contextLocale = localeOverride || url.split('/')[1];

  const locale = contextLocale || fallbackLocale;

  // Intended translation
  const translation = get(translations, `[${key}][${locale}]`);

  if (translation !== undefined) {
    return templite(translation, data);
  } else {
    console.warn(
      chalk.yellow(
        `Warning: Could not find i18n translation for '${key}' in '${contextLocale}' locale. Using fallback.`
      )
    );
  }

  // Fallback translation
  const fallbackTranslation = get(translations, `[${key}][${fallbackLocale}]`);

  if (fallbackTranslation !== undefined) {
    return templite(fallbackTranslation, data);
  } else {
    console.warn(
      chalk.red(
        `Not found: Could not find i18n translation for '${key}' in '${fallbackLocale}' fallback locale.`
      )
    );
    return key;
  }
};
