# eleventy-plugin-i18n

:warning: _Coming soon:_ [Eleventy](https://www.11ty.dev/) plugin to assist with internationalization and dictionary translations.

## Install

Soon to be available on npm. (As soon as they decide the package name isn't a spam grab)

```
npm install eleventy-plugin-i18n --save
```

## Plugin features

- Contextually-aware `i18n` filter, with dynamic string interpolation

## Demo

Dive in to see how the plugin is used in a multilingual Eleventy site:

- [Demo site](https://eleventy-plugin-i18n-demo.netlify.app/)
- [Source](https://github.com/adamduncan/eleventy-plugin-i18n-demo/)

We'll be writing up a full tutorial to provide a guide and some handy **11ty i18n** hints. For a quick rundown in the meantime, check out the [TL;DR walkthrough](https://github.com/adamduncan/eleventy-plugin-i18n-demo#tldr-just-riffin).

## Configuration

### 1. Define language site directories

Create directories at the site root for each language code (e.g. `en`) or language code with country code suffix (e.g. `en-GB`):

```
├─ src
   └─ en-GB
       ├─ about.njk
       └─ index.njk
   └─ es-ES
       ├─ about.njk
       └─ index.njk
```

Either is fine. Let's assume we'll need to support multiple dialects in the future, and include country code suffixes.

These directory names determine the `lang` value of each language site. This enables Eleventy to infer language when translating terms throughout their pages.

### 2. Create directory data files

In each language site directory, create a locale data file of the same name. Include `dir` and `locale` values. E.g.: `src/en-GB/en-GB.json`

```json
{
  "dir": "ltr",
  "locale": "en-GB"
}
```

:point_right: Bonus point: Wherever your main HTML document template is defined, include `lang` and `dir` attributes:

```
<html lang="{{ locale }}" dir="{{ dir }}">
```

### 3. Add to Eleventy configuration

Open up your Eleventy config file (probably `.eleventy.js`). Import the plugin and use `addPlugin`. This is where we provide the `translations` and `fallbackLocale` as plugin options:

```js
// .eleventy.js
const i18n = require('eleventy-plugin-i18n');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(i18n, {
    translations: {
      hello: {
        'en-GB': 'Hello',
        'es-ES': 'Hola'
      }
    },
    fallbackLocale: 'en-GB'
  });
};
```

#### `translations`

Type: `Object` | Default: `{}`

Schema: `{ [key]: { [locale]: 'String' } }`

This object contains our dictionary of translations for each respective language. It can be declared inline within the plugin options (as above), or lifted out into its own JS module to keep things tidy:

```js
// .eleventy.js
const i18n = require('eleventy-plugin-i18n');
const translations = require('./src/_data/i18n');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(i18n, {
    translations,
    fallbackLocale: 'en-GB'
  });
};
```

```js
// src/_data/i18n/index.js
module.exports = {
  hello: {
    'en-GB': 'Hello',
    'es-ES': 'Hola'
  }
};
```

You might choose to break translations out into their own individual `en-GB.js` and `es-ES.js` data files, then import and merge them into a single `translations` object for the plugin. As long as our `translation` schema is the same when you're done, we're good to go! (See: [API: `key`](https://github.com/adamduncan/eleventy-plugin-i18n#key))

_Note:_ These data files could also be JSON, but I've opted for JS files for more flexibility around quotation marks and comments.

#### `fallbackLocale`

Type: `String` | Default: ‌`en`

If a matching translation for a given dictionary item can't be found, the `i18n` filter will try to find a fallback from this language in its place.

:eyes: `eleventy-plugin-i18n` will warn you in the Node console when the intended or fallback values can't be found for a given language based on your `translations`.

## Usage

Once configured, the `i18n` [Universal filter](https://www.11ty.dev/docs/filters/#universal-filters) is available throughout Nunjucks, Handlebars, Liquid, and JavaScript templates and includes. E.g. To return the translation for our `hello` key in Nunjucks or Liquid syntax:

```njk
{{ 'hello' | i18n }}
```

Whether used in a page, layout or include, the filter will automatically determine the correct translation to use based on its site's language. No need to pass `locale` everywhere it's used!

## API

### **`i18n(key, data?, localeOverride?)`**

Returns: `String`

#### `key`

Type: `String`

The translation lookup key for our dictionary item.

:hushed: Fun fact: Translation objects can be structured however you like, as long as the `locale` is at the end of the chain. `i18n` uses [lodash's `get`](https://lodash.com/docs/#get) under the hood to make dot notation lookups like this easy peasy:

```js
module.exports = {
  actions: {
    click: {
      'en-GB': 'Click',
      'es-ES': 'Hacer clic'
    }
  }
};
```

```njk
{{ 'actions.click' | i18n }}
```

#### `data`

Type: `Object` | Default: `{}`

Translation values can interpolate data using the `{{ }}` syntax (thanks to [@lukeed](https://github.com/lukeed)'s awesome [`templite`](https://github.com/lukeed/templite/) — check out their docs!). For example, given the translation:

```js
module.exports = {
  hello_name: {
    'en-GB': 'Hello, {{ name }}!',
    'es-ES': '¡Hola {{ name }}!'
  }
};
```

```njk
{{ 'hello_name' | i18n({ name: 'Eve' }) }}
{# Returns: "Hello, Eve!" or "¡Hola Eve!" #}
```

#### `localeOverride`

Type: `String`

We can guarantee a translation will always return in a given language by including a `localeOverride` as the second argument. For example, this will always render in Spanish, no matter which country site it's in. Muy bueno!

```
{{ 'hello' | i18n({}, 'es-ES') }}
```

_Note:_ Here we will still have to pass the first `data` argument, even if no interpolation is needed. You can pass an empty object `{}` or `undefined`.

## Roadmap

- [ ] Write up tutorial to build on some great concepts ([multilingual](https://www.webstoemp.com/blog/multilingual-sites-eleventy/), [language toggle](https://www.webstoemp.com/blog/language-switcher-multilingual-jamstack-sites/)) in this area. Dive further into how to architect and implement multilingual Eleventy sites, and leverage the plugin (e.g. [smart language switching](https://github.com/adamduncan/eleventy-plugin-i18n-demo/blob/master/src/_includes/components/language-selector.njk), using Netlify's `_redirects` to get users to where they need to go).
- [ ] Explore shipping additional i18n-aware `pluralize` filter `{{ 'apple' | i18n | pluralize(3) }}` (Awesome suggestion from [@alexcarpenter](https://github.com/alexcarpenter)).
- [ ] Quiet mode option? Some might want to suppress the console logs on missing translations?

---

Read more about [Eleventy plugins](https://www.11ty.dev/docs/plugins/).

Feedback welcome :raised_hands:
