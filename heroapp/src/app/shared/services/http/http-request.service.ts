import { Injectable } from '@angular/core';
import { HttpService } from './http-service.service';
import { HttpHeaderService } from './http-header.service';
import { Logger } from '../logger/loger-service.service';
import { RequestOptions } from '@angular/http';
import { LocalStoreService } from '../localstore/localstore.service';
import { HttpRequest, HttpHeaders, HttpClient } from '@angular/common/http';
const log = new Logger('Http-Request');

@Injectable()
export class HttpRequestService {
  private httpService: HttpService;

  constructor(private http: HttpService, private httpClient: HttpClient) {
    this.httpService = http;
  }

  private getHeader() {
    return new RequestOptions({ headers: HttpHeaderService.getInstance().getRequestHeader() });
  }

  private getHeaderFormData() {
    return new RequestOptions({ headers: HttpHeaderService.getInstance().getRequestHeaderFormData() });
  }
  private getRequestMethodPost(ApiUrl, bodyData) {
    return this.httpService.post(ApiUrl, bodyData, this.getHeader());
  }

  private getRequestMethodGet(ApiUrl) {
    return this.httpService.get(ApiUrl, this.getHeader());
  }

  getAllDestinations() {
    return this.getRequestMethodGet('Destinations');
  }

  getProductDetail(code) {
    const apiUrl = 'Products/getProductsDetails?',
      currencyCode = LocalStoreService.getInstance().getCurrencyCode();

    return this.getRequestMethodGet(apiUrl + 'code=' + code);
  }

  getProductDetailPrice(code) {
    const apiUrl = 'Products/getProductsDetailsPrice?',
      currencyCode = LocalStoreService.getInstance().getCurrencyCode();

    return this.getRequestMethodGet(apiUrl + 'code=' + code);
  }

  getProductDetailLocation(data) {
    return this.getRequestMethodPost('Products/getProductsDetailsLocation', data);
  }

  getAllCategoriesOfADestination(destId) {
    return this.getRequestMethodGet('Categories/getAllCategoriesOfADestination?destId=' + destId);
  }

  searchForProductsByTextAndCodeSB(params) {
    return this.getRequestMethodPost('Products/searchForProductsByTextAndCodeSB', params);
  }

  searchForProductsByTextAndCode(params) {
    return this.getRequestMethodPost('Products/searchForProductsByTextAndCode', params);
  }

  searchForProductsByTextAndCodeHP(params) {
    return this.getRequestMethodPost('Products/searchForProductsByTextAndCodeHP', params);
  }

  searchForProductsByDatePriceDurationAndCategory(params) {
    return this.getRequestMethodPost('Products/searchForProductsByDatePriceDurationAndCategory', params);
  }

  listTopAttractionOfADestination(params) {
    return this.getRequestMethodPost('Attractions/listTopAttractionOfADestination', params);
  }

  getDateAvaliableOfAProduct(productCode) {
    return this.getRequestMethodGet('Products/getDateAvaliableOfAProduct?productCode=' + productCode);
  }

  getListFatherOfADestination(destId) {
    return this.getRequestMethodGet('Destinations/getListFatherOfADestination?destId=' + destId);
  }

  loadOptionsOfAProduct(params) {
    return this.getRequestMethodPost('Products/loadOptionsOfAProduct', params);
  }

  // API V2
  searchForProductByText(data) {
    return this.getRequestMethodPost('Products/searchForProductByText', data);
  }
  // API V2
  postProductReviewsV2(params) {
    return this.getRequestMethodPost('Products/postProductReviewsV2', params);
  }
  // API V2
  searchForProductsByTags(params) {
    return this.getRequestMethodPost('Products/searchForProductsByTags', params);
  }
  //API V2
  getProductsTagsV2(){
    return this.getRequestMethodGet('Products/getProductsTagsV2');
  }
  //API V2
 postAllAttractionsFromDestIdAndTopXV2(params){
  return this.getRequestMethodPost('Attractions/postAllAttractionsFromDestIdAndTopXV2', params);
 }


  loadPriceForAnOptionProduct(params) {
    return this.getRequestMethodPost('Products/loadPriceForAnOptionProduct', params);
  }

  reclculateThePriceWithPromotionCode(params) {
    return this.getRequestMethodPost('Products/reclculateThePriceWithPromotionCode', params);
  }

  makeApayment(params) {
    return this.getRequestMethodPost('Products/makeApayment', params);
  }

  bookAProductHold(params) {
    return this.getRequestMethodPost('Products/bookAProductHold', params);
  }

  bookAProduct(params) {
    return this.getRequestMethodPost('Products/bookAProduct', params);
  }

  getUserIP() {
    const headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin', '*');

    return this.httpClient.get<any>('https://pro.ip-api.com/json?key=aKzkRDch4gHHR0U', { headers: headers });

    // return this.httpClient.get<any>('https://pro.ip-api.com/json?key=NMpjRSmFXE3PFin', { headers: headers });

    // return this.getRequestMethodGet('https://pro.ip-api.com/json?key=51iPzMPnp1eZMmi');
  }x

  getListFatherOfADestinationAndSubCatInfo(destId, catId, subId) {
    const url = 'destId=' + destId + '&catId=' + catId + '&subId=' + subId;
    return this.getRequestMethodGet('Destinations/getListFatherOfADestinationAndSubCatInfo?' + url);
  }

  getProductReviews(code, topX, sortOrder) {
    const url = 'code=' + code + '&topX=' + topX + '&sortOrder=' + sortOrder + '&showUnavailable=false';
    return this.getRequestMethodGet('Products/getProductReviews?' + url);
  }

  //https://api.sandbox.viator.com/partner/reviews/product?productCode=5010SYDNEY&provider=ALL&count=10&start=1&showMachineTranslated=true&reviewsForNonPrimaryLocale=true&ratings=1,2,3,4,5&sortBy=MOST_RECENT_PER_LOCALE

  getScheduleAvailability(params) {
    return this.getRequestMethodPost('Products/availabilitySchedule', params)
  }


  getDestinationNearYouByCityAndRegion(params) {
    return this.getRequestMethodPost('Destinations/getDestinationNearYouByCityAndRegion', params);
  }

  getListCitiesAustralia() {
    return this.getRequestMethodGet('Destinations/getListCitiesAustralia');
  }

  register(params) {
    return this.getRequestMethodPost('HeroUsers', params);
  }

  login(params) {
    return this.getRequestMethodPost('HeroUsers/login', params);
  }

  sentCodeForgotPassword(params) {
    return this.getRequestMethodPost('HeroUsers/sentCodeForgotPassword', params);
  }

  resetPasswordWithEmail(params) {
    return this.getRequestMethodPost('HeroUsers/resetPasswordWithEmail', params);
  }

  verifyCode(params) {
    return this.getRequestMethodPost('HeroUsers/verifyCode', params);
  }
  getHeroUserDetailByEmail(email) {
    return this.getRequestMethodGet(`HeroUsers/getHeroUserDetailByEmail?email=${email}`);
  }
  getMyBooking(email, offset, limit) {
    return this.getRequestMethodGet(`HeroBookings/getListMyBooking?email=${email}&offset=${offset}&limit=${limit}`);
  }

  getAllBooking(sub, offset, limit) {
    return this.getRequestMethodGet(`HeroBookings/getListAllBooking?subdomain=${sub}&offset=${offset}&limit=${limit}`);
  }

  getAllBookingPrev(sub, offset, limit) {
    return this.getRequestMethodGet(`HeroBookings/getListAllBookingPrev?subdomain=${sub}&offset=${offset}&limit=${limit}`);
  }

  cancelBookingDB(bookingId){
    return this.getRequestMethodGet(`HeroBookings/cancelBookingDB?bookingId=${bookingId}`);
  }

  getAllBookingAdmin(offset, limit) {
    return this.getRequestMethodGet(`HeroBookings/getListAllBookingAdmin?offset=${offset}&limit=${limit}`);
  }

  getAllPrevBookingAdmin(offset, limit) {
    return this.getRequestMethodGet(`HeroBookings/getListAllPrevBookingAdmin?offset=${offset}&limit=${limit}`);
  }

  getCancelBookingReasonsService() {
    return this.getRequestMethodGet(`HeroBookings/getCancelBookingReasons`);
  }

  getBookingQuestions() {
    return this.getRequestMethodGet(`Products/getBookingQuestions`);
  }

  getBookingHistory(email, offset, limit) {
    return this.getRequestMethodGet(`HeroBookings/listPastBooking?email=${email}&offset=${offset}&limit=${limit}`);
  }
  getBookerId(booker) {
    return this.getRequestMethodGet(`HeroBookings/getBookerId?text=${booker}`);
  }
  getListHotelPickup(productCode) {
    return this.getRequestMethodGet(`Products/getHotelPickupOfProduct?code=${productCode}`);
  }
  getVoucher(voucherKey) {
    return this.getRequestMethodGet(`HeroBookings/getVoucherData?voucherKey=${voucherKey}`);
  }
  getSettingsByDomain(subdomain) {
    return this.getRequestMethodGet(`Customizations/getSettingsByDomain?subdomain=${subdomain}`);
  }
  getCancelReasons() {
    return this.getRequestMethodGet(`Products/getCancelReasons`);
  }
  getSettingsById(id) {
    return this.getRequestMethodGet(`Customizations/getSettingsById?id=${id}`);
  }
  patchSettingsByDomain(data) {
    return this.httpService.patch(`Customizations/saveSettingsByDomain`, data);
  }

  uploadFile(data) {
    return this.getRequestMethodPost(`Customizations/uploadFile`, data);
  }

  addDomainAws(subdomain) {
    return this.getRequestMethodGet(`Customizations/addDomainAws?subdomain=${subdomain}`);
  }

  getAllSubdomain() {
    return this.getRequestMethodGet(`Customizations/getAllSubdomain`);
  }

  getAllHeroUsers() {
    return this.getRequestMethodGet(`HeroUsers`);
  }

  getReportUsers(offset, limit) {
    return this.getRequestMethodGet(`HeroUsers?filter[skip]=${offset}&filter[limit]=${limit}`);
  }

  getReportBookings(startDate, endDate, offset, limit) {
    return this.getRequestMethodGet(`HeroBookings/getReportBookings?startDate=${startDate}&endDate=${endDate}&offset=${offset}&limit=${limit}`);
  }

  downloadReportBookings(startDate, endDate) {
    return this.getRequestMethodGet(`HeroBookings/downloadReportBookings?startDate=${startDate}&endDate=${endDate}`);
  }

  updateHeroUserSubdomain(id, data) {
    return this.httpService.patch(`HeroUsers/${id}`, data);
  }

  requestEditBooking(id, itineraryId, title, content) {
    let formData = {
      id: id,
      itineraryId: itineraryId,
      title: title,
      content: content
    };
    //console.log(JSON.stringify(formData));
    return this.httpService.post(`HeroBookings/requestEditBooking`, this.getFormUrlEncoded(formData), this.getHeaderFormData());
  }

  getFormUrlEncoded(toConvert) {
    const formBody = [];
    for (const property in toConvert) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(toConvert[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    return formBody.join('&');
  }

  cancelThisBooking(params) {
    return this.httpService.post(`Products/cancelAProduct`, params);
  }

  cancelBookingAdmin(params) {
    return this.httpService.post(`Products/cancelAProduct`, params);
  }

  checkStatusAdmin(bookingRef) {
    return this.getRequestMethodGet(`Products/checkStatus?bookingRef=${bookingRef}`);

  }

  resetPasswordUseCode(email, code, password) {
    let formData = {
      email: email,
      code: code,
      password: password
    };
    //console.log(JSON.stringify(formData));
    return this.httpService.post(`HeroUsers/recoveryPasswordUseCode`, this.getFormUrlEncoded(formData), this.getHeaderFormData());
  }

  loadAvailableDateAndPrice(params) {
    return this.getRequestMethodPost('Products/loadAvailableDateAndPrice', params);
  }

  loadAvailableDate(productCode) {
    return this.getRequestMethodGet('Products/loadAvailableDate?productCode=' +  productCode);
  }

  getTopAttractions() {
    return this.getRequestMethodGet('Attractions/getTopAttractions');
  }

  getTopDestinations() {
    return this.getRequestMethodGet('Destinations/getTopDestinations');
  }

  preSearchTextDestinationAndProduct(keyword) {
    return this.getRequestMethodGet('Destinations/preSearchTextDestinationAndProduct?text=' + keyword);
  }

  loadAvailableTourGrades(params) {
    return this.getRequestMethodPost('Products/loadAvailableTourGrades', params);
  }

  getListRegionOfADestination(keyword) {
    return this.getRequestMethodGet('Destinations/getListRegionOfADestination?text=' + keyword);
  }

  getSubDomain(subdomain) {
    return this.getRequestMethodGet(`Customizations/getSettingsByDomain?subdomain=${subdomain}`);
  }
}