import { Component, OnInit, ViewChild, OnDestroy, ElementRef, ChangeDetectorRef, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { EventMessage } from '../shared/services/event-message/event-message.service';
import { LocalStoreService } from '../shared/services/localstore/localstore.service';
import { HttpRequestService } from '../shared/services/http/http-request.service';
import { OpenModalService } from '../shared/services/open-modal/open-modal.service';
import { MESSAGE_EVENT } from '../../constants';
import { SITE_CONFIG } from '../../config';
import { AuthenticationService } from '../shared/services/authentication.service';
import { formatDate } from '@angular/common';
import { s } from '@angular/core/src/render3';

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
  stripeRef: string;
  paramsMakeApayment: any;
  bookingRefTemp: Array<any> = [];
  newBookingRef: any;
  paymentParams: { token: any; amount: number; bookingReference: any[]; currency: string; productCodes: any[]; tourCodes: any[]; primaryTraveler: any; phoneTraveler: any; };
  bookingRefArray: Array<any> = [];
  productCodeArray: Array<any> = [];
  tourCodeArray: Array<any> = [];
  startTimeArray: Array<any> = [];
  groupParam: Array<any> = [];
  fullToken: any;
  bookParams: Array<any> = [];
  allBookingQuestion: Array<any> = [];
  allBookingForm: Array<any> = [];
  allTravellers: Array<any> = [];
  hideQuestions: boolean;
  cartItems: any[] = [];
  bookingsronly: boolean = true;
  // arrivalMode: Array<any> = [];
  // departureMode: Array<any> = [];
  allMode: Array<any> = [];
  selectedOption: string | null = null;
  selectedOptionDeparture: string | null = null;
  bookingQuestionList: Array<any> = [];
  bookingQuestionAttach: Array<any> = [];
  bookingQuestionPickup: Array<any> = [];
  tourLanguages: Array<any> = [];
  tourLanguagesWithTypes: Array<any> = [];
  orderBookingQuestionPickup: Array<any> = [];
  allowCustomTravelerPickup: boolean = false;
  languageGuideOption: { type: any; language: any; legacyGuide: any; };
  noPickup: string;
  selectedValue: any = '';
  selectPickupOptions: { label: string; value: string; }[];
  showNoArrivalMode: boolean;
  cruiseShip: boolean = false;



  onOptionSelect(option: string): void {
    this.selectedOption = option;
    this.cd.detectChanges();
    // Add logic here to handle the selected option
  }

  onOptionSelectDeparture(option: string): void {
    this.selectedOptionDeparture = option;
    this.cd.detectChanges();
    // Add logic here to handle the selected option
  }
  
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

    console.log('This Local Cart Shopping: ', this.cartShopping);

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
      // this.generateListTravellers();
      this.getListProducts();
    }
    this.router.events.filter((event) => event instanceof NavigationEnd).subscribe((href: any) => {});
  }
  
  @ViewChild('cardInfo') cardInfo: ElementRef;
  @ViewChild('voucherElement') voucherElement: ElementRef;

  formPayment: FormGroup;
  formGroup: FormGroup;
  formSelect: FormGroup; 
  locationPickup: any = [];
  cardHandler = this.onChange.bind(this);
  card: any;
  stripeCard: any;
  voucher: any;
  primaryColor: string;
  secondaryColor: string;
  bookingRef: any;
  bookingOnHold: boolean;

  cartShopping: Array<any> = [];
  listTitle: Array<any> = [{ value: 'Mr' }, { value: 'Mrs' }, { value: 'Miss' }];
  listTabsLabel: Array<string> = ['ADD TO CART', 'REVIEW ORDER', 'SECURE CHECKOUT', 'PRINT VOUCHERS'];
  itemSummaries: Array<any> = [];

  pickupOptions = [
    { label: 'I’d like to be picked up', value: 'pickup' },
    { label: 'I’ll make my own way to the meeting point', value: 'MEET_AT_DEPARTURE_POINT' },
    { label: 'I’ll decide later', value: 'CONTACT_SUPPLIER_LATER' }
  ];

  arrivalModeOptions = [];

  departureModeOptions = [];

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
  bookingQuestions: Array<any> = [];
  selectedUnit: string = '';
  pickupLocations = [];  
  newpickupLocations: any = {};
  isFormReady: boolean = false;
  showPickupLocationDropdown = false;
  filteredQuestionsArrival: { [productCode: string]: any[] } = {}; // Initialize filteredQuestions
  filteredQuestionsDeparture: { [productCode: string]: any[] } = {}; // Initialize filteredQuestions
  currentArrivalModeFilter: string | null = null;
  currentDepartureModeFilter: string | null = null;
  selectedTransferMode: string | null = null; // Track selected transfer mode
  pickupLocationAirport: any = {};
  pickupLocationPort: any = {};
  pickupLocationRail: any = {};
  pickupLocationOther: any = {};
  pickupLocationHotel: any = {};
  pickupLocationElse: any = {};
  currentPickupLocations = [];



  ngOnInit() {
    const primaryColor = localStorage.getItem('primaryColor');
    const secondaryColor = localStorage.getItem('secondaryColor');
    const buttonType = localStorage.getItem('buttonType');
    this.bookingQuestionList = LocalStoreService.getInstance().getListBookingQuestions();
    console.log('Init Booking Question List: ', this.bookingQuestionList);
    console.log('Init Booking Question List Code: ', this.cartShopping[0].code);

    // remove booking questions not related to current product
    
    this.bookingQuestionList = this.bookingQuestionList.filter(
      item => item.productCode == this.cartShopping[0].code
    );

    console.log('Init Booking Question List New: ', this.bookingQuestionList);


    const bookingList = LocalStoreService.getInstance().getListBookingQuestions();
    console.log('Departure Q: ', this.departureModeOptions)
    console.log('Departure List: ', bookingList);
    console.log('Retrieved List:', bookingList);
      if (!Array.isArray(bookingList)) {
        console.error('Error: bookingList is not an array');
      }

    bookingList.forEach(questions => {
      questions.bookingQuestionList.forEach(each => {
        if(each.includes('TRANSFER_PORT_DEPARTURE_TIME')) {
          this.departureModeOptions = [
            ...(this.departureModeOptions || []),
            { label: 'PORT', value: 'TRANSFER_PORT_DEPARTURE' }

          ]
        } else if (each.includes('TRANSFER_AIR_DEPARTURE_AIRLINE')) {
          this.departureModeOptions = [
            ...(this.departureModeOptions || []),
            { label: 'AIR', value: 'TRANSFER_AIR_DEPARTURE' }
          ]
        } else if(each.includes('TRANSFER_RAIL_ARRIVAL_LINE')) {
          this.departureModeOptions = [
            ...(this.departureModeOptions || []),
            { label: 'RAIL', value: 'TRANSFER_RAIL_DEPARTURE' }
          ]
        } else if(each.includes('TRANSFER_PORT_CRUISE_SHIP')) {
          this.cruiseShip = true;
        }
      })
    });

    bookingList.forEach(questions => {
      questions.bookingQuestionList.forEach(each => {
        if(each.includes('TRANSFER_PORT_ARRIVAL_TIME')) {
          this.arrivalModeOptions = [
            ...(this.arrivalModeOptions || []),
            { label: 'PORT', value: 'TRANSFER_PORT' }
          ]
        } else if (each.includes('TRANSFER_AIR_ARRIVAL_AIRLINE')) {
          this.arrivalModeOptions = [
            ...(this.arrivalModeOptions || []),
            { label: 'AIR', value: 'TRANSFER_AIR_ARRIVAL' }
          ]
        } else if(each.includes('TRANSFER_RAIL_DEPARTURE_LINE')) {
          this.arrivalModeOptions = [
            ...(this.arrivalModeOptions || []),
            { label: 'RAIL', value: 'TRANSFER_RAIL_ARRIVAL' }
          ]
        }
      })
    });


    // Rearrange the list
      const rearrangeBookingQuestionList = (list) => {
        const firstNameIndex = list.indexOf("FULL_NAMES_FIRST");
        const lastNameIndex = list.indexOf("FULL_NAMES_LAST");

        // Remove the first name and last name from their current positions
        if (firstNameIndex !== -1) list.splice(firstNameIndex, 1);
        if (lastNameIndex !== -1) list.splice(lastNameIndex > firstNameIndex ? lastNameIndex - 1 : lastNameIndex, 1);

        // Add first name and last name at the start
        list.unshift("FULL_NAMES_FIRST", "FULL_NAMES_LAST");
        return list;
      };

      this.bookingQuestionList[0].bookingQuestionList = rearrangeBookingQuestionList(this.bookingQuestionList[0].bookingQuestionList);

    console.log('Init Booking Question List 2: ', this.bookingQuestionList);

    this.fetchAndMapBookingQuestions().then((updatedList) => {
      
      this.bookingQuestionAttach = updatedList;
      console.log('API Final Attach: ', this.bookingQuestionAttach);
      this.separateBookingQuestions();
      this.generateListTravellers();

      console.log('check latest pickups: ', this.orderBookingQuestionPickup);


    })
    .catch((error) => {
      console.error('Error updating booking questions:', error);
    });
  

    console.log('Init Cart: ', this.cartShopping);

    console.log('Init BQ: ', this.bookingQuestionList);
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

    this.selectPickupOptions = [
      { label: 'Select where you\'d like to be picked up from', value: 'pickup' },
      { label: 'I will select my pickup location later', value: 'CONTACT_SUPPLIER_LATER' }
    ];

    this.formGroup = this.formBuilder.group({ 

    });

    this.formSelect = this.formBuilder.group({
      pickupSelect: ['pickup']
    });
  }
  

  get selectedUnitControl() {
    return this.formGroup.get('selectedUnit');
  }

  updateInputValue(inputFieldRef: HTMLInputElement) {
    inputFieldRef.value = inputFieldRef.value.trim() + ' ' + this.selectedUnit;
  }

  onPickupOptionSelect(event: any): void {
    console.log('Pickup option selected:', event);
  }

    
  pickupSelect(event: any) {
    // Access the selected value directly from the event emitted by ng-select
    console.log('Selected pickup option:', event);
    this.selectedValue = event;
  
    // Optionally, handle logic for the specific selected value
    if (event === 'pickup') {
      // Logic for the 'pickup' option
      
    } else if (event === 'CONTACT_SUPPLIER_LATER') {
      // Logic when "I will select my pickup location later" is chosen
      // No need to do anything specific, just ensure selectedValue is set
    }
  }

  clearPickup() {
    console.log('Selected pickup option clear');
    this.selectedValue = 'pickup'; // When cleared, set the value to null
    this.hideArrivalMode();    // Optionally hide arrival mode if necessary
    this.showNoArrivalMode = false;  // Hide #noArrivalMode when cleared
  }

  hideArrivalMode() {
    // Logic to hide arrival mode
    // You could also just rely on the *ngIf in the template
    console.log('Pickup details cleared, hiding arrival mode');
  }
  

  arrivalModeSelect(event: any, product: any) {
    if(event) {
    const selectedMode = event.value;
    this.currentArrivalModeFilter = selectedMode;
    this.selectedTransferMode = event;
    this.updatePickupLocations(selectedMode);
    const pickupLocationControlName = `PICKUP_POINT_${product.productCode.value}`;
    if (this.formPayment.get(pickupLocationControlName)) {
      this.formPayment.get(pickupLocationControlName).reset();
    }

    // Filter questions based on selected arrival mode
    this.filteredQuestionsArrival[product.productCode.value] = product.bookingQuestionList.filter(question => {
      console.log('Arrival Question: ', question);
      console.log('Arrival Selected: ', selectedMode);
      if(question.id && question.id !== 'TRANSFER_ARRIVAL_MODE') {
        return (
          (question.id.startsWith(selectedMode) || question.id.startsWith('TRANSFER_ARRIVAL')) &&
          question.id !== 'TRANSFER_PORT_DEPARTURE_TIME'
        );
      }
      console.log('Arrival Filter: ', this.filteredQuestionsArrival);
    });
    }
    if(event.value == 'TRANSFER_PORT') {
      this.filteredQuestionsArrival[product.productCode.value] = this.filteredQuestionsArrival[product.productCode.value].filter(
        question => question.id !== 'TRANSFER_ARRIVAL_TIME'
      );
    }
  }

  departureModeSelect(event: any, product: any) {
    if(event) {
    const selectedMode = event.value;
    this.currentDepartureModeFilter = selectedMode;
    console.log('Departure Event: ', event);
    // this.selectedTransferMode = event;
    if (selectedMode === 'HOTEL') {
      console.log('Hotel mode selected, skipping filter logic.');
      this.filteredQuestionsDeparture[product.productCode.value] = [];
      return;
    }

    // Filter questions based on selected arrival mode
    this.filteredQuestionsDeparture[product.productCode.value] = product.bookingQuestionList.filter(question => {
      if(question.id && question.id !== 'TRANSFER_DEPARTURE_MODE') {
        return question.id.startsWith(selectedMode) || question.id.startsWith('TRANSFER_DEPARTURE');     
      } 
    });
    }
  }

  updatePickupLocations(mode: string): void {
    switch (mode) {
      case 'TRANSFER_AIR_ARRIVAL':
        this.currentPickupLocations = this.isNotEmpty(this.pickupLocationAirport) ? this.pickupLocationAirport : [];
        break;
      case 'TRANSFER_RAIL_ARRIVAL':
        this.currentPickupLocations = this.isNotEmpty(this.pickupLocationRail) ? this.pickupLocationRail : [];       
        break;
      case 'TRANSFER_PORT':
        this.currentPickupLocations = this.isNotEmpty(this.pickupLocationPort) ? this.pickupLocationPort : [];       
        break;
      case 'OTHER':
        this.currentPickupLocations = this.isNotEmpty(this.pickupLocationOther) ? this.pickupLocationOther : [];       
        break;
      case 'HOTEL':
        this.currentPickupLocations = this.isNotEmpty(this.pickupLocationHotel) ? this.pickupLocationHotel : [];       
        break;
      default:
        this.currentPickupLocations = [];
    }
  }

  isNotEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }


  getFilteredAllowedAnswers(): any[] {
    let allowedAnswers = [
      { label: 'AIR', value: 'TRANSFER_AIR_ARRIVAL' },
      { label: 'RAIL', value: 'TRANSFER_RAIL_ARRIVAL' },
      { label: 'PORT', value: 'TRANSFER_PORT' },
      { label: 'HOTEL/OTHER', value: 'HOTEL' }
      // { label: 'OTHER', value: 'OTHER' }
    ];


    if (!this.isNotEmpty(this.pickupLocationAirport)) {
      allowedAnswers = allowedAnswers.filter(answer => answer.value !== 'TRANSFER_AIR_ARRIVAL');
    }
    if (!this.isNotEmpty(this.pickupLocationRail)) {
      allowedAnswers = allowedAnswers.filter(answer => answer.value !== 'TRANSFER_RAIL_ARRIVAL');
    }
    if (!this.isNotEmpty(this.pickupLocationPort)) {
      allowedAnswers = allowedAnswers.filter(answer => answer.value !== 'TRANSFER_PORT');
    }
    if (!this.isNotEmpty(this.pickupLocationOther)) {
      allowedAnswers = allowedAnswers.filter(answer => answer.value !== 'OTHER');
    }
    if (!this.isNotEmpty(this.pickupLocationHotel)) {
      allowedAnswers = allowedAnswers.filter(answer => answer.value !== 'HOTEL');
    }
  
    return allowedAnswers;
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
    fetchAndMapBookingQuestions(): Promise<any> { 
      return new Promise((resolve, reject) => {
        this.httpRequestService.getBookingQuestions().subscribe(
          (resp: any) => {
            const res = resp.json();
            console.log('API Question Res: ', res);
            const apiQuestions = res.bookingQuestions;
            const apiQuestionMap = new Map<string, any>(
              apiQuestions.map((q: any) => [q.id, q])
            );
            console.log('API Question Map: ', apiQuestionMap);
            console.log('API Question Map 2: ', this.bookingQuestionList);
          const updatedList = this.bookingQuestionList.map(product => {
            return {
              ...product,
              bookingQuestionList: product.bookingQuestionList.map((questionId: string) => {
                if (apiQuestionMap.has(questionId)) {
                  return {
                    id: questionId,
                    ...apiQuestionMap.get(questionId)
                  };
                } else {
                  return { id: questionId };
                }
              })
            };
          });
            console.log('API Final: ', updatedList);
            resolve(updatedList);
          },
          (error) => {
            console.error('Error fetching booking questions:', error);
            reject(error);
          }
        );
      });
    }

    separateBookingQuestions(): void {
      const updatedAttachList = this.bookingQuestionAttach.map(product => {
        const bookingQuestionList = product.bookingQuestionList;
        const pickupQuestions = bookingQuestionList.filter((q: any) =>
          q.id.toLowerCase().includes('transfer') || q.id.toLowerCase().includes('pickup_point')
        );
        const remainingQuestions = bookingQuestionList.filter((q: any) =>
          !q.id.toLowerCase().includes('transfer') && !q.id.toLowerCase().includes('pickup_point')
        );
  
        console.log('Pickup: ', product);
        this.bookingQuestionPickup.push({
          allowCustomTravelerPickup: this.allowCustomTravelerPickup,
          noPickup: this.noPickup,
          productCode: product.productCode,
          bookingQuestionList: pickupQuestions,
         
        });
  
        return {
          productCode: product.productCode,
          bookingQuestionList: remainingQuestions
        };
      });
  
      this.bookingQuestionAttach = updatedAttachList;
    }


    rearrangeBookingQuestions(bookingQuestionPickup) {
      const rearrangedBookingQuestions = [];
    
      bookingQuestionPickup.forEach(question => {
        const airQuestions = [];
        const portQuestions = [];
        const railQuestions = [];
        const otherQuestions = [];
        const productCode = question.productCode; // Capture the product code
    
        question.bookingQuestionList.forEach(item => {
          if (item.id.includes("AIR")) {
            airQuestions.push(item);
          } else if (item.id.includes("PORT")) {
            portQuestions.push(item);
          } else if (item.id.includes("RAIL")) {
            railQuestions.push(item);
          } else {
            otherQuestions.push(item);
          }
        });
    
        const rearrangedQuestions = [
          // Ensure TRANSFER_ARRIVAL_MODE is first
          ...otherQuestions.filter(q => q.id === "TRANSFER_ARRIVAL_MODE"),
    
          // Group air questions
          ...airQuestions,
    
          // Group port questions
          ...portQuestions,
    
          // Group rail questions
          ...railQuestions,
    
          // Ensure TRANSFER_DEPARTURE_MODE is next
          ...otherQuestions.filter(q => q.id === "TRANSFER_DEPARTURE_MODE"),
    
          // Add remaining questions
          ...otherQuestions.filter(q => q.id !== "TRANSFER_ARRIVAL_MODE" && q.id !== "TRANSFER_DEPARTURE_MODE"),
        ];
    
        // Add product code at the end as a question item
        rearrangedQuestions.push({ "productCode": { "value": productCode } });
    
        // Create an object with productCode and rearranged bookingQuestionList
        const rearrangedObject = {
          allowCustomTravelerPickup: this.allowCustomTravelerPickup,
          noPickup: this.noPickup,
          productCode: { value: productCode },
          bookingQuestionList: rearrangedQuestions
        };
    
        rearrangedBookingQuestions.push(rearrangedObject);
      });
    
      // Assuming you want to update some variable or state with the rearranged data
      this.orderBookingQuestionPickup = rearrangedBookingQuestions;
    }
    
    addNamesIfNotExists() {
      this.bookingQuestionAttach.forEach(product => {
        const fullNameFirstExists = product.bookingQuestionList.some(question => question.id === 'FULL_NAMES_FIRST');
        const fullNameLastExists = product.bookingQuestionList.some(question => question.id === 'FULL_NAMES_LAST');
        
        if (!fullNameFirstExists) {
          product.bookingQuestionList.push({
            id: "FULL_NAMES_FIRST",
            legacyBookingQuestionId: 24,
            type: "STRING",
            group: "PER_BOOKING",
            label: "First Name",
            required: "OPTIONAL",
            maxLength: 100
          });
        }
        
        if (!fullNameLastExists) {
          product.bookingQuestionList.push({
            id: "FULL_NAMES_LAST",
            legacyBookingQuestionId: 25,
            type: "STRING",
            group: "PER_BOOKING",
            label: "Last Name",
            required: "OPTIONAL",
            maxLength: 100
          });
        }
      });
    }


    onLanguageChange(event: any) {
      console.log('Language Change: ', event);
      if (event) {
        this.languageGuideOption = {
          type: event.type,
          language: event.language,
          legacyGuide: event.legacyGuide
        };
      }
      console.log('Language Change 2: ', this.languageGuideOption);
    }
    
  generateListTravellers() {
    console.log('Cart Shopping List: ', this.cartShopping);
    console.log('Latest Booking Questions: ', this.bookingQuestionList);
    console.log('Latest Booking Questions Updated: ', this.bookingQuestionAttach);
    console.log('Latest Booking Questions Pickup: ', this.bookingQuestionPickup);

    this.rearrangeBookingQuestions(this.bookingQuestionPickup);

    console.log('Latest Booking Questions Pickup Re: ', this.orderBookingQuestionPickup);

    // check if Basic Question is in the BQ
    this.addNamesIfNotExists();

    // const formConfig = {};
    // const formConfig = {
    //   stripeFullName: ['', [Validators.required]],
    //   bookerFirstName: ['', [Validators.required]],
    //   bookerSurName: ['', [Validators.required]],
    //   bookerEmail: ['', [Validators.required, Validators.email]],
    //   bookerPhone: [''],
    //   bookerHomeCity: [''],
    //   agreeConditionsAndPrivace: [Validators.requiredTrue]
    // };

    // formConfig for testing
    const formConfig = {
      stripeFullName: ['', [Validators.required]],
      bookerFirstName: ['', [Validators.required]],
      bookerSurName: ['', [Validators.required]],
      // bookerTitle: ['', [Validators.required]],
      bookerEmail: ['', [Validators.required, Validators.email]],
      bookerPhone: [''],
      bookerHomeCity: [''],
      agreeConditionsAndPrivace: [Validators.requiredTrue]
    };

    // Fix this, needs form from stripe / validations
    this.cartShopping.forEach((item, count) => {
      console.log('item just : ', item);
      item.ageBands.forEach((ageBand, index) => {
        if (ageBand.count > 0) {
          console.log('item ageband: ', ageBand);
          ageBand['travellers'] = [];
          for (let x = 0; x < ageBand.count; x++) {
            const randomNumber = Math.floor(Math.random() * Math.floor(9999));
            // Attach the questions to the travellers
            this.bookingQuestionAttach.forEach((bq, counter)=> {
              bq.bookingQuestionList.forEach(q => {
                console.log('BQ ID: ', q.id + '_' + randomNumber);
                const controlName = q.id + '_' + randomNumber;
                formConfig[controlName] = [''];
                // formConfig[controlName] = q.required === 'MANDATORY' ? ['', Validators.required] : [''];
                if(q.id === 'WEIGHT') { formConfig['WEIGHT_unit_' + randomNumber] = ['']}
                if(q.id === 'AGEBAND') { formConfig['AGEBAND_' + randomNumber] = [x]}
                console.log('Check Attach: ', this.bookingQuestionAttach);

                // test data ~ remove if production mode
                if(q.id === 'DATE_OF_BIRTH') { formConfig[controlName] = ['']}
                if(q.id === 'FULL_NAMES_FIRST') { formConfig[controlName] = ['']}
                if(q.id === 'FULL_NAMES_LAST') { formConfig[controlName] = ['']}
                if(q.id === 'PASSPORT_EXPIRY') { formConfig[controlName] = ['']}
                if(q.id === 'PASSPORT_NATIONALITY') { formConfig[controlName] = ['']}
                if(q.id === 'PASSPORT_PASSPORT_NO') { formConfig[controlName] = ['']}
            })
          });
            this.bookingQuestionPickup.forEach((bq, i)=> {
              bq.bookingQuestionList.forEach(q => {
                console.log('BQ ID: ', q.id + '_' + randomNumber);
                formConfig[q.id + '_' + item.code] = [''];
            })
            });
              console.log('Form Config: ', this.formPayment);
              console.log('Arrival Mode Test: ', this.allBookingQuestion);

              // Add Special Requeirement for Form Config
              formConfig['SPECIAL_REQUIREMENTS_' + item.code] = [''];

             ageBand.travellers.push({
              productCode: item.code,
              description: ageBand.ageBand,
              randomNumber: randomNumber,
              travellerNum: x,
              bookingQuestionsFinal: [], 
              bookingQuestionsArrival: [],
              bookingQuestionsDeparture: [],
              bookingQuestionsallMode: [],
              bookingForms: this.allBookingForm,
              bookingQuestions: [],
            });

            if (this.bookingQuestionAttach[x] != null) {
            this.bookingQuestionAttach[x]['randomNumber'] = randomNumber;
            }
          }
        }
      });

      console.log('Item Agebands: ', item);

      item.lstLangServices = []; // Initialize the array

      console.log('Updated cart shopping: ', this.cartShopping);

      console.log('Language 1: ', item.langServices);

      if (item.langServices && Array.isArray(item.langServices) && item.langServices.length > 0) {
        item.langServices.forEach((languageObj) => {
          if (languageObj && typeof languageObj === 'object' && 'language' in languageObj) {
            const languageCode = languageObj.language; // Extract language code
            const languageName = this.getLanguageName(languageCode);
            const langServiceObj = { ...languageObj, id: languageCode, name: languageName }; // Create new object with id and name
            item.lstLangServices.push(langServiceObj); // Push new object to lstLangServices
            this.tourLanguages.push(langServiceObj);
            this.tourLanguagesWithTypes = this.tourLanguages.map(language => ({
              ...language,
              label: `${language.name} - ${language.type}`
            }));
          } else {
            console.log('Invalid language object:', languageObj);
          }
        });
      } else {
        console.log('Language services array is empty or not available for item:', item);
      }
  
      formConfig['langServices_' + item.code] = ['']; 
  
      console.log('Language Items:', item.lstLangServices);
      console.log('Language Items with Types: ', this.tourLanguagesWithTypes);

      formConfig['pickupLocation'] = [''];
      formConfig['custom_pickup_' + item.code] = [''];
      
  
    });

    this.formPayment = this.formBuilder.group(formConfig);
    this.isFormReady = true;
    console.log('Form Config 2 ', this.formPayment);
    console.log('Check Form Values: ', this.formPayment);

    // Single Product Only ~ this.cartShopping[0].code
    const formControlName = `PICKUP_POINT_${this.cartShopping[0].code}`;
    const formControl = this.formPayment.get(formControlName);
    if (formControl) {
    formControl.valueChanges.subscribe(value => {
      if (value === 'pickup') {
        this.showPickupLocationDropdown = true;
        this.formPayment.get('pickupLocation').setValidators(Validators.required);
      } else {
        this.showPickupLocationDropdown = false;
        this.formPayment.get('pickupLocation').clearValidators();
      }
      this.formPayment.get('pickupLocation').updateValueAndValidity();
      });
    }}

  getLanguageName(languageCode: string): string {
    const languages: { [key: string]: string[] } = {
      "English": ["en", "en-US", "en-AU", "en-CA", "en-GB", "en-HK", "en-IE", "en-IN", "en-MY", "en-NZ", "en-PH", "en-SG", "en-ZA"],
      "Danish": ["da"],
      "Dutch": ["nl", "nl-BE"],
      "Norwegian": ["no"],
      "Spanish": ["es", "es-AR", "es-CL", "es-CO", "es-MX", "es-PE", "es-VE"],
      "Swedish": ["sv"],
      "French": ["fr", "fr-BE", "fr-CA", "fr-CH"],
      "Italian": ["it", "it-CH"],
      "German": ["de", "de-DE"],
      "Portuguese": ["pt", "pt-BR"],
      "Japanese": ["ja"],
      "Chinese (traditional)": ["zh-TW"],
      "Chinese (simplified)": ["zh-CN"],
      "Chinese (mandarin)": ["cmn"],
      "Korean": ["ko", "ko-KR"]
    };
  
    for (const key in languages) {
      if (languages[key].includes(languageCode)) {
        return key;
      }
    }
    return 'English'; // Default name when language code is not found in the languages list
  }
  
  getListProducts() {
    this.cartShopping.forEach((item, index) => {
      const stopLoading = index === this.cartShopping.length - 1;
      this.destinationId = item.destId;
      this.getProductDetail(item, stopLoading);
    });
  }

  getProductDetail(item, stopLoading) { // get the product details
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    console.log('new items: ', item);
    this.noPickup = item.noPickup;
    this.httpRequestService.getProductDetail(item.code).subscribe((resp) => {
      const res = resp.json();
      this.pickupLocations = 
      typeof res.logistics.travelerPickup !== 'undefined' ? res.logistics.travelerPickup.locations : [];
      this.allowCustomTravelerPickup = 
      typeof res.logistics.travelerPickup !== 'undefined' ? 
      res.logistics.travelerPickup.allowCustomTravelerPickup : false;

      console.log('Check pickups: ', this.pickupLocations);

      if(this.pickupLocations && this.pickupLocations.length > 0) {
      const hasOtherOrHotel = this.pickupLocations.some(
        item => item.pickupType === "OTHER" || item.pickupType === "HOTEL"
      );
      if(hasOtherOrHotel === true) {
        this.arrivalModeOptions = [
          ...this.arrivalModeOptions,
          { label: 'HOTEL/OTHER', value: 'HOTEL' }
        ];
      }

      this.departureModeOptions = [
        ...this.departureModeOptions,
        { label: 'HOTEL/OTHER', value: 'HOTEL' }
      ];
    }
  
        // Initialize categories
        const categorizedPickupLocations = {
          RAIL: [],
          OTHER: [],
          AIRPORT: [],
          PORT: [],
          HOTEL: []
        };

        // Categorize pickup locations
        if ( this.pickupLocations && this.pickupLocations.length > 0) {
        this.pickupLocations.forEach(location => {
          if (location.pickupType in categorizedPickupLocations) {
            categorizedPickupLocations[location.pickupType].push(location);
          } else {
            // Handle unknown pickup types, if any
            console.error(`Unknown pickup type found: ${location.pickupType}`);
          }
        });
      }

      console.log('Categorized Pickup Locations:', categorizedPickupLocations);


      var locations = categorizedPickupLocations.AIRPORT.map(item => item.location.ref).slice(0, 500);
      const locationsObjectAirport = { locations };

      var locations = categorizedPickupLocations.PORT.map(item => item.location.ref).slice(0, 500);
      const locationsObjectPort = { locations };
      
      var locations = categorizedPickupLocations.OTHER.map(item => item.location.ref).slice(0, 500);
      const locationsObjectOther = { locations };

      var locations = categorizedPickupLocations.RAIL.map(item => item.location.ref).slice(0, 500);
      const locationsObjectRail = { locations };

      var locations = categorizedPickupLocations.HOTEL.map(item => item.location.ref).slice(0, 500);
      const locationsObjectHotel = { locations };

      // Airport
      this.httpRequestService.getProductDetailLocation(locationsObjectAirport).subscribe(
        async (resp) => {
          try {
            const res = await resp.json();
            if(res.code !== 'BAD_REQUEST') {
            this.pickupLocationAirport = res;
              this.pickupLocationAirport = this.pickupLocationAirport.locations.map(location => ({
              label: `${location.name}, ${location.address ? `${location.address.street}, ${location.address.administrativeArea}, ${location.address.state}, ${location.address.country} ${location.address.postcode}` : ''}`,
              value: location.reference
            }));
            if(this.allowCustomTravelerPickup === true) {
              this.pickupLocationHotel.unshift({
                label: "I don't see my pickup location",
                value: "SEE_PICKUP_LOCATION"
              });
              }
            console.log('New Pickup Locations Airport', this.pickupLocationAirport);
           }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        },
        (error) => {
          console.error('HTTP Request Error:', error);
        }
      );

      // Port
      if(locationsObjectPort.locations.length > 0) {
      this.httpRequestService.getProductDetailLocation(locationsObjectPort).subscribe(
        async (resp) => {
          try {
            const res = await resp.json();
            if(res) {
            this.pickupLocationPort = res;   
            this.pickupLocationPort = this.pickupLocationPort.locations.map(location => ({
              label: `${location.name}, ${location.address ? `${location.address.street}, ${location.address.administrativeArea}, ${location.address.state}, ${location.address.country} ${location.address.postcode}` : ''}`,
              value: location.reference
            }));
            if(this.allowCustomTravelerPickup === true) {
              this.pickupLocationPort.unshift({
                label: "I don't see my pickup location",
                value: "SEE_PICKUP_LOCATION"
              });
              }
              console.log('New Pickup Locations Port', this.pickupLocationPort);
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

      // Rail
      if(locationsObjectRail.locations.length > 0) {
      this.httpRequestService.getProductDetailLocation(locationsObjectRail).subscribe(
        async (resp) => {
          try {
            const res = await resp.json();
            console.log('Rail Res: ', res);
            this.pickupLocationRail = res;        
            this.pickupLocationRail = this.pickupLocationRail.locations.map(location => ({
              label: `${location.name}, ${location.address ? `${location.address.street}, ${location.address.administrativeArea}, ${location.address.state}, ${location.address.country} ${location.address.postcode}` : ''}`,
              value: location.reference
            }));
            if(this.allowCustomTravelerPickup === true) {
              this.pickupLocationRail.unshift({
                label: "I don't see my pickup location",
                value: "SEE_PICKUP_LOCATION"
              });
              }
            console.log('New Pickup Locations Rail', this.pickupLocationRail);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        },
        (error) => {
          console.error('HTTP Request Error:', error);
        }
      );
    }

      // Hotel
      if(locationsObjectHotel.locations.length > 0) {
      this.httpRequestService.getProductDetailLocation(locationsObjectHotel).subscribe(
        async (resp) => {
          try {
            const res = await resp.json();
            if(res) {
            this.pickupLocationHotel = res;        
            this.pickupLocationHotel = this.pickupLocationHotel.locations.map(location => ({
              label: `${location.name}, ${location.address ? `${location.address.street}, ${location.address.administrativeArea}, ${location.address.state}, ${location.address.country} ${location.address.postcode}` : ''}`,
              value: location.reference
            }));
            if(this.allowCustomTravelerPickup === true) {
            this.pickupLocationHotel.unshift({
              label: "I don't see my pickup location",
              value: "SEE_PICKUP_LOCATION"
            });
            }
              console.log('New Pickup Locations Hotel', this.pickupLocationHotel);
            // Add other options
            this.pickupLocationHotel = [
              { label: 'I’ll make my own way to the meeting point', value: 'MEET_AT_DEPARTURE_POINT' },
              { label: 'I’ll decide later', value: 'CONTACT_SUPPLIER_LATER' },
              ...this.pickupLocationHotel 
            ];
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

        // Other
        if(locationsObjectOther.locations.length > 0) {
        this.httpRequestService.getProductDetailLocation(locationsObjectOther).subscribe(
          async (resp) => {
            try {
              const res = await resp.json();
              if(res){
              this.pickupLocationOther = res;
              console.log('New Pickup Locations:', this.pickupLocationOther);
          
              this.pickupLocationOther = this.pickupLocationOther.locations.map(location => ({
                label: `${location.name}, ${location.address ? `${location.address.street}, ${location.address.administrativeArea}, ${location.address.state}, ${location.address.country} ${location.address.postcode}` : ''}`,
                value: location.reference
              }));
              if(this.allowCustomTravelerPickup == true){
              this.pickupLocationOther.push({
                "label": "I don't see my pickup location",
                "value": "SEE_PICKUP_LOCATION"
              });
              }
                console.log('New Pickup Locations Other', this.pickupLocationOther);
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
      
      console.log('New Pickup Locations 2 ', this.pickupLocations);
      console.log('Order Details Res: ', res);
      item['title'] = res.title;
      item['thumbnailHiResURL'] = res.images[0].variants[3].url;
      console.log('Item Agebands: ', item.ageBands);
      console.log('item booking date ',item.bookingDate);
      const params = {
        productCode: item.code,
        travelDate: item.bookingDate,
        currency: this.currencyCode,
        paxMix: [],
        title: res.title
      };
      item.ageBands.forEach((ageBandsItems: any) => {
        params['paxMix'].push({
          ageBand: ageBandsItems.ageBand,
          numberOfTravelers: ageBandsItems.count
        });
      });
      // if (item.gradeCode) {
      //   params['tourGradeCode'] = item.gradeCode;
      // }
      console.log('Add Cart Params: ', params);
      this.cartItems.push(params);
      // this.cartItems.push(this.allTravellers);
      console.log('Global AgeBands:  ', item.ageBands);

      const maxTravelersByAgeBand: { [key: string]: number } = {};

      // Calculate maximum number of travelers per age band
      this.cartItems.forEach(cartItem => {
        cartItem.paxMix.forEach(pax => {
          const { ageBand, numberOfTravelers } = pax;
          if (!maxTravelersByAgeBand[ageBand] || numberOfTravelers > maxTravelersByAgeBand[ageBand]) {
            maxTravelersByAgeBand[ageBand] = numberOfTravelers;
          }
        });
      });
      
      // Assign titles to travellers based on maximum number of travelers per age band
      const cartItemsMap: { [key: string]: any } = {};
      this.cartItems.forEach(cartItem => {
        cartItemsMap[cartItem.productCode] = cartItem;
      });
      
      // Assign titles to travellers based on matching productCode in cartItems
      this.allTravellers.forEach(traveller => {
        const cartItem = cartItemsMap[traveller.productCode];
        if (cartItem) {
          traveller.cartTitle = cartItem.title;
        } else {
          // If no matching cart item found, set default title
          traveller.cartTitle = 'Default Title'; // Set your default title here
        }
      });

      console.log('Global Travellers:  ', this.allTravellers);

    //   this.allTravellers.forEach((traveller: any, i) => {
    //     this.cartItems.forEach((cart: any, index) => {
    //       traveller['title'] = cart.title
    //     });
    // });

        //   this.allTravellers.forEach((traveller: any, i) => {
    //     this.cartItems.forEach((cart: any, index) => {
    //         cart['description_' + i] = traveller.description;
    //         cart['randomNumber_' + i] = traveller.randomNumber;
    //         cart['travellerNum_' + i] = traveller.travellerNum;
    //         cart['bookingQuestions_' + i] = traveller.bookingQuestions;
    //         cart['bookingForms_' + i] = traveller.bookingForms;
    //         cart['bookingQuestionsFinal_' + i] = traveller.bookingQuestionsFinal;
    //     });
    // });
    
    

      // this.cartItems.forEach((cart: any, i) => {
      //   cart.description = this.allTravellers[i].description;
      //   cart.randomNumber = this.allTravellers[i].randomNumber;
      //   cart.travellerNum = this.allTravellers[i].travellerNum;
      //   cart.bookingQuestions = this.allTravellers[i].bookingQuestions;
      //   cart.bookingForms = this.allTravellers[i].bookingForms;
      //   cart.bookingQuestionsFinal = this.allTravellers[i].bookingQuestionsFinal;
      // });

      console.log('Global Cart:  ', this.cartItems);


      // this is use to check if product is avail
      this.httpRequestService.loadOptionsOfAProduct(params).subscribe((response) => {
        const result = response.json();
        console.log('Check Price: ', result);
        if (result === null) {
          item['price'] = 'Not available';
          return;
        }
        // let price = parseFloat('0'); // this code overwrites the add to cart option price
        // alert('continue');
        // result.bookableItems.forEach((listPrice: any) => {
        //   console.log('List Price: ', listPrice)
        // });

        // item.ageBands.forEach((ageBand: any) => {
        //   console.log('Each ageband: ', ageBand);
        //   if (ageBand.length > 0) {
        //     const foundItem = result[0].lineItems.filter((i) => i.ageBand === ageBand.ageBand)[0];
        //     console.log('Found Item: ', foundItem);
        //     if (foundItem) {
        //       price += parseFloat((ageBand.count * foundItem.prices[0].price).toString());
        //     }
        //   }
        // });
        console.log(typeof item['price']);
      /*   item['price'] = item['price'].toFixed(2); */
        item['price'] = parseInt(item['price']).toFixed(2);
        console.log('Fixed Price: ', item['price']);
        const total = parseFloat(this.totalPrice.toString()) + parseFloat(item['price'].toString()); // Total Price for Order Page
        this.totalPrice = Number(total.toFixed(2));
        console.log('Price Total: ',  this.totalPrice);
      });

      if (stopLoading) {
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      }
    });
  }

  removeFromCart(item) {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    console.log('Remove Cart Item: ', item);
    const foundItem = this.cartShopping.filter((i) => i.code === item.code)[0];
    if (foundItem) {
      // this works
      console.log('Remove Cart Found Item: ', foundItem);
      const allListOptionsInfo = LocalStoreService.getInstance().getlistOptionsInfo();
      console.log('Remove Cart all List: ', allListOptionsInfo);
      const option = allListOptionsInfo.filter((opt) => opt.productOptionCode === item.code)[0];
      if (option) {
        console.log('Remove Cart Option: ', option);
        allListOptionsInfo.splice(allListOptionsInfo.indexOf(option), 1);
        LocalStoreService.getInstance().updateListOptionsInfo(allListOptionsInfo);
      }
      // remove from cart shopping
      // ability to remove old items in the cart
      const price = (item.price === 'Not available' || item.price === undefined) ? 0 : item.price.toString();
      const total = parseFloat(this.totalPrice.toString()) - parseFloat(price);
      this.totalPrice = Number(total.toFixed(2));
      foundItem.ageBands.forEach((ageBand, index) => {
        if (ageBand.count > 0) {
          ageBand.travellers.forEach((person) => {
            // this.formPayment.removeControl('FULL_NAMES_FIRST_' + person.randomNumber);
            // this.formPayment.removeControl('FULL_NAMES_LAST_' + person.randomNumber);
          });
        }
      });
      try {

        console.log('Check Booking Question Attach: ', this.bookingQuestionAttach);
        console.log('Check Booking Question Pickup:', this.bookingQuestionPickup);

        // remove all form configs from booking questions

        if (this.bookingQuestionAttach && this.bookingQuestionAttach.length > 0) {
          this.bookingQuestionAttach.forEach(( list => {
              list.bookingQuestionList.forEach(( question => { 
                console.log('Removing Q1: ', question.id + '_' + list.randomNumber)
                console.log('Removing Q2: ', question.id + '_' + list.productCode)
                this.formPayment.removeControl(question.id + '_' + list.randomNumber)
                this.formPayment.removeControl(question.id + '_' + list.productCode)
              }))
          }))
        }

        if (this.bookingQuestionPickup && this.bookingQuestionPickup.length > 0) {
          this.bookingQuestionPickup.forEach(( list => {
              list.bookingQuestionList.forEach(( question => { 
                console.log('Removing Q3: ', question.id + '_' + list.randomNumber)
                console.log('Removing Q4: ', question.id + '_' + list.productCode)
                this.formPayment.removeControl(question.id + '_' + list.randomNumber)
                this.formPayment.removeControl(question.id + '_' + list.productCode)
              }))
          }))
        }

        if (foundItem.bookingQuestions && foundItem.bookingQuestions.length > 0) {

          foundItem.bookingQuestions.forEach((question, index) => {
            console.log('Test Booking Ques: ', question);
            // this.formPayment.removeControl('questionByProduct_' + this.bookingQuestions[index].id); // need to fix
          });

          // remove define first name and last name from agebands



        }
      } catch {}

      this.cartShopping.splice(this.cartShopping.indexOf(foundItem), 1);
      LocalStoreService.getInstance().updateCartShopping(this.cartShopping);
      console.log('Remove Cart Final: ', this.cartShopping);

      // clear all booking questions
      this.bookingQuestionList = [];
      this.bookingQuestionAttach= [];
      this.bookingQuestionPickup = [];
      console.log('Final Booking Questions: ', this.bookingQuestionList);
      console.log('Final Booking Questions Updated: ', this.bookingQuestionAttach);
      console.log('Final Booking Questions Pickup: ', this.bookingQuestionPickup);
      LocalStoreService.getInstance().clearListBookingQuestions();
      if (this.cartShopping.length === 0) {
        this.router.navigate(['list-result/' + this.destinationId + '/0/0']); // need to fix
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
    console.log('This Form Payment: ', this.formPayment);
  
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
      const bookingRefArray = [];
  
      let def = [];
      
      this.cartShopping.forEach((cartdef: any, i) => {
        console.log('Cart def: ', cartdef);
        const initdef = `heroexplorer_${this.formPayment.get('bookerEmail').value}${cartdef.bookingDate.toString()}.${currentTime}_${i}`;
        this.cartItems[i]['partnerBookingRef'] = initdef;
        console.log('Partner Booking Ref: ', initdef);
        console.log('Partner Booking Ref 2: ', this.cartItems);
      });

      console.log('Partner Booking Ref 3: ', this.cartItems);
      const promises = this.cartShopping.map((item: any, count) => {
        const params = {
          productCode: item.code,
          travelDate: item.bookingDate,
          currency: this.currencyCode,
          paxMix: [],
          partnerBookingRef: this.cartItems[count].partnerBookingRef
        };
  
        console.log('Booking Ref Item: ', item);
        if (item.gradeTitle) params['productOptionCode'] = item.gradeTitle;
  
        item.ageBands.forEach((ageBandsItems: any) => {
          params['paxMix'].push({
            ageBand: ageBandsItems.ageBand,
            numberOfTravelers: ageBandsItems.count
          });
        });
  
        if (item.startTime !== '') {
          params['startTime'] = item.startTime;
        }

        this.bookParams.push(params);
        console.log('Booking Ref Params: ', params);
        this.cartItems[count]['bookingRef'] = 'BR-12345'; // booking referrence for testing

        
        return this.httpRequestService.bookAProductHold(params).toPromise()
          .then((resp) => {
            const res = resp.json();
            if(res.code !== 'BAD_REQUEST') {
            this.bookingRef = res.bookingRef;
            console.log('Booking Ref: ', res);
            this.cartItems[count]['bookingRef'] = res.bookingRef; // direct push bookingRef to cartItems
            this.bookingRefArray.push({ bookingReference: res.bookingRef });
  
            // Hold the product and get the Booking Reference ~ need to validate if all booking has been put on hold
            this.productCodeArray.push({ productCode: item.code });
            this.tourCodeArray.push({ tourCode: item.gradeTitle });
            this.startTimeArray.push({ startTime: item.startTime });
            } else {
              this.openModalService.showModalCommon({
                title: 'Booking Error',
                message: '"' + res.message + '". We apologize for the inconvenience, an error occured. If you believe you have been charged, you will be refunded, contact hello@heroexplorer.com for further help.'
              });
              console.error('Error while booking product hold:', error);
              throw error;
            }
          })
          .catch((error) => {
            console.error('Error while booking product hold:', error);
            throw error; // Propagate the error for handling at the higher level if needed
          });
      });
  
      try {
        // Wait for all promises to resolve
        await Promise.all(promises);
  
        // make a payment
        this.groupParam['productCodes'] = this.productCodeArray;
        this.groupParam['tourCodes'] = this.tourCodeArray;
        this.groupParam['bookingReference'] = this.bookingRefArray;
        this.groupParam['startTime'] = this.startTimeArray;
        this.groupParam['token'] = token;

        console.log('This Group Params: ', this.groupParam);
  
        await this.processPayment(this.groupParam);
      } catch (error) {
        console.error('Error in booking product holds:', error);
      } finally {
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      }
    }
  }
  
  processPayment(params: any) {
    const paramsMakeApayment = {
      token: params.token.id,
      amount: Math.round(this.totalPrice * 100),
      bookingReference: params.bookingReference,
      currency: this.currencyCode,
      productCodes: params.productCodes,
      tourCodes: params.tourCodes,
      startTime: params.startTime,
      primaryTraveler: this.formPayment.get('bookerEmail').value,
      phoneTraveler: this.formPayment.get('bookerPhone').value
    };
    console.log('Process Payment par: ', params);
    console.log('global params: ', this.bookParams);
    console.log('Error Form ', this.allBookingForm);
    console.log('Global Cart: ', this.cartItems);


    return this.httpRequestService.makeApayment(paramsMakeApayment).toPromise()
      .then((resp) => {
        const res = resp.json();
        console.log('Process Payment Res: ', res);
        // NOT WORKING YET

        res.status == 'succeeded'; // force successful payment for testing

        if (res.status === 'succeeded') {

          // check how many items in the cart ~ since payment is only done once

          console.log('Params for Payment: ', paramsMakeApayment);

          
          for (let index = 0; index < paramsMakeApayment.bookingReference.length; index++) {

            console.log('Each product: ', paramsMakeApayment.bookingReference); // if bookingReference is more than 1 ~ multiple products
          
          

          const bookParams = { 
            productCodes: paramsMakeApayment.productCodes[index].productCode,
            productOptionCodes: paramsMakeApayment.tourCodes[index].tourCode,
            startTime: paramsMakeApayment.startTime[index].startTime,
            currency: this.currencyCode,
            partnerBookingRef: [], // should be dynamic
            travelDate: '', // need to get this on Global Cart
            paxMix: [], // need to get this on Global Cart
            languageGuide: this.languageGuideOption, //single product only
            bookingRef: paramsMakeApayment.bookingReference[index].bookingReference,
            bookingQuestionAnswers: [],
            bookerInfo: {
                firstName: this.formPayment.get('bookerFirstName').value,
                lastName: this.formPayment.get('bookerSurName').value,
              },
            bookerhomeCity: this.formPayment.get('bookerHomeCity').value,
            bookerId: this.bookerId,
            bookingSource: this.bookingSource,
            stripeToken: params.token.id,
            communication:{
              email: this.formPayment.get('bookerEmail').value,
              phone: this.formPayment.get('bookerPhone').value
            },
            additionalBookingDetails: {
              voucherDetails: {
              companyName: 'Herobe IP Pty Ltd trading as Hero Explorer',
              email: 'hello@heroexplorer.com',
              phone: '+61 7 4763 0295',
              voucherText: 'For any enquiries, please visit our customer support page at https://support.heroexplorer.com/',
              }
              }
          };
          if(bookParams.productOptionCodes === undefined) { delete bookParams.productOptionCodes }
          if(bookParams.startTime === undefined) { delete bookParams.startTime }

          // Pickup Questions / Answers

          if (this.bookingQuestionPickup && this.bookingQuestionPickup.length > 0) {
            this.bookingQuestionPickup.forEach(( list => {
              list.bookingQuestionList.forEach(( question => {
                const mode = this.formPayment.get(question.id + '_' + list.productCode).value;
                var answer: string = '';
                switch (mode) {
                  case 'TRANSFER_AIR_ARRIVAL':
                    var answer = 'AIR';
                    break;
                  case 'TRANSFER_RAIL_ARRIVAL':
                    var answer = 'RAIL';
                    break;
                  case 'TRANSFER_PORT':
                    var answer = 'SEA';
                    break;
                  case 'HOTEL':
                    var answer = 'OTHER';
                    break;
                  case 'TRANSFER_AIR_DEPARTURE':
                    var answer = 'AIR';
                    break;
                  case 'TRANSFER_RAIL_DEPARTURE':
                    var answer = 'RAIL';
                    break;
                  case 'TRANSFER_PORT_DEPARTURE':
                    var answer = 'SEA';
                    break;
                  default:
                    var answerobj = this.formPayment.get(question.id + '_' + list.productCode).value
                }
                if((question.id === 'PICKUP_POINT') && this.noPickup === 'share'){
                  const pickupInfo = {
                    question: question.id, 
                    answer: 'MEET_AT_DEPARTURE_POINT',
                    unit: 'LOCATION_REFERENCE'
                  };
                  const otherArrivalMode = {
                    question: 'TRANSFER_ARRIVAL_MODE', 
                    answer: 'OTHER'
                  };
                  const otherDepartureMode = {
                    question: 'TRANSFER_DEPARTURE_MODE', 
                    answer: 'OTHER'
                  };
                  bookParams.bookingQuestionAnswers.push(pickupInfo);
                  bookParams.bookingQuestionAnswers.push(otherArrivalMode);
                  bookParams.bookingQuestionAnswers.push(otherDepartureMode);

                } else if((question.id === 'PICKUP_POINT') && this.noPickup === 'private'){

                  // check mode
                  const customPickup = this.formPayment.get('custom_pickup_' + list.productCode).value
                  console.log('Check Mode: ', customPickup);
                  if(customPickup) {
                    const pickupInfo = {
                      question: question.id, 
                      answer: customPickup,
                      unit: 'FREETEXT'
                    };
                    bookParams.bookingQuestionAnswers.push(pickupInfo);
                    const otherArrivalMode = {
                      question: 'TRANSFER_ARRIVAL_MODE', 
                      answer: 'OTHER'
                    };
                    const otherDepartureMode = {
                      question: 'TRANSFER_DEPARTURE_MODE', 
                      answer: 'OTHER'
                    };
                    bookParams.bookingQuestionAnswers.push(otherArrivalMode);
                    bookParams.bookingQuestionAnswers.push(otherDepartureMode);

                  } else {
                    const pickupInfo = {
                      question: question.id, 
                      answer: (answer) ? answer : answerobj,
                      unit: 'LOCATION_REFERENCE'
                    };
                    bookParams.bookingQuestionAnswers.push(pickupInfo);
                    const otherDepartureMode = {
                      question: 'TRANSFER_DEPARTURE_MODE', 
                      answer: 'OTHER'
                    };
                    bookParams.bookingQuestionAnswers.push(otherDepartureMode);
                  }

                  
                } else if(question.id === 'PICKUP_POINT') {

                  // check if custom pickup is answered

                  const customPickup = this.formPayment.get('custom_pickup_' + list.productCode).value

                  if (customPickup) {
                    const pickupInfo = {
                      question: question.id, 
                      answer: customPickup,
                      unit: 'FREETEXT'
                    };
                    bookParams.bookingQuestionAnswers.push(pickupInfo);
                  } else {
                    const pickupInfo = {
                      question: question.id, 
                      answer: (answer) ? answer : answerobj,
                      unit: 'LOCATION_REFERENCE'
                    };
                    bookParams.bookingQuestionAnswers.push(pickupInfo);
                    }
                } else if (question.id === 'TRANSFER_DEPARTURE_PICKUP' || question.id === 'TRANSFER_ARRIVAL_DROP_OFF') {
                  const pickupInfo = {
                    question: question.id, 
                    answer: (answer) ? answer : answerobj,
                    unit: 'FREETEXT'
                  };
                  bookParams.bookingQuestionAnswers.push(pickupInfo);
                } else if (mode !== '') {
                const pickupInfo = {
                  question: question.id, 
                  answer: (answer) ? answer : answerobj
                  // travelerNum: this.formPayment.get(question.id + '_' + list.productCode).value,
                };
                bookParams.bookingQuestionAnswers.push(pickupInfo);
              }
              }))
            }))
          }

          // Remove any question where the answer is an empty string
          bookParams.bookingQuestionAnswers = bookParams.bookingQuestionAnswers.filter(
            (answer) => answer.answer !== ""
          );

          if (this.bookingQuestionAttach && this.bookingQuestionAttach.length > 0) {
            this.bookingQuestionAttach.forEach(( list => {

              //ageband check
              this.cartItems.forEach(( ageBand, count) => {


                list.bookingQuestionList.forEach(( question => { 

                  console.log('Attach Questions: ', question);
                  console.log('Attach List: ', list);
                  console.log('Attach Ageband: ', ageBand);
                  console.log('Attach Count: ', count);
                  
                  // ageBand.paxMix = bookParams.paxMix.filter(
                  //   (pax) => pax.numberOfTravelers !== 0
                  // );


                  // for (let x = 0; x < this.cartItems.length; index++) {
                  for (let x = 1; x <= ageBand.paxMix[count].numberOfTravelers; x++) {
                    if(question.id === 'AGEBAND') {
                      const bookingAnswer = {
                        question: question.id,
                        answer: ageBand.paxMix[count].ageBand,
                        travelerNum: x
                      }
                      console.log('Attach Answer: ', bookingAnswer)
                      bookParams.bookingQuestionAnswers.push(bookingAnswer);
                    } else {
                    if(question.id !== 'SPECIAL_REQUIREMENTS'){
                    const bookingAnswer = {
                      question: question.id,
                      answer: this.formPayment.get(question.id + '_' + list.randomNumber).value,
                      travelerNum: x
                    }
                    console.log('Attach Answer: ', bookingAnswer)
                    bookParams.bookingQuestionAnswers.push(bookingAnswer);
                  }}
                }
              

              }))
              })
            }))
          }

          for (let index = 0; index < this.cartShopping.length; index++) {
            const travelerInfo = {
              question: 'SPECIAL_REQUIREMENTS',
              answer: this.formPayment.get('SPECIAL_REQUIREMENTS_' + this.cartShopping[index].code).value // get the product code of all products in cart
              }
          bookParams.bookingQuestionAnswers.push(travelerInfo);
          }
          console.log('Final Booking Params: ', bookParams)
          console.log('Final Booking Q: ', this.allBookingQuestion);
          console.log('Final Booking F: ', this.allBookingForm);
          console.log('Final Ageband: ', this.allTravellers);
          console.log('Number of items in cart:', this.cartItems);

        this.processCartItems(bookParams, index); 
        }}  
      })
      .catch((error) => {
        console.error('Error while processing payment:', error);
        throw error;
        // create refund here
      });
  }

  async processCartItems(bookParams: any, index: any) {
    try {
        const book = this.cartItems[index];
        console.log('Cart Bookings 1: ', book);
        console.log('Cart Bookings Ref: ', bookParams.bookingRef[index]);
        console.log('Cart Bookings Params: ', bookParams);
        book['bookingQuestionAnswers'] = [];

        // transfer bookParams obj to book for final booking
        if(bookParams.startTime) { book['startTime'] = bookParams.startTime }
        if(bookParams.productOptionCodes) { book['productOptionCode'] = bookParams.productOptionCodes }
        book['languageGuide'] = bookParams.languageGuide;
        book['bookerInfo'] = bookParams.bookerInfo;
        book['bookingQuestionAnswers'] = bookParams.bookingQuestionAnswers;        
        book['communication'] = bookParams.communication;
        book['additionalBookingDetails'] = bookParams.additionalBookingDetails;
        book['stripeToken'] = bookParams.stripeToken;
        book['bookingSource'] = this.bookingSource;
        book['bookerhomeCity'] = bookParams.bookerhomeCity;

        console.log('Cart Bookings Final: ', book);

        const resp = await this.httpRequestService.bookAProduct(book).toPromise();
        const res = resp.json();
        console.log('Cart Bookings Res: ', res);
              if (res.status == 'CONFIRMED') {
              this.cartShopping[index]['voucherUrl'] = res.voucherInfo.url;
              console.log('Booked Cart Shopping: ', this.cartShopping);
                this.selectedIndex += 1;
                LocalStoreService.getInstance().clearCartShopping();
                // clear all booking questions
                this.bookingQuestionList = [];
                this.bookingQuestionAttach= [];
                this.bookingQuestionPickup = [];
                console.log('Final Booking Questions: ', this.bookingQuestionList);
                console.log('Final Booking Questions Updated: ', this.bookingQuestionAttach);
                console.log('Final Booking Questions Pickup: ', this.bookingQuestionPickup);
                LocalStoreService.getInstance().clearListBookingQuestions();
                this.eventMsg.sendMessage(MESSAGE_EVENT.msg_update_card_number, 0);
              } else {
                console.log('Error:', res);
                this.openModalService.showModalCommon({
                  title: 'Booking Error',
                  message: '"' + res.message + '". We apologize for the inconvenience, an error occured. If you believe you have been charged, you will be refunded, contact hello@heroexplorer.com for further help.'
                });
                // need to add a code here for a refund
              } 
    } catch (error) {
      console.error('Error booking product:', error);
      // Handle error as needed
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
