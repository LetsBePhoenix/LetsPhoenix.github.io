/* Pnx-Sandbox – available languages
   Add a new language: put its pack (e.g. fr.js) into this folder and add one line below.
   default:               language used on the first visit
   detectBrowserLanguage: true = on the first visit use the browser language if a pack exists */
PNX_LANGUAGES({
  default: 'en',
  detectBrowserLanguage: false,
  languages: [
    { code: 'en', name: 'English', flag: '🇬🇧', file: 'en.js' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', file: 'de.js' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱', file: 'pl.js' },
  ],
});