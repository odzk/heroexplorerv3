import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { LocalStoreService } from '../../../services/localstore/localstore.service';
import { EventMessage } from '../../../services/event-message/event-message.service';
import { HttpRequestService } from '../../../services/http/http-request.service';
import { MESSAGE_EVENT } from '../../../../../constants';

import { ModalCommonComponent } from '../../../components/modal/modal-common/modal-common.component';

@Component({
  selector: 'app-modal-view-price-detail',
  templateUrl: './modal-view-price-detail.component.html',
  styleUrls: ['./modal-view-price-detail.component.scss']
})
export class ModalViewPriceDetailComponent implements OnInit {
  ageBand: any;
  ageBands: any;
  currencyCode: any;
  ageBandPrices: Array<any> = [];
  travellerCountLeft = 0;
  product: any;
  cartShopping: any;
  currentOption: any;
  currentOptionCode: any;
  gradeCodeMax: any;
  gradeCode: any;
  gradeCodeChild: any;
  gradeCodeInfant: any;
  childInfantPresent: any;

  constructor(private httpRequestService: HttpRequestService,
              private router: Router,
              private eventMsg: EventMessage,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<ModalViewPriceDetailComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    // //console.log('currentOption',this.data.currentOption);
    this.currencyCode = LocalStoreService.getInstance().getCurrencyCode();
    this.ageBandPrices = this.data.item.price.tourGrades[0].pricingMatrix[0].ageBandPrices;
    this.currentOptionCode = this.data.currentOption.gradeCode;
    this.gradeCode = this.data.item.price.tourGrades;
    // //console.log('Age Band Prices', this.data);
    // //console.log('Current Option Code', this.currentOptionCode);
    this.gradeCodeMax = this.data.item.price.tourGrades.length;
    // //console.log(this.gradeCodeMax);
    for (let x = 0; x < this.gradeCodeMax; x++) {
    if (this.data.currentOption.gradeCode === this.data.item.price.tourGrades[x].gradeCode) {
      this.childInfantPresent = this.data.item.price.tourGrades[x].pricingMatrix[0].ageBandPrices.length;
      // //console.log('Child Infant', this.childInfantPresent);
      if(this.childInfantPresent >= 3 ){
      this.gradeCodeChild = this.data.item.price.tourGrades[x].pricingMatrix[0].ageBandPrices[1].prices[0].priceFormatted;
      this.gradeCodeInfant = this.data.item.price.tourGrades[x].pricingMatrix[0].ageBandPrices[2].prices[0].priceFormatted;
      // //console.log("Child Rate", this.gradeCodeChild);
      // //console.log("Infant Rate", this.gradeCodeInfant);
    } else if (this.childInfantPresent === 2) {
      this.gradeCodeChild = this.data.item.price.tourGrades[x].pricingMatrix[0].ageBandPrices[1].prices[0].priceFormatted;
      this.gradeCodeInfant = '$0.00';
    } else {
      this.gradeCodeChild = '$0.00';
      this.gradeCodeInfant = '$0.00';
    }
    // //console.log("Child Rate", this.gradeCodeChild);
    } else {
    // //console.log('no match');
    }
  }

    this.product = this.data.product;
    this.ageBands = this.product.ageBands;
    this.currentOption = this.data.currentOption;
    if (this.ageBands.length > 0){
      this.ageBands[0].count = 1;
    }
    this.listOfTravellersChange();
  }

  listOfTravellersChange() {
    this.travellerCountLeft = this.ageBands.map(item => item.count).reduce((a, b) => a + b, 0); // sum array
    this.travellerCountLeft = this.product.maxTravellerCount - this.travellerCountLeft;
    this.ageBands.forEach(item => {
      item['list'] = [];
      const max = item.count + this.travellerCountLeft;
      for (let i = 0; i <= max; i++) {
        item.list.push({count: i, value: i.toString()});
      }
    });
  }

  addToCart() {
    const adult = this.ageBands.filter(item => item.treatAsAdult)[0];
    if (adult.count === 0) {
      this.dialog.open(ModalCommonComponent, {
        width: '500px',
        data: {
          title: 'We’re sorry, this option is not available',
          message: 'This tour or activity option requires at least one adult traveler'
        }
      });
    } else {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
      // update list options firstly - it lets user can change number of travellers and option

      const listOptionsInfo = {
        desId: this.product.destinationId,
        productCode: this.product.code,
        productTitle: this.product.title,
        thumbnailHiResURL: this.product.thumbnailHiResURL,
        bookingDate: this.data.item.dateFormat,
        bookingDateFormat: this.data.item.dateTime,
        listOptions: this.data.listOptions,
        ageBands: this.ageBands,
        maxTravellerCount: this.product.maxTravellerCount,
        currencyCode: this.currencyCode,
        bookingQuestions: this.product.bookingQuestions,
        hotelPickup: this.product.hotelPickup,
        langServices: this.product.tourGrades.length > 0 ? this.product.tourGrades.filter(o => o.gradeCode == this.data.currentOption.gradeCode)[0].langServices : {}
      };
      // //console.log('product', this.product)
      // //console.log('Current Option', this.data.currentOption);

      const list = LocalStoreService.getInstance().getlistOptionsInfo();
      list.push(listOptionsInfo);
      LocalStoreService.getInstance().updateListOptionsInfo(list);

      // update list cart shopping

      this.cartShopping = LocalStoreService.getInstance().getCartShopping();
      const foundItem = this.cartShopping.filter(item => item.code === this.product.code)[0];
      const index = this.cartShopping.indexOf(foundItem);
      const data = {
        code: this.product.code,
        desId: this.product.destinationId,
        gradeCode: this.data.currentOption.gradeCode,
        gradeTitle: this.data.currentOption.gradeTitle,
        bookingDate: this.data.item.dateFormat,
        bookingDateFormat: this.data.item.dateTime,
        ageBands: this.ageBands,
        bookingQuestions: this.product.bookingQuestions,
        hotelPickup: this.product.hotelPickup,
        langServices: listOptionsInfo.langServices
      };
      // //console.log('cart data', data);
      if (index < 0) { // only add if this item isn't on cart
        this.cartShopping.push(data);
      } else {
        this.cartShopping[index] = data;
      }
      //this.cartShopping.push(data);
      LocalStoreService.getInstance().updateCartShopping(this.cartShopping);
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_update_card_number, this.cartShopping.length);
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.dialogRef.close(true);
      this.router.navigate(['order/']);
    }
  }

}
