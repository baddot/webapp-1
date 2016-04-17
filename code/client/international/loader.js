// https://github.com/gpbl/isomorphic500/blob/master/src/utils/IntlUtils.js

// Contains utils to download the locale data for the current language, eventually
// requiring the `Intl` polyfill for browser not supporting it
// It is used in client.js *before* rendering the root component.

import { addLocaleData as add_locale_data } from 'react-intl'
import javascript_time_ago from 'javascript-time-ago'
import is_intl_locale_supported from 'intl-locales-supported'

// `react-intl` is already used in the project, 
// so specifie `intl-messageformat` initialization
// may not be actually needed.
//
// but just in case, `intl-messageformat` is initialized here too.
// (maybe it's an excessive measure)
//
require('javascript-time-ago/intl-messageformat-global')

// doesn't matter, just initialize it with something
let _locale = 'en'

// console output for debugging purposes
const debug = (...parameters) => { console.log.bind(console)(parameters) }

const international =
{
	// client-side bootstrap code
	//
	// load the Intl polyfill and its locale data before rendering the application
	load(locale)
	{
		// language
		locale = locale || document.documentElement.getAttribute('lang') || 'en'

		return international.load_polyfill(locale)
			.then(international.load_locale_data.bind(null, locale))
	},

	// Returns a promise which is resolved when Intl has been polyfilled
	load_polyfill(locale)
	{
		if (window.Intl && is_intl_locale_supported(locale))
		{
			// all fine: Intl is in the global scope and the locale data is available
			return Promise.resolve()
		}

		return new Promise((resolve) =>
		{
			debug(`Intl or locale data for "${locale}" not available, downloading the polyfill...`)

			// When building: create a intl chunk with webpack
			// When executing: run the callback once the chunk has been download.
			require.ensure(['intl'], (require) =>
			{
				// apply the polyfill
				require('intl')
				debug(`Intl polyfill for "${locale}" has been loaded`)
				resolve()
			},
			'intl')
		})
	},

	// Returns a promise which is resolved as the required locale-data chunks
	// has been downloaded with webpack's require.ensure. For each language,
	// we make two different chunks: one for browsers supporting `intl` and one
	// for those who don't.
	// The react-intl locale-data is required, for example, by the FormattedRelative
	// component.
	load_locale_data(locale)
	{
		// Make sure ReactIntl is in the global scope: this is required for adding locale-data
		// Since ReactIntl needs the `Intl` polyfill to be required (sic) we must place
		// this require here, when loadIntlPolyfill is supposed to be present
		require('expose?ReactIntl!react-intl')

		// The require.ensure function accepts an additional 3rd parameter. 
		// This must be a string. 
		// If two split point pass the same string they use the same chunk.

		return new Promise(resolve =>
		{
			// do not remove code duplication (because Webpack won't work as expected)
			switch (get_language_from_locale(locale))
			{
				// russian
				case 'ru':
					if (!is_intl_locale_supported('ru'))
					{
						// download both intl locale data and react-intl specific locale data for this language
						require.ensure
						([
							'intl/locale-data/jsonp/ru',
							'react-intl/locale-data/ru',
							'intl-messageformat/dist/locale-data/ru',
							'javascript-time-ago/locales/ru'
						],
						require =>
						{
							require('intl/locale-data/jsonp/ru')
							add_locale_data(require('react-intl/locale-data/ru'))
							debug(`Intl and ReactIntl locale-data for "${locale}" has been downloaded`)
							
							require('intl-messageformat/dist/locale-data/ru')
							javascript_time_ago.locale(require('javascript-time-ago/locales/ru'))
							
							resolve()
						},
						'locale-ru-with-intl')
					}
					else
					{
						// download just react-intl specific locale data for this language
						require.ensure
						([
							'react-intl/locale-data/ru',
							'intl-messageformat/dist/locale-data/ru',
							'javascript-time-ago/locales/ru'
						],
						require =>
						{
							add_locale_data(require('react-intl/locale-data/ru'))
							debug(`ReactIntl locale-data for "${locale}" has been downloaded`)
							
							require('intl-messageformat/dist/locale-data/ru')
							javascript_time_ago.locale(require('javascript-time-ago/locales/ru'))
							
							resolve()
						},
						'locale-ru')
					}
					break

				// english
				default:
					if (!is_intl_locale_supported('en'))
					{
						// require.ensure
						// ([
						// 	'intl/locale-data/jsonp/en',
						// 	'react-intl/dist/locale-data/en'
						// ],
						// (require) =>
						// {
						// 	require('intl/locale-data/jsonp/en')
						// 	require('react-intl/dist/locale-data/en')
						// 	debug(`Intl and ReactIntl locale-data for "${locale}" has been downloaded`)
						// 	resolve()
						// },
						// 'locale-en')

						// download intl locale data for this language
						require.ensure
						([
							'intl/locale-data/jsonp/en',
							'intl-messageformat/dist/locale-data/en',
							'javascript-time-ago/locales/en'
						],
						require =>
						{
							require('intl/locale-data/jsonp/en')
							debug(`Intl and ReactIntl locale-data for "${locale}" has been downloaded`)
							
							require('intl-messageformat/dist/locale-data/en')
							javascript_time_ago.locale(require('javascript-time-ago/locales/en'))
							
							resolve()
						},
						'locale-en-with-intl')
					}
					else
					{
						// require.ensure(['react-intl/dist/locale-data/en'], (require) =>
						// {
						// 	require('react-intl/dist/locale-data/en')
						// 	debug(`ReactIntl locale-data for "${locale}" has been downloaded`)
						// 	resolve()
						// },
						// 'locale-en')

						// download intl locale data for this language
						require.ensure
						([
							'intl-messageformat/dist/locale-data/en',
							'javascript-time-ago/locales/en'
						],
						require =>
						{
							require('intl-messageformat/dist/locale-data/en')
							javascript_time_ago.locale(require('javascript-time-ago/locales/en'))
							
							resolve()
						},
						'locale-en-with-intl')
					}
			}
		})
	},

	load_translation: locale =>
	{
		// makes Webpack HMR work for this locale for now
		_locale = locale

		switch (locale)
		{
			case 'ru':
				return new Promise(resolve =>
				{
					require.ensure(['./translations/ru'], require =>
					{
						resolve(require('./translations/ru'))
					})
				})

			default:
				return new Promise(resolve =>
				{
					require.ensure(['./translations/en'], require =>
					{
						resolve(require('./translations/en'))
					})
				})
		}
	},

	hot_reload: on_reload =>
	{
		// `_development_` flag is needed here
		// to make sure that Webpack doesn't include
		// the whole `./international` folder into the `main` bundle
		// in production mode (because that's the sole point of code splitting)
		//
		if (_development_ && module.hot)
		{
			module.hot.accept(require.resolve('./translations/' + _locale + '.js'), function()
			{
				on_reload()
			})
		}
	}
}

export default international