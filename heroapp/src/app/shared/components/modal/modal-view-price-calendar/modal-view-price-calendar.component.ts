import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LocalStoreService } from '../../../services/localstore/localstore.service';
import { EventMessage } from '../../../services/event-message/event-message.service';
import { HttpRequestService } from '../../../services/http/http-request.service';
import { ModalViewPriceDetailComponent } from '../../../components/modal/modal-view-price-detail/modal-view-price-detail.component';

import { MESSAGE_EVENT, LIST_CURRENCY_CODE } from '../../../../../constants';

import * as _moment from 'moment';
import { DeviceDetectorService } from 'ngx-device-detector';

import { ModalCommonComponent } from '../../../components/modal/modal-common/modal-common.component';

const moment = _moment;

export interface CalendarItem {
  date: string;
  dateTime: string;
  dateFormat: string;
  price: any;
  isCurrentData: boolean;
}

@Component({
  selector: 'app-modal-view-price-calendar',
  templateUrl: './modal-view-price-calendar.component.html',
  styleUrls: ['./modal-view-price-calendar.component.scss']
})
export class ModalViewPriceCalendarComponent implements OnInit {
  today = new Date();
  currentMonth = this.today.getMonth();
  choiceCurrentMonth = this.today.getMonth();
  currentYear = this.today.getFullYear();
  currentDay = this.today.getDate();

  currency = LIST_CURRENCY_CODE;
  optionCode: '';
  calendar: Array<any> = [];
  listMonths: Array<any> = [
    {
      month: this.today.getMonth(),
      year: this.today.getFullYear(),
      name: moment(this.today).format('MMMM YYYY')
    }
  ];

  currentOption = {
    gradeCode: '',
    gradeTitle: ''
  };

  firstDay: any;
  currentDate: any;
  currencyCode: any;
  isMobile = false;
  daysInMonth = 0;
  indexOfCurrentMonth = 0;
  dayOfNextMonths = 6; // list months will include current month and next 6 months
  listOptions: Array<any> = [];

  // addToCart

  ageBand: any;
  ageBands: any;
  product: any;
  cartShopping: any;

  constructor(
    private httpRequestService: HttpRequestService,
    private eventMsg: EventMessage,
    private deviceService: DeviceDetectorService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ModalViewPriceCalendarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isMobile = this.deviceService.isMobile();
  }

  ngOnInit() {
    this.currencyCode = LocalStoreService.getInstance().getCurrencyCode();
    this.reinitializeDate();
    this.loadAvailableTourGrades();
    this.composeListMonths();

    // initial set of calendar
  }

  composeListMonths() {
    let date = this.today;
    let i = 0;
    while (i < this.dayOfNextMonths) {
      date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      this.listMonths.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        name: moment(date).format('MMMM YYYY')
      });
      i++;
    }
  }

  loadAvailableDateAndPrice() {
    this.calendar = [];
    this.firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const params = {
      productCode: this.data.code,
      month: moment(this.firstDay).format('MM'),
      year: moment(this.firstDay).format('YYYY'),
      currencyCode: this.currencyCode
    };

    if (this.currentOption.gradeCode.length > 0) {
      params['tourGradeCode'] = this.currentOption.gradeCode;
    }

    this.httpRequestService
      .loadAvailableDateAndPrice(params)
      .map(res => res.json())
      .subscribe(res => {
        this.composeCalendar(res);
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      });
  }

  loadAvailableTourGrades() {
    this.listOptions = [];
    this.firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const params = {
      productCode: this.data.code,
      month: moment(this.firstDay).format('MM'),
      year: moment(this.firstDay).format('YYYY'),
      currencyCode: this.currencyCode
    };
    this.httpRequestService
      .loadAvailableTourGrades(params)
      .map(res => res.json())
      .subscribe(res => {
        if (res.length > 0 && res[0].gradeCode === 'DEFAULT') {
          this.currentOption = res[0];
        } else if (res.length > 0) {
          this.listOptions = res;
          this.currentOption = this.listOptions[0];
          // //console.log('Available: ', this.listOptions);
          LocalStoreService.getInstance().updateCurrentOptions(this.listOptions);
        }
        this.loadAvailableDateAndPrice();
      });
  }

  composeCalendar(prices) {
    const firstDayNum = this.firstDay.getDay();
    this.daysInMonth = moment(this.firstDay).daysInMonth();
    const totalDays = this.daysInMonth + firstDayNum - 1;
    let num = 1;
    let indexOfPrices = 0;
    let i = 0;
    while (i <= totalDays) {
      // to create a array days of month
      // date null = date not exist
      let date = null;
      let dateFormat = null;
      let dateTime = null;
      if (i >= firstDayNum) {
        date = num;
        num++;
      }

      // find price by date
      // price null = not available
      let price = null;
      dateFormat = moment(new Date(this.currentYear, this.currentMonth, date)).format('YYYY-MM-DD');
      if (prices.dates !== null && prices.dates[indexOfPrices] && prices.dates[indexOfPrices].bookingDate === dateFormat) {
        price = prices.dates[indexOfPrices];
        dateTime = moment(new Date(this.currentYear, this.currentMonth, date)).format('LL');
        indexOfPrices++;
      }
      // //console.log(this.indexOfCurrentMonth)
      // //console.log(this.currentMonth)
      // //console.log(this.listOptions);
      this.calendar.push({
        date: date,
        dateTime: dateTime,
        dateFormat: dateFormat,
        price: price,
        isCurrentDate: date === this.today.getDate() && this.indexOfCurrentMonth === 0,
        todayDate: this.currentDay,
        todayMonth: this.choiceCurrentMonth,
        monthChoice: this.indexOfCurrentMonth
      });
      i++;
    }
    //console.log('date: ', this.calendar);
  }

  currencyCodeChange() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    LocalStoreService.getInstance().setCurrencyCode(this.currencyCode);
    this.loadAvailableDateAndPrice();
  }

  currentDateChange() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.currentMonth = this.currentDate.month;
    this.currentYear = this.currentDate.year;
    this.indexOfCurrentMonth = this.listMonths.indexOf(this.currentDate);
    this.loadAvailableTourGrades();
  }

  onNextMonth() {
    this.currentDate = this.listMonths[this.indexOfCurrentMonth + 1];
    this.currentDateChange();
  }

  onPrevMonth() {
    this.currentDate = this.listMonths[this.indexOfCurrentMonth - 1];
    this.currentDateChange();
  }

  showModalViewPriceDetail(item) {
    if (window.screen.width < 480) {
      // //console.log('working here!');
      // modalViewPriceDetail = this.dialog.open(ModalViewPriceDetailComponent, {
      //   width: '500px',
      //   data: {
      //     item: item,
      //     product: this.data,
      //     listOptions: this.listOptions,
      //     currentOption: this.currentOption
      //   }, panelClass: 'dialog-fullscreen'
      // });
    } else {
      // //console.log('Item: ', item);
      // //console.log('List Option: ', this.listOptions);
      // modalViewPriceDetail = this.dialog.open(ModalViewPriceDetailComponent, {
      //   width: '500px',
      //   data: {
      //     item: item,
      //     product: this.data,
      //     listOptions: this.listOptions,
      //     currentOption: this.currentOption
      //   }
      // });
    }
  }

  onChangeOption(item) {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.currentOption = item;
    // //console.log('Current Option', this.currentOption);
    this.loadAvailableDateAndPrice();
  }

  onDropdownChangeOption() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const code = this.listOptions.filter(o => o.gradeCode === this.optionCode)[0];
    this.currentOption = code;
    this.loadAvailableDateAndPrice();
  }

  addToCart(item: CalendarItem) {
    const listOptionsInfo = {
      bookingDate: item.dateFormat,
      bookingDateFormat: item.dateTime
    };
    this.dialogRef.close(item);
    LocalStoreService.getInstance().updateCurrentBookingDate(listOptionsInfo.bookingDate);
    // //console.log('List Options Info: ', listOptionsInfo);
    // const list = LocalStoreService.getInstance().getlistOptionsInfo();
    // list.push(listOptionsInfo);
    // //console.log('List: ', list);
    // LocalStoreService.getInstance().updateCurrentBookingDate(listOptionsInfo.bookingDate);
    // const testdate = LocalStoreService.getInstance().getCurrentBookingDate();
    // //console.log('Test Date: ', testdate);
    // LocalStoreService.getInstance().updateListOptionsInfo(list);
    // this.dialogRef.close(true);
    // this.dialogRef.afterClosed().subscribe(result => {
    //   window.location.reload();
    // });
    // const adult = this.ageBands.filter(ageBand => ageBand.treatAsAdult)[0];
    // if (adult.count === 0) {
    //   this.dialog.open(ModalCommonComponent, {
    //     width: '500px',
    //     data: {
    //       title: 'We’re sorry, this option is not available',
    //       message: 'This tour or activity option requires at least one adult traveler'
    //     }
    //   });
    // } else {
    //   this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    //   // update list options firstly - it lets user can change number of travellers and option
    //   const listOptionsInfo = {
    //     desId: this.product.destinationId,
    //     productCode: this.product.code,
    //     productTitle: this.product.title,
    //     thumbnailHiResURL: this.product.thumbnailHiResURL,
    //     bookingDate: this.data.item.dateFormat,
    //     bookingDateFormat: this.data.item.dateTime,
    //     listOptions: this.data.listOptions,
    //     ageBands: this.ageBands,
    //     maxTravellerCount: this.product.maxTravellerCount,
    //     currencyCode: this.currencyCode,
    //     bookingQuestions: this.product.bookingQuestions,
    //     hotelPickup: this.product.hotelPickup,
    //     langServices:
    //       this.product.tourGrades.length > 0
    //         ? this.product.tourGrades.filter(o => o.gradeCode === this.data.currentOption.gradeCode)[0].langServices
    //         : {}
    //   };
    //   // //console.log('product', this.product)
    //   // //console.log('Current Option', this.data.currentOption);
    //   const list = LocalStoreService.getInstance().getlistOptionsInfo();
    //   list.push(listOptionsInfo);
    //   //console.log('New Date: ', listOptionsInfo);
    //   LocalStoreService.getInstance().updateListOptionsInfo(list);
    //   // update list cart shopping
    //   this.cartShopping = LocalStoreService.getInstance().getCartShopping();
    //   const foundItem = this.cartShopping.filter(item => item.code === this.product.code)[0];
    //   const index = this.cartShopping.indexOf(foundItem);
    //   const data = {
    //     code: this.product.code,
    //     desId: this.product.destinationId,
    //     gradeCode: this.data.currentOption.gradeCode,
    //     gradeTitle: this.data.currentOption.gradeTitle,
    //     bookingDate: this.data.item.dateFormat,
    //     bookingDateFormat: this.data.item.dateTime,
    //     ageBands: this.ageBands,
    //     bookingQuestions: this.product.bookingQuestions,
    //     hotelPickup: this.product.hotelPickup,
    //     langServices: listOptionsInfo.langServices
    //   };
    //   // //console.log('cart data', data);
    //   if (index < 0) {
    //     // only add if this item isn't on cart
    //     this.cartShopping.push(data);
    //   } else {
    //     this.cartShopping[index] = data;
    //   }
    //   // this.cartShopping.push(data);
    //   LocalStoreService.getInstance().updateCartShopping(this.cartShopping);
    //   this.eventMsg.sendMessage(MESSAGE_EVENT.msg_update_card_number, this.cartShopping.length);
    //   this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    //   window.location.reload();
    //   this.dialogRef.close(true);
    // this.router.navigate(['order/']);
  }

  private reinitializeDate() {
    this.today = this.data.availableDate;
    this.currentMonth = this.today.getMonth();
    this.currentYear = this.today.getFullYear();
    this.listMonths = [
      {
        month: this.today.getMonth(),
        year: this.today.getFullYear(),
        name: moment(this.today).format('MMMM YYYY')
      }
    ];
  }
}
