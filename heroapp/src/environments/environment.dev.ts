import { SITE_CONFIG } from '../config';

export const environment = {
  production: false,
  stripeKey: 'pk_test_ob0pAr1M73yBaOZvmt4xSBvE',
  apiUrl: SITE_CONFIG.configApiUrlDev,
  defaultLanguage: 'en-US',
  supportedLanguages: [
    'en-US',
    'vi-VN'
  ]
};
