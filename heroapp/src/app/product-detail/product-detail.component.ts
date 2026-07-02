import {
  Component,
  OnInit,
  NgZone,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  ChangeDetectorRef,
  Renderer2,
  AfterViewInit
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDatepickerInputEvent, MatDatepicker } from '@angular/material/datepicker';
import { EventMessage } from '../shared/services/event-message/event-message.service';
import { GMapsService } from '../shared/services/google/google.service';
import { LocalStoreService } from '../shared/services/localstore/localstore.service';
import { HttpRequestService } from '../shared/services/http/http-request.service';
import { DatePickerHeader } from '../shared/services/datepicker/datepicker-header.service';
import { OpenModalService } from '../shared/services/open-modal/open-modal.service';
import { UtilService } from '../shared/services/util/util.service';
import { MESSAGE_EVENT } from '../../constants';
import { MatDialogRef } from '@angular/material';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';

// Component
import { CalendarHeaderComponent } from '../shared/components/calendar-header/calendar-header.component';

import * as _moment from 'moment';

import {
  ModalViewPriceCalendarComponent,
  CalendarItem
} from '../shared/components/modal/modal-view-price-calendar/modal-view-price-calendar.component';
import { idText } from 'typescript';


/* listOfTourImages: Array<any> = []; */

const moment = _moment;
declare var $: any;
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductDetailComponent implements OnInit, AfterViewInit {
  galleryOptions: NgxGalleryOptions[];
  // galleryImages: NgxGalleryImage[];
  // unavailableDates: Date[] = [new Date('2024-03-26')];
  galleryImages: Array<any> = [];
  subDomain: string;
  primaryColor: string;
  secondaryColor: string;
  buttonType: string;
  allowedDates: any;
  allowedBookingDates: Array<any>;
  dateParams: { productCode: string; month: string; year: string; currencyCode: string; };
  newAllowedBookingDates: any;
  filterRes: any;
  scheduleUnavailable: Array<any> = [];
  allowedBookingDatesNextMonth: any;
  noPickup: string;
  pointsOfInterest: any;
  @ViewChild('tabGroup') set tabGroup(content: ElementRef) {
  this.tabsDynamicStyling();
  }
  @ViewChild('picker') datePicker: MatDatepicker<any>;
  @ViewChild('datepickerInput') public datepickerInput: ElementRef;
  @ViewChild('tourOptionsDestination') public tourOptionsDestination: ElementRef;
  @ViewChild('tourOptionsDestinationRef') set tourOptionsRef(tourOptions: ElementRef) {
    this.cdrf.detectChanges();
    if (tourOptions && !this.showTravellersDropdown && !this.isLoading) {
      const tourOptionsDest = this.tourOptionsDestination.nativeElement.getBoundingClientRect();
      const configOptions: ScrollToConfigOptions = {
        offset: tourOptionsDest.y - 20
      };

      this.scrollToService.scrollTo(configOptions);
    }
  }
  @ViewChild('travellersSelectionRef') set travellersRef(travellers: ElementRef) {
    if (this.showTravellersDropdown && travellers) {
      const configOptions: ScrollToConfigOptions = {
        target: travellers,
        offset: 100
      };
      this.scrollToService.scrollTo(configOptions);
    }
  }

  today = new Date();
  tomorrow = moment(this.today).add(1, 'days');
  bookingDate: any = this.tomorrow.format('YYYY-MM-DD');
  date = new FormControl(moment());
  // travelDate = [new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000)];
  travelDate:  any = this.tomorrow.format('YYYY-MM-DD');

  selectedItem: any;
  data: any;
  breadcrumbs: Array<any> = [];
  newPrice: any;
  productLocation = '';

  listOfImages: Array<any> = [];
  cartShopping: Array<any> = [];
  listReviews: Array<any> = [{"reviews":{"Reviews":"Not Loaded","Reviews2":"Not Loaded"}}];
  attractions: Array<any> = [];
  keyword='';
  languageGuideNatural: Array<any> = [];

  currentBookingDate: any;
  code = '';
  currencyCode = 'AUD';
  topXReviews = '1-20';

  productCode=this.code;
  provider='';
  countForReviews: number = 10;
  start='';
  showMachineTranslated='';
  reviewsForNonPrimaryLocale='';
  ratings='';
  sortBy='';

  lat = 51.678418;
  lng = 7.809007;
  travellerCountLeft = 0;
  destinationId = 0;
  offsetReviews = 20;
  limitReviews = 20;
  ageBandId = 1;
  ageBand: any;
  ageBands: any[];
  product: any;
  tourOptions: Array<any> = [];
  currentOptions: Array<any> = [];
  traveller: any;

  isLoading: boolean;
  displayTravellers: string;
  displayTravellersAdults: string;
  listOfTourImages: Array<any> = [];
  listOfTourImages2: Array<any> = [];
  showTravellersDropdown = false;
  calendarHeader = CalendarHeaderComponent;
  newDate: Array<any> = [];
  allValidDates: Array<any> =[];
  unavailableDates: Date[] = []; 
  numCart: number;

  constructor(
    private el: ElementRef,
    private cdrf: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private route: ActivatedRoute,
    public dialogRef: MatDialogRef<ModalViewPriceCalendarComponent>,
    private router: Router,
    private httpRequestService: HttpRequestService,
    private gMapsService: GMapsService,
    private ngZone: NgZone,
    private eventMsg: EventMessage,
    private openModalService: OpenModalService,
    private scrollToService: ScrollToService,
    private datePickerServ: DatePickerHeader,
    private renderer2: Renderer2
  ) {
    this.activatedRoute.params.subscribe((res) => {
      this.code = res.code;
      this.destinationId=res.desId;
      this.keyword=res.keyword;
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
      console.log('Active Routes: ', res);
    });

    $(function () {
      $('.input-select-day').on('focus', function (ev) {
        $(this).trigger('blur');
      });
    });
  }

  datepickerFilter = (d: Date | null): boolean => {
    if (!d) {
      return true; // Allow null or undefined dates
    }

    const currentDate = moment(d);

    for (const unavailableDate of this.unavailableDates) {
      const momentUnavailableDate = moment(unavailableDate);
      if (currentDate.isSame(momentUnavailableDate, 'day')) {
        return false; // Date is unavailable
      }
    }
    return true; // Date is available
  };


  ngOnInit() {
    const domain = /:\/\/([^\/]+)/.exec(window.location.href)[1];
    if (domain.indexOf('.') > -1) {
      const subdomain = domain.split('.')[0];
      if (subdomain) {
        this.subDomain = subdomain;
      } else {
        this.subDomain = 'www';
      }
    }

    const checkCart = LocalStoreService.getInstance().getCartShopping();

    console.log('Check Num Cart: ', checkCart);
    this.numCart = checkCart.length;

    console.log('Check Num Int: ', this.numCart);

    // check local storage for customizations
    const primaryColor = localStorage.getItem('primaryColor');
    const secondaryColor = localStorage.getItem('secondaryColor');
    const buttonType = localStorage.getItem('buttonType');
    if (primaryColor) {
      this.primaryColor = primaryColor;
      this.secondaryColor = secondaryColor;
      this.buttonType = buttonType;
    } else {
      this.getCustomValues();
    }
    console.log("Travel Date Initial: " + this.travelDate);
    this.currencyCode = LocalStoreService.getInstance().getCurrencyCode();
    // this.currentBookingDate = LocalStoreService.getInstance().getCurrentBookingDate();
    this.getProductDetail();
    this.postProductReviewsV2();
    this.AttractionDetail();
    this.galleryOptions = [
      {
        width: '600px',
        height: '400px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];
    this.checkLoader();
    this.initDates();
    this.getScheduleAvailability();
  }

  ngAfterViewInit() {
    this.cdrf.detectChanges();
  }

  listOfTravellersChange() {
    this.travellerCountLeft = this.data.ageBands.map((item) => item.count).reduce((a, b) => a + b, 0); // sum array
    this.travellerCountLeft = this.data.maxTravellerCount - this.travellerCountLeft;
    this.data.ageBands.forEach((item) => {
      item['list'] = [];
      const max = item.count + this.travellerCountLeft;
      for (let i = 0; i <= max; i++) {
        item.list.push({ count: i, value: i.toString() });
      }
    });
  }

  getLanguageNatural() {
    const languageMap: Record<string, string> = {
      de: "German",
      ko: "Korean",
      cmn: "Mandarin",
      ja: "Japanese",
      en: "English",
      it: "Italian",
      fr: "French",
      es: "Spanish"
    };

    if(this.data.languageGuides) {
    this.languageGuideNatural = this.data.languageGuides.map(guide => ({
      ...guide,
      language: languageMap[guide.language] || guide.language
    }));

    console.log('Natural Lang: ', this.languageGuideNatural);
  }}

  convertMinutesToHours(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hourLabel = hours === 1 ? 'hour' : 'hours';
    const minuteLabel = remainingMinutes === 1 ? 'minute' : 'minutes';
    return `${hours} ${hourLabel} and ${remainingMinutes} ${minuteLabel}`;
  }


getLocations() {

  let locationRef;

  if (this.data.itinerary.routes) {
    locationRef = this.data.itinerary.routes[0].pointsOfInterest;
  } else if (this.data.itinerary.pointsOfInterest) {
    locationRef = this.data.itinerary.pointsOfInterest;
  } else if (this.data.itinerary.itineraryItems) {
    locationRef = this.data.itinerary.itineraryItems[0].pointOfInterestLocation;
  } else {
    locationRef = this.data.itinerary.pointOfInterestLocations;
  }
  

  console.log('Points of Interest: ', locationRef);

  locationRef = Array.isArray(locationRef) ? locationRef : [locationRef];
  
  if (locationRef && Array.isArray(locationRef)) {

  let locationsObject = {
    locations: locationRef.map(item => {
      if (item && item.ref) {
        return item.ref;
      } else if (item && item.location.ref) {
        return item.location.ref;
      } else {
        return null; 
      }
    }).filter(ref => ref !== null) 
  };


  if (locationsObject){
  this.httpRequestService.getProductDetailLocation(locationsObject).subscribe(
    async (resp) => {
      try {
        const res = await resp.json();
        if(res) {
        this.pointsOfInterest = res;
        console.log('Points of Interest Res: ', res); 

        this.pointsOfInterest = this.pointsOfInterest.locations.map(location => ({
          label: `${location.name}`,
          value: location.reference,
          lat: location.center.latitude,
          long: location.center.longitude
        })
      );
          console.log('New Points of Interest', this.pointsOfInterest);
          if (this.pointsOfInterest.length > 0) {
            const firstLocation = this.pointsOfInterest[0];
            this.lat = firstLocation.lat;
            this.lng = firstLocation.long;
          }
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    },
    (error) => {
      console.error('HTTP Request Error:', error);
    }
  );
  }
}
}

  // API V2
  AttractionDetail() {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const params = {
      searchTerm: this.keyword, //ripper
      productFiltering: {
        destination:this.destinationId,
        dateRange:{},
        price:{},
        rating:{"from": 0,
        "to": 5},
        durationInMinutes:{},
        flags:["LIKELY_TO_SELL_OUT"],
        includeAutomaticTranslations:true},
      productSorting:{sort:"PRICE",order:"DESCENDING"},
      searchTypes:[
        {searchType:"PRODUCTS",pagination:{start:1,count:1}},
        {searchType:"ATTRACTIONS",pagination:{start:1,count:5}},
        {searchType:"DESTINATIONS",pagination:{start:1,count:1}}],
      currency:this.currencyCode,
    }

    const data = JSON.stringify(params)
    if (!this.destinationId) {
      console.error('Product code is missing or null.');
      return;
        }
        this.httpRequestService.searchForProductByText(params).subscribe(
          (resp) => {
              this.attractions = [];
              const res = JSON.parse(resp.json());
              console.log(res);
              if (res.attractions && res.attractions.totalCount !== undefined && res.attractions.totalCount > 0) {
                  const codeAsNumber = Number(this.code);
                  const filteredData = res.attractions.results.filter(result => result.id === codeAsNumber);
                  this.attractions.push(...filteredData);
                  console.log('Attractions:', JSON.stringify(this.attractions));
                  console.log('First Attraction Name:', this.attractions.length > 0 ? this.attractions[0].name : 'No attractions');
                  this.attractions[0].images.forEach((img: any,i) => {
                    // this.galleryImagesTest.push(img);
                    this.galleryImages.push({
                      small: img.variants[10].url,
                      medium: img.variants[10].url,
                      big: img.variants[12].url
                    });
                  });
              }
          },
          (error) => {
              console.error('Error in HTTP request:', error);
              this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
          }
      );  
  }

  getProductDetail() {
    this.newPrice=[];
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
      // Get Pricing 
      this.httpRequestService.getProductDetailPrice(this.code).subscribe((getPrices) => {
        this.newPrice = getPrices.json();
        // this.unavailableDates.push(getPrices.json().bookableItems[0].seasons[0].pricingRecords[0].timedEntries[0].unavailableDates);
        console.log('Product Price: ', this.newPrice);
        console.log('Get Price: ', this.newPrice.bookableItems);
        console.log('Unavailable Dates: ', this.unavailableDates);
        console.log('This booking date: ', this.bookingDate);
        console.log('This current booking date: ', this.currentBookingDate);

      });

    this.httpRequestService.getProductDetail(this.code).subscribe((resp) => {
      const res = resp.json();
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      if (res) {
        this.data = res;
        console.log('Product Data: ', res);
        this.data.locationref = res.logistics;
        LocalStoreService.getInstance().setStaticPrice(this.newPrice);
        this.getAvailableDates();
        this.destinationId = res.destinations[0].ref;
        console.log('This ageband Pricing Info: ', this.data.pricingInfo);
        this.getListFatherOfADestination(); // Move the function call here

        const questionList = ({
          productCode: res.productCode,
          bookingQuestionList: res.bookingQuestions
        })

        this.getLanguageNatural();
        this.getLocations();

        console.log('Question List: ', questionList);
        // store all booking questions to local storage
        LocalStoreService.getInstance().updateListBookingQuestions(questionList)

        this.ageBands = this.data.pricingInfo.ageBands.map((pricingVal: any) => {
          const minBookReq = this.data.bookingRequirements.minTravelersPerBooking;
          console.log('Min Book: ', minBookReq);
          pricingVal.count = pricingVal.minTravelersPerBooking;
          if(pricingVal.count == 0 && pricingVal.ageBand == "ADULT") {
            pricingVal.count = 1;
          }

          if(pricingVal.ageBand == "ADULT") {
          if (pricingVal.count < minBookReq) {
            pricingVal.minTravelersPerBooking = minBookReq
            pricingVal.count = minBookReq; // Set count to minBookReq if it's less than minBookReq
           }
          }
          
          console.log('Pricing Val: ', pricingVal);
          return {
            ...this.data.pricingInfo.ageBands.find((ageBandsVal: any) => ageBandsVal.bandId === pricingVal.bandId),
            ...pricingVal
          };
        });

        console.log('Age Bands after mapping:', this.ageBands);
        
        const params = {
          productCode: this.code,
          // tourGradeCode: res.tourGrades[0].gradeCode,
          bookingDate: this.currentBookingDate,
          currencyCode: this.currencyCode,
          specialReservation: false
        };

        // this.httpRequestService.getProductDetailLocation(this.data).subscribe((getLocation) => {
        //   const productLocation = getLocation.json();
        //   console.log('Product Location: ', productLocation);
        //   this.data.cityLocation = productLocation.locations[0].address.administrativeArea;
        //   this.data.countryLocation = productLocation.locations[0].address.country;
        //   console.log('City: ', this.data.cityLocation);
        //   console.log('Country',  this.data.countyLocation);
        //   console.log('Location', productLocation);
  
        // })


        // Attached Pricing in Age Bands
        // this.httpRequestService.loadPriceForAnOptionProduct(params).subscribe((resPrices) => {
        //   this.httpRequestService.loadPriceForAnOptionProduct(params).subscribe((resPrices) => {
        //   console.log('Res Pricing: ', resPrices);
        //   const pricing = resPrices.json();
        //   this.bookingDate = this.currentBookingDate = pricing[0].bookingDate;
        //   this.ageBands = pricing[0].ageBandPrices.map((pricingVal: any) => {
        //     pricingVal.prices = pricingVal.prices[0];
        //     pricingVal.count = pricingVal.minimumCountRequired;
        //     if(pricingVal.count == 0 && pricingVal.bandId == 1) {
        //       pricingVal.count = 1;
        //     }
        //     return {
        //       ...this.data.ageBands.find((ageBandsVal: any) => ageBandsVal.bandId === pricingVal.bandId),
        //       ...pricingVal
        //     };
        //   });

        // //   // Set Requirements
        //   this.ageBands = this.ageBands.map((ageBandsVal: any) => {
        //     ageBandsVal.list = ageBandsVal.list.map((listVal: any) => {
        //       if (listVal.count < ageBandsVal.minimumCountRequired || listVal.count > ageBandsVal.maximumCountRequired) {
        //         listVal.disabled = true;
        //       }
        //       return listVal;
        //     });
        //     return ageBandsVal;
        //   });
        // });

        // Get All Supplier Images
        this.data.images.forEach((img: any,i) => {
          // this.galleryImagesTest.push(img);
          this.galleryImages.push({
            small: img.variants[10].url,
            medium: img.variants[10].url,
            big: img.variants[12].url
          });
        });
        this.onChangeMonth();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  getScheduleAvailability() {
    const params = {
      productCodes: [this.code],
    };
  
    console.log('Avail Params: ', params);
    this.httpRequestService.getScheduleAvailability(params).subscribe(resp => {
      const res = resp.json();
      console.log('Avail Schedule: ', res);
      this.scheduleUnavailable = res;
      console.log('Avail Schedule 2', this.scheduleUnavailable);

      //record.timedEntries is undefined - product 86665P3
  
      this.unavailableDates = res.availabilitySchedules.flatMap(schedule =>
        schedule.bookableItems.flatMap(item =>
          item.seasons.flatMap(season =>
            season.pricingRecords.flatMap(record => {
              if (record.timedEntries) {
                return record.timedEntries.flatMap(entry =>
                  entry.unavailableDates.map(dateInfo => new Date(dateInfo.date))
                );
              } else if (record.unavailableDates) {
                return record.unavailableDates.map(dateInfo => new Date(dateInfo.date));
              } else {
                return [];
              }
            })
          )
        )
      );
      
      
  
      console.log('Unavailable Dates: ', this.unavailableDates);
    });
  }
  
  getListFatherOfADestination() {
    console.log('Breadcrumbs destId: ', this.destinationId);
    if (this.destinationId > 0) {
      this.httpRequestService.getListFatherOfADestinationAndSubCatInfo(this.destinationId, 0, 0).subscribe(resp => {
        const res = resp.json();
        this.breadcrumbs = res;
        console.log('Breadcrumbs: ', this.breadcrumbs);
        //this.destination = this.breadcrumbs.filter(item => item.destinationId === this.destinationId)[0];
      });
    }
  }

  getAddress() {
    this.gMapsService.getLatLan(this.data.location).subscribe(
      (result) => {
        this.ngZone.run(() => {
          this.lat = result.lat();
          this.lng = result.lng();
        });
      },
      (
        error // //console.log(error),
      ) => () => {
        // //console.log('Geocoding completed!')
      }
    );
  }

  onMapReady() {
    // if (this.data && this.data.location) {
    //   this.getAddress();
    // }
  }

  goToCheckAvailability(items: any[]) {
    console.log('goToCheckAvailability Items: ', items);
    enableBodyScroll();
    this.choosenTravellers(items);
    this.showTravellersDropdown = false;
    var adult = items.find((itemData: any) => itemData.ageBand === 'ADULT');
    if (typeof adult === 'undefined') {
      adult = 0;
    }
    console.log('goToCheckAvailability Adult: ', adult);
    const traveler = items.find((itemData: any) => itemData.ageBand === 'TRAVELER');
    if (adult.count === 0 && adult.count === 'undefined') {
      this.openModalService.showModalCommon({
        title: 'We’re sorry, this option is not available',
        message: 'This tour or activity option requires at least one adult traveler'
      });
    } else { // Need to fix this
      console.log('Travel Date: ', this.travelDate);
      console.log('Travel Date Current: ', this.currentBookingDate);
      console.log('Travel Date Booking: ', this.bookingDate);

      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
      const params = {
        productCode: this.code,
        // travelDate: this.travelDate[0],
        travelDate: (!this.currentBookingDate) ? this.bookingDate : this.currentBookingDate,
        currency: this.currencyCode,
        paxMix: []
      };
      console.log('Adult Params: ', params);
      items.forEach((itemData: any) => {
        params['paxMix'].push({
          ageBand: itemData.ageBand,
          numberOfTravelers: itemData.count
        });
      });
      this.httpRequestService.loadOptionsOfAProduct(params).subscribe(
        (resp) => {
          this.unavailableDates=[];
          console.log('Bookable Items: ', resp.json());
          this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
          const itemAvail = resp.json().code;

          if(itemAvail == 'NOT_FOUND') {
          this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
          this.openModalService.showModalCommon({
            title: 'No items found',
            message: 'No bookable items found, please choose another date.'
          });
          } else if (resp.json().code == 'BAD_REQUEST') {
            this.openModalService.showModalCommon({
              title: resp.json().code,
              message: resp.json().message
            });
          }
          if(resp.json().bookableItems && resp.json().bookableItems.length > 0) {
          const res = resp.json().bookableItems.filter((resVal: any) => resVal);
          if (Array.isArray(res)) {
            this.tourOptions = res;
            this.tourOptions['currentBookingDate'] = params.travelDate;
          }
          console.log('Bookable Tour Options: ', this.tourOptions);
          if(this.data.productOptions) {
            var i = 0;
            this.data.productOptions.forEach((productOption: any) => {
              console.log('Bookable Products: ', productOption);
              this.tourOptions[i].productOptionCode === this.data.productOptions.productOptionCode 
              console.log('Bookable Match: ', productOption.description);
              this.tourOptions[i]['productOptionDescription'] = productOption.description;
              console.log('Tour Options: ', this.tourOptions, i);
              i++;
            })
          } else {
            console.log('Tour Options Before:', this.tourOptions);
          console.log('Tour Options New:', this.tourOptions);
          }
        }
      }
      );
    }
  }

  // saveAndGoToCartShopping() { // this does not trigger - need to check this
  //   alert('trigger cart');
  //   this.cartShopping = LocalStoreService.getInstance().getCartShopping();
  //   const foundItem = this.cartShopping.filter(item => item.code === this.data.code)[0];
  //   const index = this.cartShopping.indexOf(foundItem);
  //   const data = {
  //     desId: this.data.destinationId,
  //     code: this.data.code,
  //     gradeCode: '',
  //     bookingDate: this.bookingDate.format('YYYY-MM-DD'),
  //     bookingDateFormat: this.bookingDate.format('LL'),
  //     ageBands: this.data.ageBands
  //   };
  //   //console.log(data, this.cartShopping);
  //   if ( index < 0) { // add if it isn't in cart
  //     this.cartShopping.push(data);
  //   } else {
  //     this.cartShopping[index] = data;
  //   }
  //   //console.log(data, this.cartShopping);
  //   LocalStoreService.getInstance().updateCartShopping(this.cartShopping);
  //   this.eventMsg.sendMessage(MESSAGE_EVENT.msg_update_card_number, this.cartShopping.length);
  //   this.router.navigate(['order/']);
  // }

 /*  getProductReviews() {
    const sortOrder = 'REVIEW_RATING_SUBMISSION_DATE_D'; //  Most recent review
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.httpRequestService.getProductReviews(this.code, this.topXReviews, sortOrder).subscribe((resp) => {
      const res = resp.json();
      this.listReviews = this.listReviews.concat(res);
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    });
  }

  onLoadMoreReviews() {
    this.topXReviews = (this.offsetReviews + 1).toString() + '-' + (this.offsetReviews + this.limitReviews).toString();
    this.offsetReviews += this.limitReviews;
    this.getProductReviews();
  } */

  postProductReviewsV2() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const params = {
          productCode: this.code,
          provider: 'ALL',
          count: Number(this.countForReviews), // Ensure count is a number Number(this.count)
          start: 1, // Ensure start is a number Number(this.start)
          showMachineTranslated:true, //Boolean(this.showMachineTranslated)
          reviewsForNonPrimaryLocale:true, //Boolean(this.reviewsForNonPrimaryLocale),
          ratings:[1,2,3,4,5], //Array(this.ratings),
          sortBy: 'HIGHEST_RATING_PER_LOCALE',
    }
    if (!this.code) {
      console.error('Product code is missing or null.');
      return;
  }
    this.httpRequestService.postProductReviewsV2(params).subscribe(
        (resp) => {
          this.listReviews=[];
          const res = resp.json();
          console.log('Show Reviews: ', res.reviews);
          this.listReviews.push(...res.reviews);
          const images = this.scanForImages(res.reviews);
          console.log('List of Images: ', images);

          // this.listOfImages.push(...images);
          if(images && images.length > 0) {
          images.forEach(url => {
            const imageObj = {
              small: url,
              medium: url,
              big: url
            };
            this.listOfImages.push(imageObj);
          });
        }
          console.log('Final Images: ', this.listOfImages);
          console.log('Final Gallery: ', this.galleryImages);

      },
      (error) => {
          console.error('Error in HTTP request:', error);
          this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      });
      }
  
  scanForImages(reviews) {
    const imageUrls = [];
    if(reviews && reviews.length > 0) {
    reviews.forEach(review => {
        if (review.photosInfo && review.photosInfo.length > 0) {
            review.photosInfo.forEach(photoInfo => {
                const photoVersion = photoInfo.photoVersions[4]; // Select the third item from photoVersions array
                if (photoVersion && photoVersion.url) {
                    imageUrls.push(photoVersion.url);
                }
            });
        }
    });
    return imageUrls;
  }
}

  onLoadMoreReviewsV2() {
    this.countForReviews = this.countForReviews+5; // Increase count by 3
    this.postProductReviewsV2();
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
}
  // check what this do?

  // showModalViewPriceCalendar() {
  //   alert('Here');
  //   if (this.currentBookingDate) {
  //     this.bookingDate = this.currentBookingDate;
  //   }
  //   this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
  //   this.data.availableDate = new Date(this.bookingDate);
  //   this.openModalService.showModalViewPriceCalendar(this.data).then((item: CalendarItem) => {
  //     if (item) {
  //       const ageBands = this.data.ageBands;
  //       const ageBandPrices = item.price.tourGrades[0].pricingMatrix[0].ageBandPrices.map((val: any) => {
  //         val.prices = val.prices[0];
  //         return {
  //           ...val,
  //           ...ageBands.find((ageBandVal: any) => ageBandVal.bandId === val.bandId)
  //         };
  //       });
  //       this.ageBands = ageBandPrices;
  //       this.tourOptions = [];
  //       this.bookingDate = item.dateFormat;
  //       this.currentBookingDate = item.dateFormat;
  //       this.showTravellersDropdown = !this.showTravellersDropdown;
  //     }
  //   });
  // }

  getDescription(productOptionCode: string): string {
    const matchedOption = this.data.productOptions.find(
      (option) => option.productOptionCode === productOptionCode
    );
    return matchedOption ? matchedOption.description : 'No description available';
  }

addToCart(currentOption: any, description: string) {
  // Add console log to verify function is being called
  console.log('addToCart function called!');
  console.log('Description: ', description);
  console.log('Current Option: ', currentOption);
  
 // Show deprecation notice and completely disable add to cart functionality
  this.openModalService.showModalCommon({
    title: 'Service Notice',
    message: 'We regret to inform you that this booking service will be discontinued and will no longer accept new reservations. We appreciate your understanding and apologize for any inconvenience this may cause. Please consider alternative booking options for your travel needs.'
  });
  
  // Completely block further execution
  return;
  
  // All the original code below is now unreachable and effectively disabled
  /*
  if(this.numCart >= 1) {
        const confirmCart = this.openModalService.showModalConfirm({
          title: 'Active products in cart',
          message: 'Please continue booking your first item in cart before adding new one. Proceed to the last product?'
        });

        confirmCart.then(gotoCart => {
          if(gotoCart === true) {
          this.router.navigate(['order']);
          }
        })

      } else {
        if (description && description.toLowerCase().includes('pickup')) {
          this.noPickup = 'private';
        } else {
          this.noPickup = 'share';
        }
        console.log('This no pickup: ', this.noPickup);
        currentOption.bookingDate = this.bookingDate;
        currentOption.noPickup = this.noPickup;
        currentOption.allowCustomTravelerPickup = 
        typeof this.data.logistics.travelerPickup !== 'undefined' 
          ? this.data.logistics.travelerPickup.allowCustomTravelerPickup 
          : false,
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
        const listOptionsInfo = {
          // desId: this.data.destinationId,
          productCode: this.code,
          productTitle: this.data.title,
          thumbnailHiResURL: this.data.thumbnailHiResURL,
          bookingDate: this.currentBookingDate,
          // bookingDate: this.travelDate[0],
          // bookingDateFormat: moment(this.currentBookingDate, 'MM-DD-YYYY').format('MMMM DD, YYYY'),
          listOptions: this.tourOptions,
          ageBands: this.ageBands,
          maxTravellerCount: this.data.bookingRequirements.maxTravelersPerBooking,
          minTravellerCount: this.data.bookingRequirements.minTravelersPerBooking,
          currencyCode: this.currencyCode,
          cancellationPolicy: this.data.cancellationPolicy,
          bookingQuestions: this.data.bookingQuestions,
          hotelPickup: this.data.hotelPickup,
          tourGrades: this.data.productOptions,
          noPickup: this.noPickup,
          allowCustomTravelerPickup: typeof this.data.logistics.travelerPickup !== 'undefined' 
          ? this.data.logistics.travelerPickup.allowCustomTravelerPickup 
          : false,
          langServices: this.data.languageGuides ? this.data.languageGuides : {}
        };
        // currentOption['productOptionCode'] = this.code;
        console.log('Add to Cart Options: ', currentOption);

        const list = LocalStoreService.getInstance().getlistOptionsInfo();
        // list.push(listOptionsInfo);
        list.push(currentOption); // use current option instead
        LocalStoreService.getInstance().updateListOptionsInfo(list);
        console.log('List: ', list);

        // update list cart shopping
        this.cartShopping = LocalStoreService.getInstance().getCartShopping();
        console.log('Compare Data: ', this.data);
        const foundItem = this.cartShopping.filter((item) => item.productCode === this.data.productCode);
        const index = this.cartShopping.indexOf(foundItem);
        console.log('Compare Data Ind: ', currentOption);
        const formattedDate = moment(this.bookingDate).format('MMMM DD, YYYY');
        const data = {
          code: this.code,
          destId: this.destinationId,
          gradeCode:  this.data.productOptions,
          gradeTitle: currentOption.productOptionCode,
          gradeDescription: description,
          price: currentOption.totalPrice.price.recommendedRetailPrice,
          bookingDate: this.bookingDate,
          bookingDateFormat: formattedDate,
          ageBands: this.ageBands,
          cancellationPolicy: this.data.cancellationPolicy,
          bookingQuestions: this.data.bookingQuestions,
          hotelPickup: this.data.hotelPickup,
          langServices: listOptionsInfo.langServices,
          noPickup: this.noPickup,
          allowCustomTravelerPickup: typeof this.data.logistics.travelerPickup !== 'undefined' 
          ? this.data.logistics.travelerPickup.allowCustomTravelerPickup 
          : false,
          startTime: (currentOption.startTime) ? currentOption.startTime : ''
        };
        console.log('Compare Data to  : ', data);
        if (index < 0) {
          this.cartShopping.push(data);
        } else {
          this.cartShopping[index] = data;
        }                                                                

        console.log('Compare Data Latest: ', this.cartShopping);

        LocalStoreService.getInstance().updateCartShopping(this.cartShopping);
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_update_card_number, this.cartShopping.length);
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
        this.router.navigate(['order/']);
      }
  */
}

  public onTravellerSelection(items: any[]) {
    this.showTravellersDropdown = !this.showTravellersDropdown;


    if (!this.showTravellersDropdown) {
      this.goToCheckAvailability(items);

    }
  }

  public onClickElseWhere(items: any[]) {
    if (this.showTravellersDropdown) {
      this.goToCheckAvailability(items);
    }
  }

  public onCount(operator: string, isNotAllowed: boolean, index: number) {
    console.log('Index, ', operator, isNotAllowed, index);
    if (!isNotAllowed && operator === 'increment') {
      this.ageBands[index].count += 1;
      console.log('New Age Bands, ', this.ageBands[index].count);

    }

    if (!isNotAllowed && operator === 'decrement') {
      this.ageBands[index].count -= 1;
    }
  }

  public calculateTotal() {
    return this.ageBands.reduce((val1, val2) => {
      return val1 + val2.count;
    }, 0);
  }

  public initDates() { // used to disable dates on date picker
        // initial values
        const today = new Date();
        const initMonth = moment(today).format('MM');
        const initYear = moment(today).format('YYYY');
    
        const initParams = {
          productCode: this.code,
          month: initMonth,
          year: initYear,
          currencyCode: this.currencyCode
        };
        
        // console.log('initParams: ', initParams);
        // this.httpRequestService.loadAvailableDateAndPrice(initParams).subscribe(resp => {
        //   const res = resp.json();
        //   console.log('Res Avail Date Price: ', res);
        //   const allowedDates = res.dates;
        //   this.allowedBookingDates = allowedDates.map(d => {
        //     return d.bookingDate;
        //     })
        //   });
     /*      const allUnavailable = this.tourOptions.every(option => !option.available);
          if (allUnavailable) {
            this.unavailableDates.push(...this.travelDate)
            console.log('unavailableDates ', this.unavailableDates); */
         //API V2 
          // const productCode = this.code;
          // console.log('Params: ', productCode);
          // this.httpRequestService.getDateAvaliableOfAProduct(productCode).subscribe(resp => {
          //   const productOptionCodes = [];
          //   //3 is the # of productOptionCodes, 7 is the # of productOptionCode#Time#
          //   for (let i = 1; i <= 3; i++) {
          //     const optionCodes = [];
          //     for (let j = 1; j <= 7; j++) {
          //         optionCodes.push(`productOptionCode${i}Sched${j}Time${j}`);
          //     }
          //     productOptionCodes.push(optionCodes);
          // }
          //   const res = resp.json();
          //   console.log('Res Avail Date Price: ', productCode, res.bookableItems);
          //   const pricingRecords = res.bookableItems[0].seasons[0].pricingRecords;
          //   console.log(pricingRecords);
          //   pricingRecords.forEach((record, index) => {
          //     console.log(index);
          //     record.timedEntries.forEach((timedEntry, innerIndex) => {
          //       console.log(innerIndex);
          //       console.log(timedEntry.startTime);
          //       const propertyName = `productOptionCode${index + 1}Sched${innerIndex + 1}`;
          //       console.log(propertyName);
          //      /*  this[propertyName].push(...timedEntry.unavailableDates.map(date => date.date)); */
          //     });
          //   });
            
          //   for (let i = 1; i <= 3; i++) {
          //     for (let j = 1; j <= 7; j++) {
          //         console.log('Code' + i + 'Time' + j, this['productOptionCode' + i + 'Time' + j]);
          //     }
          // }
          // });
         

  }

  public checkFilters() {
    this.datePicker.open();  
  }

  public async getAvailableDates(nextMonth?: string) {
    var currentMonth = new Date;
    const getMonth = moment(currentMonth).format('YYYY-MM-DD');
    
    const params = {
      productCode: this.code,
      month: moment(currentMonth).format('MM'),
      year: moment(currentMonth).format('YYYY'),
      // tourGradeCode: this.data.tourGrades[0].gradeCode,
      currencyCode: this.currencyCode
    };
    if (nextMonth) {
      params.month = moment(currentMonth).add(1, 'months').format('MM');
    }
    for (let i = 0; i <= 11; i++) {
      params.month = moment(currentMonth).add(i, 'months').format('MM');
      if((Number(params.month)-1 == 0) && i !== 0) {
        params.year = moment(currentMonth).add(1, 'years').format('YYYY');

      }
    }
    this.httpRequestService.loadAvailableDate(this.code).toPromise().then(resp => {
      const res = resp.json();
      this.allowedBookingDates = []; // Initialize allowedBookingDates as an empty array
      const tempDate = [];
    
      // Loop through the bookableItems array from the response
      res.bookableItems.forEach(item => {
        item.seasons.forEach(season => {
          // Extract startDate and endDate from each season and push to allowedBookingDates
          tempDate.push({
            startDate: season.startDate,
            endDate: season.endDate
          });
        });
      });
      console.log('Allowed booking dates temp: ', tempDate); 
      this.allowedBookingDates = tempDate;
      this.populateAllowedBookingDates();
      this.allowedBookingDates = Array.from(new Set(this.allowedBookingDates));
      console.log('Allowed booking dates: ', this.allowedBookingDates);
    }).catch(error => {
      console.error('Error loading available dates:', error);
    });
  }
  
  filterDates(date: Date | null): boolean {
    console.log('Filt Dates: ', date)
    if (!date) {
      return true; // Disable selection for null dates
    }

    const currentDate = new Date(date);

    // Check if the date falls within any allowed booking date range
    const isAllowedDate = this.allowedBookingDates.some(bookingDate => {
      const startDate = new Date(bookingDate.startDate);
      const endDate = new Date(bookingDate.endDate);
      return currentDate >= startDate && currentDate <= endDate;
  });

  return isAllowedDate; // Enable selection if the date is within an allowed range
};

  populateAllowedBookingDates() {
    // Iterate through each booking period
    this.allowedBookingDates.forEach(bookingPeriod => {
      const start = new Date(bookingPeriod.startDate);
      const end = new Date(bookingPeriod.endDate);
      const datesToAdd: { startDate: string, endDate: string }[] = [];

      // Generate dates in between start and end dates
      while (start <= end) {
        datesToAdd.push({ startDate: start.toISOString().split('T')[0], endDate: start.toISOString().split('T')[0] });
        start.setDate(start.getDate() + 1); // Increment date by 1 day
      }

      // Replace the booking period with the dates added in between
      this.allowedBookingDates.splice(
        this.allowedBookingDates.indexOf(bookingPeriod),
        1,
        ...datesToAdd
      );
    });

    // Flatten the array of arrays into a single array
    this.allowedBookingDates = this.allowedBookingDates.reduce((acc, curr) => acc.concat(curr), []);
    console.log('Flattened Dates: ', this.allowedBookingDates);
  }

  public onChangeDate(event: MatDatepickerInputEvent<any>) {
    const dateSelected = event.value.format('YYYY-MM-DD');
    this.bookingDate = dateSelected;
    console.log('This booking date changed: ', this.bookingDate);
    // this.travelDate.length=0;
    // this.travelDate.push(dateSelected);
    const params = {
      productCode: this.code,
      month: event.value.format('MM'),
      year: event.value.format('YYYY'),
      // tourGradeCode: this.data.tourGrades[0].gradeCode,
      currencyCode: this.currencyCode
    };

    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.httpRequestService
      .loadAvailableDateAndPrice(params)
      .map((res) => res.json())
      .subscribe((item: any) => {
        if (this.travelDate) { // check this
          this.travelDate = this.travelDate;
        }
        console.log('From Res: ', item);
        this.data.availableDate = new Date(this.bookingDate); // use this to check available dates
        // if (item) {
        //   const selectedItem: any = item.dates.find((val: any) => {
        //     return val.bookingDate === dateSelected;
        //   });

        //   const ageBands = this.data.ageBands;
        //   // const ageBandPrices = selectedItem.tourGrades[0].pricingMatrix[0].ageBandPrices.map((val: any) => {
        //   //   val.prices = val.prices[0];
        //   //   return {
        //   //     ...val,
        //   //     ...ageBands.find((ageBandVal: any) => ageBandVal.bandId === val.bandId)
        //   //   };
        //   // });
        //   // this.ageBands = ageBandPrices;
        //   this.tourOptions = [];
        //   this.travelDate = dateSelected;
        //   this.travelDate = dateSelected;
        //   this.showTravellersDropdown = !this.showTravellersDropdown;
        //   // console.log('This booking date: ', this.bookingDate);
        //   // console.log('This current booking date: ', this.currentBookingDate);
        // }

        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      }, error => {
        console.log('Error Month: ', error);
      }
      );
  }

  public scrollToDatepicker() {
    const configOptions: ScrollToConfigOptions = {
      target: this.datepickerInput,
      offset: 100
    };
    this.scrollToService.scrollTo(configOptions);
  }


  private onChangeMonth() {  
    this.datePickerServ.changeMonth.subscribe((activeDate) => {
      // this.dateFilter = (d: Date): boolean => { 
      //   const compareDate = moment(d).format('YYYY-MM-DD');
      //   let x = false;
      //   this.allValidDates.forEach(item => {
      //     item.forEach(data => {
      //       if(data.bookingDate == compareDate) {
      //         x = true;
      //       }
      //     });
      //   })
      //   return x;
      // }
      /* this.dateFilter = (d: Date): boolean => { 
        const compareDate = moment(d).format('YYYY-MM-DD');
        let x = false;
        this.allValidDates.forEach(item => {
          item.forEach(data => {
            if(data.bookingDate == compareDate) {
              x = true;
            }
          });
        })
        return x;
      } */
      if (activeDate) {
        const params = {
          productCode: this.code,
          month: activeDate.format('MM'),
          year: activeDate.format('YYYY'),
          currencyCode: this.currencyCode
        };

        this.httpRequestService
          .loadAvailableTourGrades(params)
          .map((res) => res.json())
          .subscribe((res) => {
            this.datePickerServ.onChangePrice(this.newPrice);
            this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
          }, error => {
            console.log(error)
          }
        );        
      }
    });
  
  }

  private checkLoader() {
    this.eventMsg.onMessage(MESSAGE_EVENT.msg_show_loading).subscribe((loading: boolean) => {
      this.isLoading = loading;
    });
  }

  private choosenTravellers(items: any[]) {
    let displayTravellers = '';
    let index = 0;
    for (const item of items) {
      index++;
      if (item.count) {
        displayTravellers += index > 1 ? ', ' : '';
        displayTravellers += `${item.count} ${item.ageBand}`;
      }
    }
    console.log('Display Travellers:', displayTravellers);

    this.displayTravellers = displayTravellers.replace(",", "");
  }

  getCustomValues() {
    const domain = /:\/\/([^\/]+)/.exec(window.location.href)[1];
    if (domain.indexOf('.') > -1) {
      const subdomain = domain.split('.')[0];
      if (subdomain) {
        this.subDomain = subdomain;
      } else {
        this.subDomain = 'dev';
      }
    }
    this.httpRequestService.getSettingsByDomain(this.subDomain).subscribe(resp => {
      const res = resp.json();
      if(res){
      this.primaryColor = res.primary_color;
      this.secondaryColor = res.secondary_color;
      this.buttonType = res.button_type;
      localStorage.setItem('primaryColor', res.primary_color);
      localStorage.setItem('secondaryColor', res.secondary_color);
      localStorage.setItem('buttonType', res.button_type);
      localStorage.setItem('textColor', res.text_color);
      localStorage.setItem('logoUrl', res.logo_url);
      localStorage.setItem('logoHeight', res.logo_height);
      localStorage.setItem('logoWidth', res.logo_width);
      } else {
        this.primaryColor = "#CC5757";
      }
    });
  }



  private tabsDynamicStyling() {
    const inkClassNames = document.getElementsByClassName('mat-ink-bar');
    const labelClassNames = document.getElementsByClassName('mat-tab-label');
    const labelsClassNames = document.getElementsByClassName('mat-tab-labels');
    const activeClassNames = document.getElementsByClassName('mat-tab-label-active');

    for (let index = 0; index < labelClassNames.length; index++) {
      this.renderer2.setStyle(labelClassNames[index], 'background-color', '#ffffff');
    }

    for (let index = 0; index < activeClassNames.length; index++) {
      this.renderer2.setStyle(activeClassNames[index], 'background-color', this.primaryColor);
    }

    for (let index = 0; index < labelsClassNames.length; index++) {
      this.renderer2.setStyle(labelsClassNames[index], 'border-color', this.primaryColor);
    }

    for (let index = 0; index < inkClassNames.length; index++) {
      this.renderer2.setStyle(inkClassNames[index], 'background-color',this.primaryColor);
    }
  }
}
