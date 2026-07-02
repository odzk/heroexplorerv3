import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { EventMessage } from '../shared/services/event-message/event-message.service';
import { HttpRequestService } from '../shared/services/http/http-request.service';
import { LocalStoreService } from '../shared/services/localstore/localstore.service';
import { UtilService } from '../shared/services/util/util.service';
import { MESSAGE_EVENT } from '../../constants';

import * as _moment from 'moment';
import { DeviceDetectorService } from 'ngx-device-detector';

const moment = _moment;

@Component({
  selector: 'app-list-result',
  templateUrl: './list-result.component.html',
  styleUrls: ['./list-result.component.scss']
})
export class ListResultComponent implements OnInit {
  today = new Date();
  startDate: any = moment(this.today).format('YYYY-MM-DD');
  endDate: any = moment(this.today).add(7, 'days').format('YYYY-MM-DD');
  startDateForm = new FormControl(this.startDate);
  endDateForm = new FormControl(this.endDate);
  currencyCode: any;
  destination: any;
  breadcrumbs: Array<any> = [];
  listProducts: Array<any> = [];
  listImagesHeader: Array<any> = [];
  priceRange: Array<any> = [0, 10000];
  /*  listOfSort: Array<any> = [
    { sort: 'TRAVELER_RATING', name: 'Top rated' },
    { sort: 'TOP_SELLERS', name: 'Most popular' },
    { sort: 'PRICE_FROM_D', name: 'Price (High - Low)' },
    { sort: 'PRICE_FROM_A', name: 'Price (Low - High)' }
  ]; */

  //V2
  listOfTags: Array<any> =[];
  tagId =21972;
  //V2
  listOfSort: Array<any> = [
    { sort: {sort: "TRAVELER_RATING",order: "DESCENDING"}, name: 'Top rated' },
    { sort: {sort: "PRICE",order: "DESCENDING"}, name: 'Price (High - Low)' },
    { sort: {sort: "PRICE",order: "ASCENDING"}, name: 'Price (Low - High)' }
  ];
  sort = {sort: "TRAVELER_RATING",order: "DESCENDING"};
  //V2
  listOfDuration: Array<any> = [
    { sort: {"from": 0, "to": 3600}, name: 'Up to 1 hour' },
    { sort: {"from": 3600, "to": 14400}, name: '1 to 4 hours ' },
    { sort: {"from": 14400, "to": 86400}, name: '4 hours to 1 day' },
    { sort: {"from": 86400, "to": 259200}, name: '1 to 3 days' },
    { sort: {"from": 259200, "to": 8640000}, name: '3+ days' } 
  ];
  durationInMinutes={"from": 0, "to": 3600};
  //V2
  pagination: Array<any> = [{start: 1,count: 100}];
  //V2
  rating: Array<any> = [{from: 1,count: 5}];


  /* 
  listOfDuration: Array<any> = [
    { minDuration: 0, maxDuration: 3600, name: 'Up to 1 hours' },
    { minDuration: 3600, maxDuration: 4 * 3600, name: '1 to 4 hours ' },
    { minDuration: 4 * 3600, maxDuration: 24 * 3600, name: '4 hours to 1 day' },
    { minDuration: 24 * 3600, maxDuration: 3 * 24 * 3600, name: '1 to 3 days' },
    { minDuration: 3 * 24 * 3600, maxDuration: 100 * 24 * 3600, name: '3+ days' }
  ]; */
  listOfCategories: Array<any> = [];
  listOfSubCategories: Array<any> = [];

  duration = {
    minDuration: 0,
    maxDuration: 3600,
    name: ''
  };

  imgHeaderUrl = {
    thumbnailHiResURL: ''
  };

  subcategory = {
    subcategoryName: '',
    subcategoryId: 0,
    categoryId: 0
  };

  durationResult = '';
  topX = '1-100';
  /* sort = {sort: "TRAVELER_RATING",order: "DESCENDING"}; */
  keyword = '';
  startDateFormat = '';
  endDateFormat = '';
  subcategoryName = '';

  page = 1;
  destinationId = 0;
  subId = 0;
  catId = 0;
  pageSize = 100;
  limit = 100;
  itemsPerPage = 12;
  minPrice = null;
  maxPrice = null;
  imagesHeaderIndex = 0;
  errorSelectDateFrom = false;
  errorSelectDateTo = false;
  isStopLoadMore = false;
  isShowFilter = false;
  isLoading = true;

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  getObjectValues(obj: any): string[] {
    return Object.values(obj);
  }

  dateFromFilter = (d: Date): boolean => {
    // Prevent booking date < today
    return d > this.today;
  };

  dateToFilter = (d: Date): boolean => {
    // Prevent booking date < today
    return d > this.today && d > this.startDate;
  };

  constructor(
    private httpRequestService: HttpRequestService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private eventMsg: EventMessage,
    private deviceService: DeviceDetectorService
  ) {
    this.activatedRoute.params.subscribe(res => {
      if (res.keyword) {
        this.keyword = res.keyword;
      }
      console.log('Activated Route: ', this.activatedRoute);
      console.log('Activated Keyword: ', this.keyword);

      this.destinationId = +res['desId']; // (+) converts string 'id' to a number
      this.subId = +res['subId'];
      this.catId = +res['catId'];

      console.log('Activated destId: ', this.destinationId);


      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
      this.isShowFilter = this.deviceService.isMobile();
      this.currencyCode = LocalStoreService.getInstance().getCurrencyCode();
      this.setDefault();
      this.getImagesHeader();
   /*    this.searchForProductsByDatePriceDurationAndCategory(); */
      this.searchForProductsByTags();
      this.getProductsTagsV2();
      this.getListFatherOfADestination();
      // this.getAllCategories();
    });
  }

    /* //V2
    filtering: Array<any> = [{
      destination: this.destinationId,
      tags: [this.tagId],
      flags: ["FREE_CANCELLATION"],
      lowestPrice: 5,
      highestPrice: 10000000,
      startDate: this.startDate,
      endDate: this.endDate,
      includeAutomaticTranslations: true,
      confirmationType: "INSTANT",
      durationInMinutes: this.durationInMinutes,
      rating: this.rating[0]
              }] */

  ngOnInit() {
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
  }

  setDefault() {
    this.page = 1;
    this.topX = '1-100';
    this.listProducts = [];
  }

  //API V2
  setDefaultV2() {
    this.page = 1;
    this.listProducts = [];
  }

  getAllCategories() { // old API no longer exists
    this.httpRequestService.getAllCategoriesOfADestination(this.destinationId).subscribe(resp => {
      this.listOfCategories = this.listOfCategories.concat({id: 0, groupName: 'Select category'}, resp.json());
    });
  }


  getListFatherOfADestination() {
    if (this.destinationId > 0) {
      this.httpRequestService.getListFatherOfADestinationAndSubCatInfo(this.destinationId, this.catId, this.subId).subscribe(resp => {
        const res = resp.json();
        this.breadcrumbs = res;
        this.destination = this.breadcrumbs.filter(item => item.destinationId === this.destinationId)[0];
      });
    }
  }

  getImagesHeader() {
    if (this.destinationId > 0) {
      const params = {
        topX: '1-15',
        destId: this.destinationId,
        sortOrder: 'RECOMMENDED'
      };
      this.httpRequestService.listTopAttractionOfADestination(params).subscribe(resp => {
        const res = resp.json();
        if (res !== null && res.length > 0) {
          this.listImagesHeader = res;
          this.listImagesHeader[this.imagesHeaderIndex].thumbnailHiResURL = UtilService.getInstance().toHttps(
            this.listImagesHeader[this.imagesHeaderIndex].thumbnailHiResURL
          );

          this.imgHeaderUrl = this.listImagesHeader[this.imagesHeaderIndex];
          this.changeImageHeader();
        } else {
          this.imgHeaderUrl.thumbnailHiResURL = 'assets/images/galerry-bg.png';
        }
      });
    } else {
      this.imgHeaderUrl.thumbnailHiResURL = 'assets/images/galerry-bg.png';
    }
  }

  changeImageHeader() {
    setTimeout(() => {
      const newImg = this.listImagesHeader[(this.imagesHeaderIndex += 1)];
      if (newImg) {
        newImg.thumbnailHiResURL = UtilService.getInstance().toHttps(newImg.thumbnailHiResURL);
        this.imgHeaderUrl = newImg;
      }
      if (this.imagesHeaderIndex === this.listImagesHeader.length) {
        // out of images
        this.imagesHeaderIndex = 0;
      }
      this.changeImageHeader();
    }, 30000);
  }

 /*  searchForProductsByDatePriceDurationAndCategory() {
    this.isLoading = true;
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    let params = {};
    if (this.destinationId == 0) {
      params = {
        topX: this.topX,
        destId: 0,
        currencyCode: this.currencyCode,
        searchTypes: ['PRODUCT'],
        text: this.keyword,
        sortOrder: this.sort
      };
    } else {
      params = {
        topX: this.topX,
        destId: this.destinationId,
        currencyCode: this.currencyCode,
        searchTypes: ['PRODUCT', 'DESTINATION'],
        text: this.keyword,
        sortOrder: this.sort,
        // startDate: this.startDate.format('YYYY-MM-DD'),
        // endDate: this.endDate.format('YYYY-MM-DD')
      };
      if (this.catId) {
        params['catId'] = this.catId;
      }
      if (this.subId) {
        params['subCatId'] = this.subId;
      }
    }

    // if (this.subcategory && this.subcategory.subcategoryName.length > 0) {
    //   params['catId'] = this.subcategory.categoryId;
    //   params['subCatId'] = this.subcategory.subcategoryId;
    // }

    // if (this.startDateFormat.length) {
    //   params['startDate'] = this.startDateFormat;
    // }
    // if (this.endDateFormat.length) {
    //   params['endDate'] = this.endDateFormat;
    // }
    // //console.log(JSON.stringify(params))
    
    this.httpRequestService.searchForProductsByTextAndCode(params).subscribe(resp => {
      const res = resp.json();
      var resData = res.data;
      console.log('raw data: ', resData);


      if(resData.length) {
        for (let i = 0; i < resData.length; i++) {
          if (this.destinationId == 0) {
            this.listProducts = this.listProducts.concat(resData[i].data);
          } else {
            this.listProducts = this.listProducts.concat(resData[i]);
          }
        }
      } else {

      this.listProducts = this.listProducts.concat(resData);
      console.log('Product List: ', this.listProducts);
      }
      
      this.isLoading = false;
      if (resData.length === 0) {
        // stop load more
        this.isStopLoadMore = true;
      }
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    });
  } */

  //API V2
  getProductsTagsV2() {
    // this.httpRequestService.getProductsTagsV2().subscribe(resp => {
    //   this.listOfTags = [];
    //   this.listOfTags.push({value:21972,key:'Excellent Quality'},{value:21971,key:'Viator Plus'})
    //   const res = resp.json();
    //   res.tags.slice(0, 20).forEach(tag => {
    //     const tagObject = {
    //       value: tag.tagId,
    //       key: tag.allNamesByLocale.en
    //     };
    //     this.listOfTags.push(tagObject);
    //   });
    // });
    this.listOfTags = [];
    this.listOfTags.push(
      { 
        value: 21972,
        key: 'Excellent Quality'
      },
      {
        value: 22143,
        key: 'Best Conversion',
      },
      {
        value: 22083,
        key: 'Likely To Sell Out',
      },
      {
        value: 11940,
        key: 'Once in a Lifetime',
      },
      {
        value: 21074,
        key: 'Unique experiences',
      },
      {
        value: 6226,
        key: 'Best Value',
      },
      {
        value: 21912,
        key: 'Tickets & Passes',
      },
      {
        value: 21074,
        key: 'Unique Experiences',
      },
      {
        value: 21701,
        key: 'Cruises & Sailing',
      },
      {
        value: 21516,
        key: 'Shows & Performances',
      },
      {
        value: 21732,
        key: 'Tours by Duration',
      },
      {
        value: 21913,
        key: 'Tours, Sightseeing & cruise',
      },
      {
        value: 21725,
        key: 'Sightseeing Tours',
      },
      {
        value: 21715,
        key: 'How To get Around',
      },
      {
        value: 21759,
        key: 'Traditional Wellness',
      },
      {
        value: 21488,
        key: 'Wellness Classes',
      },
      {
        value: 21509,
        key: 'Arts & Design'
      }
    )
    console.log('List of Tags', this.listOfTags);
  }
 
        //Tickets & Passes 21912
        // Unique Experiences 21074,
        // Cruises & Sailing 21701 
        // Shows & Performances 21516
        // Tours by Duration 21732
        // Tours, Sightseeing & cruise 21913
        // Sightseeing Tours 21725
        // How To get Around 21715
        // Traditional Wellness 21759
        // Wellness Classes  21488
        // Arts & Design 21509

  // API V2
  searchForProductsByTags() {
    this.isLoading = true;
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    let params = {};
    console.log('DESTINATION ID', this.destinationId);
    console.log('TAG ID', this.tagId);
    console.log('DURATION',this.durationInMinutes);
    if (this.destinationId === 0) {
      params = {
          filtering: {destination: 22,tags: [21972],
            flags: ["FREE_CANCELLATION"],
            lowestPrice: 5,
            highestPrice: 10000000,
            startDate: this.startDate,
            endDate: this.endDate,
            includeAutomaticTranslations: true,
            confirmationType: "INSTANT",
            durationInMinutes: this.durationInMinutes,
            rating: this.rating[0]
                    },
          sorting: this.sort,
          pagination: this.pagination[0],
          currency: this.currencyCode
      };
      console.log("RUNNING IF DESTINATIONID === 0");
    } else {
      params = {
        filtering: {
          destination: this.destinationId,
          tags: [this.tagId],
          flags: ["FREE_CANCELLATION"],
          lowestPrice: 5,
          highestPrice: 10000000,
          startDate: this.startDate,
          endDate: this.endDate,
          includeAutomaticTranslations: true,
          confirmationType: "INSTANT",
          durationInMinutes: this.durationInMinutes,
          rating: this.rating[0]
                  },
        sorting: this.sort,
        pagination: this.pagination[0],
        currency: this.currencyCode
                };
                console.log("RUNNING IF DESTINATIONID != 0");
                console.log('Tags Params: ', params);
    }
    this.httpRequestService.searchForProductsByTags(params).subscribe(resp => {
      const res = resp.json();
      var resData = res.products;
      console.log(resData.length);
      if (!resData || resData.length === 0) {
        // stop load more
        this.isStopLoadMore = true;
      }
      if(resData.length) {
        for (let i = 0; i < resData.length; i++) {
          if (this.destinationId == 0) {
            this.listProducts = this.listProducts.concat(resData[i].data);
          } else {
            this.listProducts = this.listProducts.concat(resData[i]);
          }
        }
      } else {
      this.listProducts = this.listProducts.concat(resData);
      console.log('Product List V2: ', this.listProducts);
      }
      console.log('Product List V2: ', this.listProducts);
      this.isLoading = false;
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    });
  }

  //V2
  sortChange() {
    console.log('Selected Tag ID:', this.tagId);
    console.log('Selected Sort:', this.sort);
    console.log('Selected Duration', this.durationInMinutes);
    this.setDefault();
    this.searchForProductsByTags();
  }

  // sortChange() {
  //   this.setDefault();
  //   /* this.searchForProductsByDatePriceDurationAndCategory(); */
  // }

  categoryChange() {
    this.subId = 0;
    this.listOfSubCategories = [];

    let tempCategory = this.listOfCategories.find(el => el.id == this.catId);
    if(tempCategory && tempCategory.subcategories && tempCategory.subcategories.length > 0) {
      this.listOfSubCategories = this.listOfSubCategories.concat(
        {subcategoryId:0, subcategoryName:'Select subcategory'},
        tempCategory.subcategories
      );
    }

    this.setDefault();
     /*    this.searchForProductsByDatePriceDurationAndCategory(); */
     this.searchForProductsByTags();
  }

  subCategoryChange() {
    this.setDefault();
  /*    this.searchForProductsByDatePriceDurationAndCategory(); */
  this.searchForProductsByTags();
  }

  filter() {
    if (!this.errorSelectDateTo) {
      this.startDateFormat = this.startDate.format('YYYY-MM-DD');
      this.endDateFormat = this.endDate.format('YYYY-MM-DD');
      this.subcategoryName = this.subcategory.subcategoryName;
      this.minPrice = this.priceRange[0];
      this.maxPrice = this.priceRange[1];
      this.durationResult = this.duration.name;
      this.setDefault();
      /*    this.searchForProductsByDatePriceDurationAndCategory(); */
    this.searchForProductsByTags();
    }
  }

  chooseDatesFrom(event: MatDatepickerInputEvent<any>) {
    this.errorSelectDateTo = this.endDate < this.startDate;
    if (!this.errorSelectDateTo) {
      this.setDefault();
      /*    this.searchForProductsByDatePriceDurationAndCategory(); */
    this.searchForProductsByTags();
    }
  }

  chooseDatesTo(event: MatDatepickerInputEvent<any>) {
    this.errorSelectDateTo = this.endDate < this.startDate;
    if (!this.errorSelectDateTo) {
      this.setDefault();
      /*    this.searchForProductsByDatePriceDurationAndCategory(); */
    this.searchForProductsByTags();
    }
  }

  clearKeyword() {
    this.keyword = '';
    this.setDefault();
    /*    this.searchForProductsByDatePriceDurationAndCategory(); */
    this.searchForProductsByTags();
  }

  clearPrice() {
    this.minPrice = null;
    this.maxPrice = null;
    this.priceRange = [0, 10000];
    this.setDefault();
    /*    this.searchForProductsByDatePriceDurationAndCategory(); */
    this.searchForProductsByTags();
  }

  clearDuration() {
    this.durationResult = '';
    this.duration = {
      minDuration: 0,
      maxDuration: 100 * 24 * 3600,
      name: ''
    };
    this.setDefault();
    /*    this.searchForProductsByDatePriceDurationAndCategory(); */
    this.searchForProductsByTags();
  }

  clearDate() {
    this.startDateFormat = '';
    this.endDateFormat = '';
    this.setDefault();
   /*    this.searchForProductsByDatePriceDurationAndCategory(); */
   this.searchForProductsByTags();
  }

  clearSubcategory() {
    this.subcategoryName = '';
    this.subcategory = {
      subcategoryName: '',
      subcategoryId: 0,
      categoryId: 0
    };
    this.setDefault();
   /*    this.searchForProductsByDatePriceDurationAndCategory(); */
   this.searchForProductsByTags();
  }

  clearAll() {
    this.startDateFormat = '';
    this.endDateFormat = '';
    this.subcategory = {
      subcategoryName: '',
      subcategoryId: 0,
      categoryId: 0
    };
    this.subcategoryName = '';
    this.keyword = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.priceRange = [0, 10000];
    this.durationResult = '';
    this.duration = {
      minDuration: 0,
      maxDuration: 100 * 24 * 3600,
      name: ''
    };
    this.setDefault();
    /*    this.searchForProductsByDatePriceDurationAndCategory(); */
    this.searchForProductsByTags();
  }

  onPageChange(event, lastPage) {
    this.page = event;
    if (!this.isStopLoadMore && (this.page === lastPage - 1 || this.page === lastPage)) {
      // load more
      this.topX = (this.pageSize + 1).toString() + '-' + (this.pageSize + this.limit).toString();
      this.pageSize += this.limit;
       /*    this.searchForProductsByDatePriceDurationAndCategory(); */
    this.searchForProductsByTags();
    }
  }
}
