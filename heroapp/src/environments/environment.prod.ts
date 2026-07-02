import { SITE_CONFIG } from '../config';

export const environment = {
  production: true,
  stripeKey: 'pk_test_ob0pAr1M73yBaOZvmt4xSBvE',
  apiUrl: SITE_CONFIG.configApiUrlProd,
  defaultLanguage: 'en-US',
  supportedLanguages: [
    'en-US',
    'vi-VN'
  ]
};
