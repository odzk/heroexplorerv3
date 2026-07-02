import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgxCarousel } from 'ngx-carousel';
import { EventMessage } from '../shared/services/event-message/event-message.service';
import { GMapsService } from '../shared/services/google/google.service';
import { LocalStoreService } from '../shared/services/localstore/localstore.service';
import { HttpRequestService } from '../shared/services/http/http-request.service';
import { MESSAGE_EVENT, COMMON_VAR } from '../../constants';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  customizeSettings: any;

  // tslint:disable-next-line: max-line-length
  pages = ['/assets/images/home-header-bg-1.jpeg', '/assets/images/home-header-bg-2.jpeg', '/assets/images/home-header-bg-3.jpg']; // NEED MODIFY

  carouselOne: NgxCarousel;
  carouselTwo: NgxCarousel;

  australiaActivities: any;
  currentLocation = {
    city: '',
    region: '',
    country: ''
  };

  listDestination: Array<any> = [];
  listActivitiesNearYou: Array<any> = [];
  listCitiesOFAustraliaStore: Array<any> = [];
  listCitiesOFAustralia: Array<any> = [];
  listProductAtHome: Array<any> = [];


  defaultNoImage = COMMON_VAR.defaultNoImage;
  currentCityId = 0;
  currentExpId = 0;
  cityOfAustraliaId = null;
  destinationNearYouId = 0;
  limitListCities = 10;
  pageSizeListCities = 0;
  primaryColor: string;
  secondaryColor: string;
  subDomain: any;
  constructor(
    private gMapsService: GMapsService,
    private httpRequestService: HttpRequestService,
    private router: Router,
    private eventMsg: EventMessage
  ) {}

  ngOnInit() {
    this.primaryColor = '#CC5757';
    this.secondaryColor = '#28687F';
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0)
  });
  this.getCustomization();

    // compose carousel
    this.carouselOne = {
      grid: { xs: 1, sm: 2, md: 3, lg: 4, all: 0 },
      slide: 2,
      speed: 400,
      interval: 3000,
      point: {
        visible: false
      },
      load: 1,
      touch: true,
      custom: 'banner',
      loop: true
    };

    this.carouselTwo = {
      grid: { xs: 1, sm: 2, md: 3, lg: 3, all: 0 },
      slide: 2,
      speed: 400,
      point: {
        visible: false
      },
      load: 1,
      touch: true,
      custom: 'banner',
      loop: true
    };

    // check list destination exist, if not, call api to get list destinations
    this.listDestination = LocalStoreService.getInstance().getListDestinations();
    if (this.listDestination.length === 0) {
      this.getAllDestination();
    }
    this.setCurrentLocation();
  }

  getAllDestination() {
    this.httpRequestService.getAllDestinations().subscribe((resp) => {
      const res = resp.json();
      this.listDestination = res;
      LocalStoreService.getInstance().setListDestinations(res);
    });
  }

  getDestinationIdNearYou() {
    const params = {
      city: this.currentLocation.city,
      region: this.currentLocation.region
    };

    console.log('Dest Near: ', params);
    this.httpRequestService.getDestinationNearYouByCityAndRegion(params).subscribe((resp) => {
      const res = resp.json();
      this.destinationNearYouId = res;
      console.log('Region: ', this.destinationNearYouId);
      this.getAllCategoriesOfDestinationNearYou();
    });
  }

  getAllCategoriesOfDestinationNearYou() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.httpRequestService.getAllCategoriesOfADestination(this.destinationNearYouId).subscribe((resp) => {
      const res = resp.json();
      //console.log('Near You:', res);
      this.listActivitiesNearYou = res;
      this.getListProductAtHome();
    });
  }

  getListProductAtHome() {
    const params = {
      filtering: {
        destination: this.destinationNearYouId,
        confirmationType: 'INSTANT',
        tags: [21972
        ]
    },
    sorting: {
        sort: 'PRICE',
        order: 'ASCENDING'
    },
    pagination: {
        start: 1,
        count: 20
    },
    currency: 'AUD'
    }

    this.httpRequestService.searchForProductsByTextAndCodeHP(params).subscribe((resp) => {
      const res = resp.json();
      this.listProductAtHome = res.products;
      console.log('list of prod: ', res.products);
      this.getListRegionOfADestination();
    });
  }

  getListRegionOfADestination() {
    console.log('Current Country: ', this.currentLocation.country);
    this.httpRequestService.getListRegionOfADestination(this.destinationNearYouId).subscribe((resp) => {
      let tempList = [];
      let temp = [];
      const res = resp.json();
      console.log('Current Country Res: ', res);
      res.forEach(function(item) {
        if (!temp.includes(item['primaryDestinationName'])) {
          tempList.push(item);
          temp.push(item['primaryDestinationName']);
        }
      });
      this.listCitiesOFAustralia = tempList;
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    });
  }

  // async getThumbImageByDestinationId(item) {
  //   if (item.thumbnailUrl === undefined || item.thumbnailUrl === null) {
  //     await this.httpRequestService.getAllCategoriesOfADestination(item.destinationId).subscribe((resp) => {
  //       const res = resp.json();
  //       // //console.log(res)
  //       const location = res.length > 0 ? res[0] : null;
  //       item.thumbnailUrl =
  //         location != null && location.thumbnailHiResURL != null && location.thumbnailHiResURL !== undefined
  //           ? location.thumbnailHiResURL
  //           : location.thumbnailURL;
  //       // //console.log(item.thumbnailUrl)
  //       const index = this.listCitiesOFAustralia.indexOf(item);

  //       this.listCitiesOFAustralia[index] = item;
  //     });
  //   }
  // }

  goToList(destId, catId, subId) {
    if (destId > 0) {
      this.router.navigate(['list-result/' + destId + '/' + catId + '/' + subId]);
      // this.router.navigate(['list-result/' + destId ]);
    }
  }
  onmoveFn(event: any) {
    // tslint:disable-next-line: max-line-length
    //this.cityOfAustraliaId = (this.listCitiesOFAustralia && event && this.listCitiesOFAustralia.length > 0 && this.listCitiesOFAustralia.length > event.currentSlide ) ? this.listCitiesOFAustralia[event.currentSlide].destinationId : 0;
  }

  setCurrentLocation() {
    this.httpRequestService.getUserIP().subscribe((resp) => {
      const res = resp;
      this.currentLocation = res;
      const params = {
        city: this.currentLocation.city,
        region: this.currentLocation.region
      };
      this.httpRequestService.getDestinationNearYouByCityAndRegion(params).subscribe((resp) => {
        const res = resp.json();
        localStorage.setItem('currentDestId', res);
        console.log('Current Dest Id: ', localStorage.getItem('currentDestId'));
      });
      this.getDestinationIdNearYou();
    });
  }

  onMapReady(map) {
    this.gMapsService.getCurrentLocation().subscribe(
      result => {
        console.log('Current Location:', result);
        // Now you can use the current location data in your map or other functionality
      },
      error => {
        console.error('Error getting current location:', error);
      },
      () => {
        console.log('Geocoding completed!');
      }
    );
  }

getCustomization() {
  const domain = /:\/\/([^\/]+)/.exec(window.location.href)[1];
  if (domain.indexOf('.') > -1) {
    const subdomain = domain.split('.')[0];
    if (subdomain) {
      this.subDomain = subdomain;
    } else {
      this.subDomain = 'www';
    }
  }
  this.httpRequestService.getSettingsByDomain(this.subDomain).subscribe((resp) => {
    const res = resp.json();
    console.log('mysql: ', res);
    if(res) {
    this.primaryColor = res.primary_color;
    this.secondaryColor = res.secondary_color;
    }
    })
  }
}