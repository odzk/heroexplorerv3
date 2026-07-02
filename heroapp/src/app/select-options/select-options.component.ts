import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { EventMessage } from '../shared/services/event-message/event-message.service';
import { LocalStoreService } from '../shared/services/localstore/localstore.service';
import { HttpRequestService } from '../shared/services/http/http-request.service';
import { MESSAGE_EVENT } from '../../constants';

import * as _moment from 'moment';
import { DeviceDetectorService } from 'ngx-device-detector';
const moment = _moment;

@Component({
  selector: 'app-select-options',
  templateUrl: './select-options.component.html',
  styleUrls: ['./select-options.component.scss']
})
export class SelectOptionsComponent implements OnInit {
  today = new Date();
  bookingDate: any = moment(this.today).add(1, 'days');
  date = new FormControl(moment());

  allListOptions: Array<any> = [];
  listOptions: Array<any> = [];
  cartShopping: Array<any> = [];

  listOptionsInfo: any;
  currencyCode: any;

  code = '';

  travellerCountLeft = 0;
  adultCount = 0;
  seniorCount = 0;
  childCount = 0;
  infantCount = 0;

  showWarningTravellers = false;
  isShowFilter = false;

  dateFilter = (d: Date): boolean => {
    // Prevent booking date < today
    return d > this.today;
  }

  constructor(private httpRequestService: HttpRequestService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private eventMsg: EventMessage, private deviceService: DeviceDetectorService) {
    this.activatedRoute.params.subscribe(res => {
      this.code = res.code;
    });

    this.isShowFilter = this.deviceService.isMobile();

  }

  ngOnInit() {
    this.currencyCode = LocalStoreService.getInstance().getCurrencyCode();
    this.allListOptions = LocalStoreService.getInstance().getlistOptionsInfo();
    var lst = this.allListOptions.filter(item => item.productCode === this.code);
    this.listOptionsInfo = lst[lst.length - 1];
    if (this.listOptionsInfo) {
      this.bookingDate = moment(this.listOptionsInfo.bookingDate, 'YYYY-MM-DD');
      this.listOfTravellersChange();
      if (this.listOptionsInfo.currencyCode === this.currencyCode) {
        //console.log(this.listOptionsInfo)
        this.listOptions = this.listOptionsInfo.listOptions;
        //console.log(this.listOptions)
      } else {
        this.getlistOptions();
      }
    } else {
      this.router.navigate(['detail/' + this.code]);
    }
  }

  listOfTravellersChange() {
    this.adultCount = this.listOptionsInfo.ageBands.filter(item => item.adult)[0].count;
    this.travellerCountLeft = this.listOptionsInfo.ageBands.map(item => item.count).reduce((a, b) => a + b, 0); // sum array
    this.travellerCountLeft = this.listOptionsInfo.maxTravellerCount - this.travellerCountLeft;
    this.listOptionsInfo.ageBands.forEach(item => {
      item['list'] = [];
      const max = item.count + this.travellerCountLeft;
      for (let i = 0; i <= max; i++) {
        item.list.push({ count: i, value: i.toString() });
      }
    });
  }

  getlistOptions() {
    if (this.travellerCountLeft < this.listOptionsInfo.maxTravellerCount) {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
      const params = {
        'productCode': this.listOptionsInfo.productCode,
        'bookingDate': this.bookingDate.format('YYYY-MM-DD'),
        'currencyCode': this.currencyCode,
        'ageBands': []
      };
      this.listOptionsInfo.ageBands.forEach(item => {
        params['ageBands'].push({ 'bandId': item.bandId, 'count': item.count });
      });

      this.httpRequestService.loadOptionsOfAProduct(params).subscribe(resp => {
        const res = resp.json();
        this.listOptions = res;
        const listOptionsInfo = {
          desId: this.listOptionsInfo.desId,
          productCode: this.listOptionsInfo.productCode,
          productTitle: this.listOptionsInfo.productTitle,
          thumbnailHiResURL: this.listOptionsInfo.thumbnailHiResURL,
          bookingDate: this.bookingDate.format('YYYY-MM-DD'),
          bookingDateFormat: this.bookingDate.format('LL'),
          listOptions: res,
          ageBands: this.listOptionsInfo.ageBands,
          maxTravellerCount: this.listOptionsInfo.maxTravellerCount,
          currencyCode: this.currencyCode
        };
        //console.log(listOptionsInfo)
        const index = this.allListOptions.indexOf(this.listOptionsInfo);
        this.allListOptions[index] = listOptionsInfo;
        LocalStoreService.getInstance().updateListOptionsInfo(this.allListOptions);
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      });
    } else {
      this.showWarningTravellers = true;
      setTimeout(() => {
        this.showWarningTravellers = false;
      }, 2000);
    }

  }

  saveAndGoToCartShopping(gradeCode, gradeTitle) {
    this.cartShopping = LocalStoreService.getInstance().getCartShopping();
    const foundItem = this.cartShopping.filter(item => item.code === this.listOptionsInfo.productCode)[0];
    //console.log(this.cartShopping)
    const index = this.cartShopping.indexOf(foundItem);
    const data = {
      code: this.listOptionsInfo.productCode,
      desId: this.listOptionsInfo.desId,
      gradeCode: gradeCode,
      gradeTitle: gradeTitle,
      bookingDate: this.bookingDate.format('YYYY-MM-DD'),
      bookingDateFormat: this.bookingDate.format('LL'),
      ageBands: this.listOptionsInfo.ageBands,
      bookingQuestions: this.listOptionsInfo.bookingQuestions,
      hotelPickup: this.listOptionsInfo.hotelPickup,
      langServices: this.listOptionsInfo.tourGrades.length > 0 ? this.listOptionsInfo.tourGrades.filter(o=> o.gradeCode == gradeCode)[0].langServices : {}
    };
    if (index < 0) { // only add if this item isn't on cart
      this.cartShopping.push(data);
    } else {
      this.cartShopping[index] = data;
    }
    //console.log(this.cartShopping);

    LocalStoreService.getInstance().updateCartShopping(this.cartShopping);
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_update_card_number, this.cartShopping.length);
    this.router.navigate(['order/']);
  }

}
