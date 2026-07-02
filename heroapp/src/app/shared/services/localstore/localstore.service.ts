import { Injectable } from '@angular/core';
import { Logger } from '../logger/loger-service.service';

const log = new Logger('LOCAL STORAGE');

@Injectable()
export class LocalStoreService {

  private static _instance: LocalStoreService = new LocalStoreService();

  constructor() {
    if (LocalStoreService._instance) {
      throw new Error('Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.');
    }
    LocalStoreService._instance = this;
  }

  public static getInstance(): LocalStoreService {
    return LocalStoreService._instance;
  }

  // clearLocalStore() {
  //   localStorage.clear();
  // }
  //
  // removeListDestinations(){
  //   localStorage.removeItem('listDestinations');
  // }

  setStaticPrice(price) {
    localStorage.setItem('staticPrice', price);
  }

  getStaticPrice() {
    return localStorage.getItem('staticPrice');
  }

  setListDestinations(data) {
    localStorage.setItem('listDestinations', JSON.stringify(data));
  }

  getListDestinations() {
    const listDestinations = localStorage.getItem('listDestinations');
    if (listDestinations) {
      return JSON.parse(listDestinations);
    } else {
      return [];
    }
  }

  setCurrentLocation(data) {
    localStorage.setItem('currentLocation', JSON.stringify(data));
  }

  getCurrentLocation() {
    const currentLocation = localStorage.getItem('currentLocation');
    if (currentLocation) {
      return JSON.parse(currentLocation);
    } else {
      return null;
    }
  }

  setAustraliaActivities(data) {
    localStorage.setItem('australiaActivities', JSON.stringify(data));
  }

  getAustraliaActivities() {
    const australiaActivities = localStorage.getItem('australiaActivities');
    if (australiaActivities) {
      return JSON.parse(australiaActivities);
    } else {
      return null;
    }
  }

  setListNearYou(data) {
    localStorage.setItem('listNearYou', JSON.stringify(data));
  }

  getListNearYou() {
    const listNearYou = localStorage.getItem('listNearYou');
    if (listNearYou) {
      return JSON.parse(listNearYou);
    } else {
      return [];
    }
  }

  setDestinationNearYouId(data) {
    localStorage.setItem('destinationNearYouId', data);
  }

  getDestinationNearYouId() {
    const destinationNearYouId = localStorage.getItem('destinationNearYouId');
    if (destinationNearYouId) {
      return destinationNearYouId;
    } else {
      return '525'; // default 525: Amsterdam - the first of top destination
    }
  }

  setListCitiesOfAustralia(data) {
    localStorage.setItem('listCitiesOFAustralia', JSON.stringify(data));
  }

  getListCitiesOfAustralia() {
    const listCitiesOFAustralia = localStorage.getItem('listCitiesOFAustralia');
    if (listCitiesOFAustralia) {
      return JSON.parse(listCitiesOFAustralia);
    } else {
      return [];
    }
  }

  removeListProductAtHome() {
    localStorage.removeItem('listProductAtHome');
  }

  setListProductAtHome(data) {
    localStorage.setItem('listProductAtHome', JSON.stringify(data));
  }

  getListProductAtHome() {
    const listProductAtHome = localStorage.getItem('listProductAtHome');
    if (listProductAtHome) {
      return JSON.parse(listProductAtHome);
    } else {
      return [];
    }
  }

  setCurrencyCode(data) {
    localStorage.setItem('currencyCode', data);
  }

  getCurrencyCode() {
    const currencyCode = localStorage.getItem('currencyCode');
    if (currencyCode) {
      return currencyCode;
    } else {
      return 'AUD';
    }
  }

  updateCartShopping(data) {
    localStorage.setItem('cartShopping', JSON.stringify(data));
  }

  clearCartShopping() {
    localStorage.removeItem('cartShopping');
  }


  getCartShopping() {
    const cartShopping = localStorage.getItem('cartShopping');
    if (cartShopping) {
      return JSON.parse(cartShopping);
    } else {
      return [];
    }
  }

  updateListOptionsInfo(data) {
    localStorage.setItem('listOptionsInfo', JSON.stringify(data));
  }


  getlistOptionsInfo() {
    const listOptionsInfo = localStorage.getItem('listOptionsInfo');
    if (listOptionsInfo) {
      return JSON.parse(listOptionsInfo);
    } else {
      return [];
    }
  }

  clearListBookingQuestions() {
    localStorage.removeItem('bookingQuestions');
  }

  updateListBookingQuestions(data) {
    const existingData = localStorage.getItem('bookingQuestions');
    let bookingQuestions = [];
    if (existingData) {
        bookingQuestions = JSON.parse(existingData);
    }
    const index = bookingQuestions.findIndex(item => item.productCode === data.productCode);
    if (index !== -1) {
      bookingQuestions[index] = data;
  } else {
      bookingQuestions.push(data);
  }
  localStorage.setItem('bookingQuestions', JSON.stringify(bookingQuestions));
}

  getListBookingQuestions() {
    const bookingQuestions = localStorage.getItem('bookingQuestions');
    return JSON.parse(bookingQuestions);
  }

  updateCurrentBookingDate(data) {
    localStorage.setItem('CurrentBookingDate', JSON.stringify(data));
  }
  getCurrentBookingDate() {
   const CurrentBookingDate = localStorage.getItem('CurrentBookingDate');
   return JSON.parse(CurrentBookingDate);
  }

  updateCurrentOptions(data){
    localStorage.setItem('CurrentOptions', JSON.stringify(data));
  }

  getCurrentOptions() {
    const CurrentOptions = localStorage.getItem('CurrentOptions');
    return JSON.parse(CurrentOptions);
   }
}
