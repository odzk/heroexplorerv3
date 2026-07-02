import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { EventMessage } from '../../services/event-message/event-message.service';
import { HttpRequestService } from '../../services/http/http-request.service';
import { LocalStoreService } from '../../services/localstore/localstore.service';
import { MESSAGE_EVENT } from '../../../../constants';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';



@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {

  destination: any;
  subcategorie: any;
  location = '' ;
  keyword = '';
  primaryColor: string;
  secondaryColor: string;
  textColor: string;

  listActivities: Array<any> = [
    { subcategoryId: -1, subcategoryName: 'Choose destination first'}
  ];
  listDestination: Array<any> = [];
  listTopAttractions: Array<any> = [];
  listTopDestinations: Array<any> = [];
  listDestinationResults: Array<any> = [];
  listTourResults: Array<any> = [];

  isShowListTop = false;
  errorDestination = false;
  isShowListResults = false;

  private subscription: ISubscription;
  private subscriptionRoute: ISubscription;
  private searchSubject = new Subject<string>();
  customizeSettings: any;
  currentDestId: any;

  //API V2
  destinationId: any = 22;
  listProducts: Array<any> = [];
  listAttractions: Array<any> = [];
  listDestinations: Array<any> = [];
  listCombined: Array<any> = [];
  currentDate: any = new Date().toISOString().slice(0, 10);

  constructor(private httpRequestService: HttpRequestService,
              private router: Router,
              private eventMsg: EventMessage) {
    // this.subscription = this.eventMsg.onMessage(MESSAGE_EVENT.msg_get_list_destination)
    //   .subscribe((res: any) => {
    //     this.listDestination = res;
    //   });
    //
    // this.subscriptionRoute = this.router.events.filter(event => event instanceof NavigationEnd)
    //   .subscribe((href: any) => {
    //     this.location = href.url;
    //     if (this.location !== '/') {
    //       this.listDestination = LocalStoreService.getInstance().getListDestinations();
    //       if (this.listDestination.length === 0) {
    //         this.getListDestinations();
    //       }
    //     }
    //   });
  }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(500), // Wait for 300 milliseconds after the user stops typing
      distinctUntilChanged() // Only trigger the search if the keyword has changed
    ).subscribe((keyword: string) => {
      this.search(keyword);
    });
    this.getTopAttractions();
    this.getTopDestinations();
  //   if(localStorage.getItem('currentDestId')) {
  //   this.currentDestId = localStorage.getItem('currentDestId');
  //   } else {
  //     this.currentDestId = 363;
  //   }
  //   this.currentDestId = 0;
  //   this.primaryColor = localStorage.getItem('primaryColor');
  // }
    if(localStorage.getItem('currentDestId')) {
    this.destinationId = localStorage.getItem('currentDestId');
    } else {
      this.destinationId = 22;
    }
    this.primaryColor = localStorage.getItem('primaryColor');
  }

  // getListDestinations() {
  //   this.httpRequestService.getAllDestinations().subscribe(resp => {
  //     const res = resp.json();
  //     this.listDestination = res;
  //     LocalStoreService.getInstance().setListDestinations(res);
  //   });
  // }

  getTopAttractions() {
    this.httpRequestService.getTopAttractions()
      .map(res => res.json())
      .subscribe(res => {
      this.listTopAttractions = res;
      console.log(this.listTopAttractions);
    });
  }

  getTopDestinations() {
    this.httpRequestService.getTopDestinations()
      .map(res => res.json())
      .subscribe(res => {
        this.listTopDestinations = res;
      });
  }

  // destinationChange() {
  //   this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
  //   this.listActivities = [{
  //     subcategoryName: 'Activity',
  //     categoryId: 0,
  //     subcategoryId: 0
  //   }];
  //   this.httpRequestService.getAllCategoriesOfADestination(this.destination.destinationId).subscribe(resp => {
  //     const res = resp.json();
  //     res.forEach(item => {
  //       this.listActivities = this.listActivities.concat(item.subcategories);
  //     });
  //     this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
  //   });
  // }
  //
  // activityChange() {
  //   if (this.subcategorie.subcategoryId === -1) {
  //     this.subcategorie.subcategoryId = 0;
  //   }
  // }

  // search() {
  //   if (this.destination && this.destination.destinationId > 0) {
  //     let catId = 0;
  //     let subId = 0;
  //     if (this.subcategorie) {
  //       catId = this.subcategorie.categoryId;
  //       subId = this.subcategorie.subcategoryId;
  //     }
  //     this.router.navigate(['list-result/' + this.destination.destinationId + '/' + catId + '/' + subId + '/' + this.keyword]);
  //   } else {
  //     this.errorDestination = true;
  //     setTimeout(() => this.errorDestination = false, 2000);
  //   }
  // }

  onSearchInputChange(keyword: string) {
    this.searchSubject.next(keyword);
    this.isShowListResults = true;
  }

  search(keyword: string) {
    const endDate = new Date(this.currentDate);
    endDate.setDate(endDate.getDate() + 30); // Add 30 days
    const formattedEndDate = endDate.toISOString().slice(0, 10);

      if (this.keyword.length <= 2) {
        return; // Exit early if keyword is too short
      }

      const params = {
        searchTerm: keyword,
        productFiltering: {
          destination: this.destinationId,
          dateRange: {
            from: this.currentDate,
            to: formattedEndDate
          },
          price: {},
          rating: {
            from: 0,
            to: 5
          },
          durationInMinutes: {},
          flags: ["LIKELY_TO_SELL_OUT"],
          includeAutomaticTranslations: true
        },
        productSorting: {
          sort: "PRICE",
          order: "DESCENDING"
        },
        searchTypes: [
          {
            searchType: "PRODUCTS",
            pagination: { start: 1, count: 10 }
          },
          {
            searchType: "ATTRACTIONS",
            pagination: { start: 1, count: 10 }
          },
          {
            searchType: "DESTINATIONS",
            pagination: { start: 1, count: 10 }
          }
        ],
        currency: "AUD"
      };
      console.log('Search Params: ', params);
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.httpRequestService.searchForProductByText(params)
        .map(res => res.json())
        .subscribe(res => {
          console.log('Search Keyword: ', keyword);
          console.log('Search Res: ', res);

          if(res.destinations.results && res.destinations.results.length > 0) this.listDestinationResults = res.destinations.results.splice(0, 10);
          if(res.products.results && res.products.results.length > 0) this.listTourResults = res.products.results.splice(0, 10);

          console.log(this.listDestinationResults);
          console.log( this.listTourResults);
          this.isShowListTop = false;
          this.isShowListResults = true;
          this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
        });
    } 
 

  
  // API V2
//   search(e) {
//     if (this.keyword.length > 2) {
//       var timerId =0;
//       var timerId = setTimeout(() => {
//       this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
//     const params = {
//       searchTerm: this.keyword, //ripper
//       productFiltering: {
//         destination:this.destinationId,
//         dateRange:{},
//         price:{},
//         rating:{"from": 0,
//         "to": 5},
//         durationInMinutes:{},
//         flags:["LIKELY_TO_SELL_OUT"],
//         includeAutomaticTranslations:true},
//       productSorting:{sort:"PRICE",order:"DESCENDING"},
//       searchTypes:[
//         {searchType:"PRODUCTS",pagination:{start:1,count:5}},
//         {searchType:"ATTRACTIONS",pagination:{start:1,count:5}},
//         {searchType:"DESTINATIONS",pagination:{start:1,count:5}}],
//       currency:"AUD",
//     }

//     console.log('XXXXX' + JSON.stringify(params));
//     const data = JSON.stringify(params)
//     if (!this.destinationId) {
//       console.error('Product code is missing or null.');
//       return;
//   }
//       this.httpRequestService.searchForProductByTextV2(params).subscribe(
//         (resp) => {
//          this.listDestinations=[];
//          this.listAttractions=[];
//          this.listProducts=[];
//          this.listCombined=[];

//           const res =JSON.parse(resp.json());
//           console.log(res); 
//           if(res.destinations && res.destinations.totalCount !== undefined && res.destinations.totalCount>0){
//             this.listDestinations.push(res.destinations.results);
//             console.log('Destinations: ' + JSON.stringify(this.listDestinations));
//             console.log('Destinations: ' + JSON.stringify(this.listDestinations[0][0].name));
//           }
//           if(res.attractions && res.attractions.totalCount !== undefined && res.attractions.totalCount>0){
//             this.listAttractions.push(res.attractions.results);
//             console.log('Attractions: '+JSON.stringify(this.listAttractions));
//             console.log('Attractions: '+JSON.stringify(this.listAttractions[0][0].name));
//           }
//           if(res.products && res.products.totalCount !== undefined && res.products.totalCount>0){
//             this.listProducts.push(res.products.results);
//             console.log('Products: '+ JSON.stringify(this.listProducts));
//             console.log('Products: '+ JSON.stringify(this.listProducts[0][0].title));
//           }
//           this.listCombined = [...this.listProducts[0], ...this.listAttractions[0]];
//       },
//       (error) => {
//           console.error('Error in HTTP request:', error);
//           this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
//       }
//   )
//           this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
//           this.isShowListTop = true;
//           this.isShowListResults = true;
//         }, 1000);
//   }
// }

  showListTop() {
    this.isShowListTop = true;
    this.isShowListResults = true;
  }

  closeListTop() {
    this.isShowListTop = false;
    this.isShowListResults = false;
  }

  ngOnDestroy() {
    // this.subscription.unsubscribe();
    // this.subscriptionRoute.unsubscribe();
  }
}
