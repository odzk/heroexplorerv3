import { Component, OnInit, ViewChild, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormControl } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { EventMessage } from '../shared/services/event-message/event-message.service';
import { LocalStoreService } from '../shared/services/localstore/localstore.service';
import { HttpRequestService } from '../shared/services/http/http-request.service';
import { OpenModalService } from '../shared/services/open-modal/open-modal.service';
import { MESSAGE_EVENT } from '../../constants';
import { AuthenticationService } from '../shared/services/authentication.service';
import { formatDate } from '@angular/common';

// Services
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy {
  bookingSource: string;
  subDomain: string;
  buttonType: string;
  constructor(
    private formBuilder: FormBuilder,
    private httpRequestService: HttpRequestService,
    private router: Router,
    private eventMsg: EventMessage,
    private cd: ChangeDetectorRef,
    private openModalService: OpenModalService,
    private authenticationService: AuthenticationService
  ) {
    this.currencyCode = LocalStoreService.getInstance().getCurrencyCode();
    this.cartShopping = LocalStoreService.getInstance().getCartShopping();

    const domain = /:\/\/([^\/]+)/.exec(window.location.href)[1];
    if (domain.indexOf('.') > -1) {
      const subdomain = domain.split('.')[0];
      if (subdomain) {
        this.httpRequestService.getSubDomain(subdomain).subscribe((resp) => {
          const res = resp.json();
          if (res) {
            this.bookerId = res.id;
            this.bookingSource = subdomain;
            console.log('Booking Source: ', this.bookingSource);
          }
        });
      } else {
        this.bookingSource = 'dev';
      }
    }

    if (this.cartShopping.length > 0) {
      this.generateListTravellers();
      this.getListProducts();
    }
    this.router.events.filter((event) => event instanceof NavigationEnd).subscribe((href: any) => {});
  }
  @ViewChild('cardInfo') cardInfo: ElementRef;
  @ViewChild('voucherElement') voucherElement: ElementRef;

  formPayment: FormGroup;
  locationPickup: any = [];
  cardHandler = this.onChange.bind(this);
  card: any;
  stripeCard: any;
  voucher: any;
  primaryColor: string;
  secondaryColor: string;

  cartShopping: Array<any> = [];
  listTitle: Array<any> = [{ value: '', label: 'Title' }, { value: 'Mr' }, { value: 'Mrs' }, { value: 'Miss' }];
  listTabsLabel: Array<string> = ['ADD TO CART', 'REVIEW ORDER', 'SECURE CHECKOUT', 'PRINT VOUCHERS'];
  itemSummaries: Array<any> = [];

  currencyCode = 'AUD';
  promoCode = '';
  error: string;
  totalPrice = 0;
  selectedIndex = 1;
  destinationId = 0;
  bookerTitleText: any;
  isHideVoucherElement = true;
  bookerId = 0;
  isLogged: any = false;
  validateDropdown: any = false;
  customizeSettings: any;

  ngOnInit() {
    const primaryColor = localStorage.getItem('primaryColor');
    const secondaryColor = localStorage.getItem('secondaryColor');
    const buttonType = localStorage.getItem('buttonType');
    if (primaryColor) {
      this.primaryColor = primaryColor;
      this.secondaryColor = secondaryColor;
      this.buttonType = buttonType;
    } else {
    this.getCustomization();
    }
    this.bookingSource = 'www';
    if (this.cartShopping.length === 0) {
      this.router.navigate(['']);
    }
    if (this.authenticationService.isAuthenticated) {
      this.httpRequestService.getHeroUserDetailByEmail(this.authenticationService.LoginInfo.email).subscribe((resp) => {
        const res = resp.json();
        this.isLogged = true;
        if (res) {
          this.formPayment.controls['bookerEmail'].setValue(this.authenticationService.LoginInfo.email);
          this.formPayment.controls['bookerFirstName'].setValue(res.firstname);
          this.formPayment.controls['bookerSurName'].setValue(res.lastname);
          this.formPayment.controls['bookerPhone'].setValue(res.mobile);
          this.formPayment.controls['bookerHomeCity'].setValue(res.city);
        }
      });
    }
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
      if(res){
      this.primaryColor = res.primary_color;
      this.secondaryColor = res.secondary_color;
      this.buttonType = res.button_type;
      }
      })
    }
    
  generateListTravellers() {
    // for formControlName and add random number for each person
    const formConfig = {
      stripeFullName: ['', [Validators.required]],
      bookerFirstName: ['', [Validators.required]],
      bookerSurName: ['', [Validators.required]],
      bookerTitle: ['', [Validators.required]],
      bookerEmail: ['', [Validators.required, Validators.email]],
      bookerPhone: [''],
      bookerHomeCity: [''],
      agreeConditionsAndPrivace: [Validators.requiredTrue]
    };

    this.cartShopping.forEach((item, i) => {
      formConfig['specialRequirements_' + i] = [''];
      // //console.log(item.ageBands)
      item.ageBands.forEach((ageBand, index) => {
        if (ageBand.count > 0) {
          ageBand['travellers'] = [];
          for (let x = 0; x < ageBand.count; x++) {
            const randomNumber = Math.floor(Math.random() * Math.floor(9999));
            formConfig['person_' + randomNumber + '_firstname'] = ['', [Validators.required]];
            formConfig['person_' + randomNumber + '_surname'] = ['', [Validators.required]];
            ageBand.travellers.push({
              description: ageBand.description,
              randomNumber: randomNumber
            });
            // //console.log('forAgeBand', x)
          }
        }
      });
      if (item.bookingQuestions && item.bookingQuestions.length > 0) {
        item.bookingQuestions.forEach((question, index) => {
          const randomNumber = Math.floor(Math.random() * Math.floor(9999));
          formConfig['questionByProduct_' + randomNumber] = ['', [Validators.required]];
          question.randomNumber = randomNumber;
        });
      }

      if (item.hotelPickup === true) {
        formConfig['hotelPickup_' + item.code] = [''];
        this.httpRequestService.getListHotelPickup(item.code).subscribe((resp) => {
          const res = resp.json();
          if (res.length > 0) {
            item.lstHotelPickUp = res;
            item.lstHotelPickUp.map((hotelPickupData) => {
              hotelPickupData.namenew = hotelPickupData.name;
              if (!hotelPickupData.address) {
                hotelPickupData.namenew += ' | Address: ' + hotelPickupData.address;
              }
              return hotelPickupData;
            });
          }
        });
      }
      if (item.langServices !== null || item.langServices !== undefined) {
        item.lstLangServices = [];
        // item.lstLangSerices = lstLangService;
        for (const key in item.langServices) {
          if (item.langServices.hasOwnProperty(key)) {
            item.lstLangServices.push({ id: key, name: item.langServices[key] });
          }
        }
        formConfig['langServices_' + item.code] = [''];
      }
      // formConfig['questionByProduct_' + i] = ['', [Validators.required]];
    });
    this.formPayment = this.formBuilder.group(formConfig);
  }

  getListProducts() {
    this.cartShopping.forEach((item, index) => {
      const stopLoading = index === this.cartShopping.length - 1;
      this.destinationId = item.desId;
      this.getProductDetail(item, stopLoading);
    });
  }

  getProductDetail(item, stopLoading) {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.httpRequestService.getProductDetail(item.code).subscribe((resp) => {
      const res = resp.json();
      item['title'] = res.title;
      item['thumbnailHiResURL'] = res.thumbnailHiResURL;
      const params = {
        productCode: item.code,
        bookingDate: item.bookingDate,
        currencyCode: this.currencyCode,
        specialReservation: false
      };

      if (item.gradeCode) {
        params['tourGradeCode'] = item.gradeCode;
      }

      this.httpRequestService.loadPriceForAnOptionProduct(params).subscribe((response) => {
        const result = response.json();
        if (result === null) {
          item['price'] = 'Not available';
          return;
        }
        // //console.log(response)
        let price = parseFloat('0');
        item.ageBands.forEach((ageBand) => {
          if (ageBand.count > 0) {
            const foundItem = result[0].ageBandPrices.filter((i) => i.bandId === ageBand.bandId)[0];
            if (foundItem) {
              price += parseFloat((ageBand.count * foundItem.prices[0].price).toString());
            }
          }
        });
        item['price'] = price.toFixed(2);
        const total = parseFloat(this.totalPrice.toString()) + parseFloat(item['price'].toString());
        this.totalPrice = Number(total.toFixed(2));
      });

      if (stopLoading) {
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      }
    });
  }

  removeFromCart(item) {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const foundItem = this.cartShopping.filter((i) => i.code === item.code)[0];
    if (foundItem) {
      // remove from list option info
      const allListOptionsInfo = LocalStoreService.getInstance().getlistOptionsInfo();
      const option = allListOptionsInfo.filter((opt) => opt.productCode === item.code)[0];
      if (option) {
        allListOptionsInfo.splice(allListOptionsInfo.indexOf(option), 1);
        LocalStoreService.getInstance().updateListOptionsInfo(allListOptionsInfo);
      }
      // remove from cart shopping
      const price = item.price.toString() === 'Not available' ? 0 : item.price.toString();
      const total = parseFloat(this.totalPrice.toString()) - parseFloat(price);
      this.totalPrice = Number(total.toFixed(2));
      foundItem.ageBands.forEach((ageBand, index) => {
        if (ageBand.count > 0) {
          ageBand.travellers.forEach((person) => {
            this.formPayment.removeControl('person_' + person.randomNumber + '_firstname');
            this.formPayment.removeControl('person_' + person.randomNumber + '_surname');
          });
        }
      });
      try {
        if (foundItem.bookingQuestions && foundItem.bookingQuestions.length > 0) {
          foundItem.bookingQuestions.forEach((question, index) => {
            this.formPayment.removeControl('questionByProduct_' + question.randomNumber);
          });
        }
      } catch {}

      this.cartShopping.splice(this.cartShopping.indexOf(foundItem), 1);
      LocalStoreService.getInstance().updateCartShopping(this.cartShopping);
      if (this.cartShopping.length === 0) {
        this.router.navigate(['list-result/' + this.destinationId + '/0/0']);
      }
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_update_card_number, this.cartShopping.length);
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    }
  }

  buildStripeCard() {
    this.card = elements.create('card', { hidePostalCode: true });
    this.card.mount(this.cardInfo.nativeElement);
    this.card.addEventListener('change', this.cardHandler);
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
  }

  nextStep() {
    let invalid: any = false;
    this.cartShopping.forEach((item, index) => {
      if (item.price === 'Not available') {
        invalid = true;
        return;
      }
    });
    if (invalid === true) {
      this.openModalService.showModalCommon({ title: 'Please remove the tours which not available before confirm!' });
      return;
    }
    this.selectedIndex += 1;
    if (!this.card) {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
      setTimeout(() => {
        this.buildStripeCard();
      }, 2000);
    }
  }

  onContinueShopping() {
    if (this.destinationId > 0) {
      this.router.navigate(['list-result/' + this.destinationId + '/0/0']);
    } else {
      this.router.navigate(['/']);
    }
  }

  getNewPriceWithPromoCode() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.totalPrice = 0;
    this.cartShopping.forEach((item, index) => {
      const travellers = [];
      item.ageBands.forEach((ageBand) => {
        if (ageBand.count > 0) {
          travellers.push({
            bandId: ageBand.bandId
          });
        }
      });
      const params = {
        promoCode: this.promoCode,
        partnerDetail: null,
        currencyCode: this.currencyCode,
        items: [
          {
            specialReservation: false,
            travelDate: item.bookingDate,
            productCode: item.code,
            tourGradeCode: item.gradeCode,
            travellers: travellers
          }
        ]
      };
      this.httpRequestService.reclculateThePriceWithPromotionCode(params).subscribe((resp) => {
        const res = resp.json();
        item.itineraryFromPrice = res !== null ? res.itineraryFromPrice : item.price;

        if (item.itineraryFromPrice === 'Not available') {
          return;
        }

        this.totalPrice += item.itineraryFromPrice;
        if (index === this.cartShopping.length - 1) {
          this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.card) {
      this.card.removeEventListener('change', this.cardHandler);
      this.card.destroy();
    }
  }

  onChange({ error }) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }
  validateAllFormFields(formGroup: FormGroup) {
    // {1}
    Object.keys(formGroup.controls).forEach((field) => {
      // {2}
      const control = formGroup.get(field); // {3}
      if (control instanceof FormControl) {
        // {4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        // {5}
        this.validateAllFormFields(control); // {6}
      }
    });
  }
  async onBookNow() {
    this.validateDropdown = false;
    // //console.log(this.formPayment)
    if (!this.formPayment.valid) {
      if (this.formPayment.get('bookerTitle').value === undefined || this.formPayment.get('bookerTitle').value.trim() === '') {
        this.validateDropdown = true;
      }

      this.openModalService.showModalCommon({ title: 'You have to input all required fields.' });
      this.validateAllFormFields(this.formPayment);
      return;
    }
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const stripeFullName = this.formPayment.get('stripeFullName').value;
    const { token, error } = await stripe.createToken(this.card, { name: stripeFullName });

    const currentTime = formatDate(new Date(), 'HH:mm:ss', 'en');
    if (error) {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    } else {
      this.stripeCard = token.card;
      const productCodeArray = [];
      const tourCodeArray = [];
      const listItems = [];

      let def = '';
      if (this.cartShopping.length) {
        def = `heroexplorer_${this.formPayment.get('bookerEmail').value}${this.cartShopping[0].bookingDate.toString()}.${currentTime}`;
      }

      this.cartShopping.forEach((item, index) => {
        // //console.log('cartShop', item)
        productCodeArray.push({ productCode: item.code });
        tourCodeArray.push({ tourCode: item.gradeCode });
        const travellers = [];
        item.ageBands.forEach((ageBand) => {
          let count = 0;
          if (ageBand.count > 0) {
            ageBand.travellers.forEach((person) => {
              travellers.push({
                bandId: ageBand.bandId,
                firstname: this.formPayment.get('person_' + person.randomNumber + '_firstname').value,
                surname: this.formPayment.get('person_' + person.randomNumber + '_surname').value,
                title: person.title || ''
              });
              if (count === 0) {
                travellers[0]['leadTraveller'] = true;
              }
              count++;
            });
          }
        });
        const lstbookingQuestion = [];
        if (item.bookingQuestions && item.bookingQuestions.length > 0) {
          item.bookingQuestions.forEach((question) => {
            lstbookingQuestion.push({
              questionId: question.questionId,
              answer: this.formPayment.get('questionByProduct_' + question.randomNumber).value
            });
          });
        }

        const hotelId = this.formPayment.get('hotelPickup_' + item.code) ? this.formPayment.get('hotelPickup_' + item.code).value : null;
        let pickupPoint = null;
        if (item.lstHotelPickUp && item.lstHotelPickUp.length > 0) {
          const hotelPickup = item.lstHotelPickUp.filter((o) => hotelId === o.id)[0];
          if (hotelPickup !== undefined) {
            pickupPoint = hotelPickup.name;
          }
        }
        let languageOptionCode = null;

        const langId = this.formPayment.get('langServices_' + item.code) ? this.formPayment.get('langServices_' + item.code).value : null;
        if (item.lstLangServices && item.lstLangServices.length > 0) {
          const lang = item.lstLangServices.filter((o) => langId === o.id)[0];
          if (lang !== undefined) {
            languageOptionCode = lang.id;
          }
        }

        const distributor = `${item.code}${this.formPayment.get('bookerEmail').value}${item.bookingDate.toString()}`;
        listItems.push({
          partnerItemDetail: {
            distributorItemRef: `heroexplorer_${distributor}.${currentTime}`
          },
          price: item.price,
          hotelId: hotelId,
          pickupPoint: pickupPoint,
          travelDate: item.bookingDate,
          productCode: item.code,
          tourGradeCode: item.gradeCode,
          languageOptionCode: languageOptionCode,
          bookingQuestionAnswers: lstbookingQuestion,
          specialRequirements: this.formPayment.get('specialRequirements_' + index).value,
          travellers: travellers
        });
      });

      const paramsMakeApayment = {
        token: token.id,
        amount: Math.round(this.totalPrice * 100),
        currency: this.currencyCode,
        productCodes: productCodeArray,
        tourCodes: tourCodeArray,
        primaryTraveler: this.formPayment.get('bookerEmail').value
      };
      const paramsBookAProduct = {
        demo: true,
        currencyCode: this.currencyCode,
        bookingSource: this.bookingSource,
        partnerDetail: {
          distributorRef: def
        },
        bookerId: this.bookerId,
        booker: {
          firstname: this.formPayment.get('bookerFirstName').value,
          surname: this.formPayment.get('bookerSurName').value,
          title: this.formPayment.get('bookerTitle').value,
          email: this.formPayment.get('bookerEmail').value,
          homePhone: this.formPayment.get('bookerPhone').value,
          homeCity: this.formPayment.get('bookerHomeCity').value
        },
        items: listItems,
        stripeToken: token.id
      };

      this.httpRequestService.makeApayment(paramsMakeApayment).subscribe((resp) => {
        const res = resp.json();
        if (res.status === 'succeeded') {
          console.log('Params Book a Product:', JSON.stringify(paramsBookAProduct));
          this.httpRequestService.bookAProduct(JSON.stringify(paramsBookAProduct)).subscribe((response) => {
            const responseBook = response.json();
            console.log('ResponseBook:', responseBook);
            this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
            if (responseBook.success) {
              this.itemSummaries = responseBook.data.itemSummaries;
              this.selectedIndex += 1;
              LocalStoreService.getInstance().updateCartShopping([]);
              this.eventMsg.sendMessage(MESSAGE_EVENT.msg_update_card_number, 0);
            } else {
              console.log('Error:', responseBook);
              this.openModalService.showModalCommon({
                title: 'booking error',
                message: responseBook.errorMessageText
              });
            }
          });
        }
      });
    }
  }

  print(item) {
    this.voucher = item;
    this.isHideVoucherElement = false;
    this.cd.detectChanges();

    let popupWin;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Hero Explorer Voucher</title>
          <style>
            @page { size: landscape; }
            .review-order-info {
              padding: 1rem;
              display: flex;
              border: 1px solid #D0D0D0
            }
            img {
              width: 292px;
              height: 162px;
              margin-right: 2rem;
            }
            h3 {
              margin-top: 0;
              line-height: 25px;
              font-size: 18px;
              font-family: 'Comfortaa';
              cursor: pointer;
            }
            a {
              color: #28687F;
              text-decoration: none;
            }
            p {
              margin: 0;
              line-height: 20px;
              font-size: 14px;
              font-family: 'Raleway';
            }
            .font-weight-bold {
              font-weight: 600;
            }
          </style>
        </head>
         <body onload="window.print();window.close()">
            ${this.voucherElement.nativeElement.innerHTML}
        </body>
      </html>`);
    popupWin.document.close();
  }
}
