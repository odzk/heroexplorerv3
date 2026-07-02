import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { EventMessage } from '../shared/services/event-message/event-message.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationFormService } from '../shared/services/validation-form/validation-form.service';
import { AuthenticationService } from '../shared/services/authentication.service';
import { MESSAGE_EVENT, SYSTEM_MESSAGE } from '../../constants';
import { ToastrService } from 'ngx-toastr';
import { HttpRequestService } from '../shared/services/http/http-request.service';
import { environment } from '../../environments/environment';
import { UtilService } from '../shared/services/util/util.service';
import { ItemsControl } from 'ngx-carousel/src/ngx-carousel/ngx-carousel.interface';
import { OpenModalService } from '../shared/services/open-modal/open-modal.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploaderOptions, UploadInput, UploadOutput } from 'ngx-uploader';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface CustomSettings {

  adminSubdomain: string;
  subdomain: string;
  button_type?: string;
  color_scheme?: ColorScheme;
  logo_settings?: LogoSettings;
  price_settings?: PriceSettings;
}

export interface ColorScheme {
  text_color?: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface LogoSettings {
  width?: number;
  url?: string;
  optimize_url?: string;
  height?: number;
}

export interface PriceSettings {
  text_color?: string;
}

@Component({

  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class MyProfileComponent implements OnInit {

  public uploadInput: EventEmitter<UploadInput>;
  public options: UploaderOptions = {
    concurrency: 1,
    maxUploads: 1,
    allowedContentTypes: ['image/png', 'image/jpeg', 'image/jpg']
  };
  public customSettingsForm: FormGroup = this.fb.group({
    // subdomain: new FormControl(''),
    button_type: new FormControl(''),
    color_scheme: this.fb.group({
      text_color: new FormControl(''),
      primary_color: new FormControl(''),
      secondary_color: new FormControl(''),
      adminSubdomain: new FormControl('')
    }),
    logo_settings: this.fb.group({
      width: new FormControl('345'),
      url: new FormControl(''),
      optimize_url: new FormControl(''),
      height: new FormControl('67')
    }),
    price_settings: this.fb.group({
      text_color: new FormControl('')
    })
  });
  public adminSettingsForm: FormGroup = this.fb.group({
    add_subdomain: new FormControl('')
  });
  public heroUserSubdomainForm: FormGroup = this.fb.group({
    email: new FormControl(''),
    subdomain: new FormControl('')
  });
  allList: Array<any> = [];
  allHeroUsers: Array<any> = [];
  sd: string;
  customizeSettings: any;
  primaryColor: any;
  secondaryColor: any;

  displayedColumnsPrev: string[] = ['name', 'email', 'productCode', 'travelDate', 'orderDate', 'bookingReference', 'totalPricePaid'];
  displayedColumns: string[] = ['voucher', 'cancel', 'name', 'email', 'productCode', 'travelDate', 'orderDate', 'bookingReference', 'totalPricePaid'];
  displayedColumnsAllBookings: string[] = ['voucher', 'cancel', 'name', 'email', 'productCode', 'travelDate', 'orderDate', 'bookingReference', 'totalPricePaid', 'bookingSource']
  displayedColumnsAllPrevBookings: string[] = ['name', 'email', 'productCode', 'travelDate', 'orderDate', 'bookingReference', 'totalPricePaid', 'bookingSource']
  travelDate: any;
  orderDate: any;
  bookingReference: any;
  totalPricePaid: any;
  taxPaid: any;
  commissionPaid: any;
  transactionFee: any;
  netAmount: any;

  message: any;
  changePasswordForm: any;
  email: any;
  offset: any = 0;
  limit: any = 10;
  prevoffset: any = 0;
  prevlimit: any = 10;
  prevmore: any = true;
  bookingCount: any;
  userData: any;
  recordId: any;
  adminSub: any;


  offsetHistory: any = 0;
  limitHistory: any = 10;
  lstBookingHistories: Array<any> = [];
  allBookingsSub: Array<any> = [];
  allBookingsSubPrev: Array<any> = [];
  allBookingsSubAdmin: Array<any> = [];
  allPrevBookingsSubAdmin: Array<any> = [];
  bookingHistoryCount: any;
  bookingHistoryCountSub: any;

  startDate: any = '';
  endDate: any = '';
  startDateForm = new FormControl(this.startDate);
  endDateForm = new FormControl(this.endDate);
  errorSelectDates = false;

  // Report Bookings
  reportBookings: Array<any> = [];
  reportBookingsOffset: any = 0;
  reportBookingsLimit: any = 10;
  reportBookingsPrevmore: any = true;
  downloadReportBookingsHeaders: any = {
    // 'name': 'Name',
    // 'email': 'Email',
    'productCode': 'Product Code',
    'travelDate': 'Travel Date',
    'orderDate': 'Order Date',
    'bookingReference': 'Booking Reference',
    'totalPricePaid': 'Total Price Paid',
    'bookingSource': 'Source of Booking',
    // 'voucher': 'Voucher'
  };
  displayedColumnsReportBookings: string[] = [
    // 'name',
    // 'email',
    'productCode',
    'travelDate',
    'orderDate',
    'bookingReference',
    'totalPricePaid',
    'bookingSource',
    // 'voucher'
  ];

  // Report Users
  reportUsers: Array<any> = [];
  reportUsersOffset: any = 0;
  reportUsersLimit: any = 10;
  reportUsersPrevmore: any = true;
  downloadReportUsersHeaders: any = {
    'id': 'ID',
    'username': 'Username',
    'firstname': 'First Name',
    'lastname': 'Last Name',
    'email': 'Email',
    'mobile': 'Mobile',
    'city': 'City',
    'country': 'Country',
    'province': 'Province',
    'postcode': 'Postcode',
    'billingadress': 'Billing Address',
    'subdomain': 'Subdomain'
  };
  displayedColumnsReportUsers: string[] = [
    'id', 
    'username', 
    'firstname', 
    'lastname', 
    'email', 
    'mobile', 
    'city', 
    'country', 
    'province',
    'postcode',
    'billingadress',
    'subdomain'
  ];

  pages = [
    '/assets/images/home-header-bg-1.jpeg',
    '/assets/images/home-header-bg-2.jpeg',
    '/assets/images/home-header-bg-3.jpg'
  ];
  listBookingOption = [
    { id: 1, name: 'Change the name\'s on my voucher' },
    { id: 2, name: 'Add or Remove travelers' },
    { id: 3, name: 'Change tour option' },
    { id: 4, name: 'Change the date of my booking' },
    { id: 5, name: 'Cancel my booking' }
  ]

  openVoucherUrl(url: string): void {
    window.open(url, '_blank');
  }

  bookingOptionId : any = [];

  listCancelBookingReasons : any = [];

  listReasonOption = [
    { id: 1, reasonCode: 'Customer_Service.Duplicate_Booking', name: 'Duplicate Booking' },
    { id: 2, reasonCode: 'Customer_Service.Unexpected_medical_circumstances', name: 'Unexpected medical circumstances' },
    { id: 3, reasonCode: 'Customer_Service.I_canceled_my_entire_trip', name: 'I canceled my entire trip' },
    { id: 4, reasonCode: 'Customer_Service.Chose_a_different_cheaper_tour', name: 'Chose a different/cheaper tour' },
    { id: 5, reasonCode: 'Customer_Service.Significant_global_event', name: 'Significant global event' },
    { id: 6, reasonCode: 'Customer_Service.Weather', name: 'Weather' },
    { id: 7, reasonCode: 'Customer_Service.Booked_wrong_tour_date', name: 'Booked wrong tour date' }

    
    
    // { id: 51, name: 'Airline Flight Cancellation - Affects Customer/Traveller' },
    // { id: 52, name: 'Airline Schedule Change - Unacceptable to Customer/Traveller' },
    // { id: 53, name: 'Death - Customer/Traveller or Immediate Family' },
    // { id: 54, name: 'Jury Duty/Court Summons - Affects Customer/Traveller' },
    // { id: 55, name: 'Discretionary Cancellation (Viator Use Only)' },
    // { id: 56, name: 'Medical Emergency/Hospitalization - Customer/Traveller or Immediate Family' },
    // { id: 57, name: 'Military Service - Affects Customer/Traveller' },
    // { id: 58, name: 'Natural Disaster (Earthquake, Fire, Flood) - Affects Customer/Traveller' },
    // { id: 59, name: 'Service Complaint - Denied Trip Add On Service' },
    // { id: 62, name: 'Transport Strike/Labor Dispute - Affects Customer/Traveller' },
    // { id: 63, name: 'Trip Add On Supplier Cancellation' },
    // { id: 71, name: 'Credit Card Fraud' },
    // { id: 72, name: 'Car Segment Cancellation - Affects Customer/Traveller' },
    // { id: 73, name: 'Package Segment Cancellation - Affects Customer/Traveller' },
    // { id: 74, name: 'Hotel Segment Cancellation - Affects Customer/Traveller' },
    // { id: 77, name: 'Re-book' },
    // { id: 78, name: 'Duplicate Purchase' },
    // { id: 82, name: 'Honest Mistake - Incorrect Purchase' },
    // { id: 87, name: 'Non-Refundable Cancellation (Outside 2 Days of Travel/Not Cencellation Event)' },
    // { id: 88, name: 'Non-Refundable Cancellation (Within 2 Days of Travel)' },
    // { id: 98, name: 'Customer Service/Technical Support Response Outside Time Limit' },
    // { id: 99, name: 'Duplicate Processing' }
  ]
  reasonOptionId  : any = []

  lstMyBookings: Array<any> = [];
  subDomain: any;
  file: any;
  imagePreview: any;
  dragOver: boolean;
  imageURL: any;
  s3url: any;
  buttonTypeOpt: any;
  newSubDomain: any;
  adminId: any;
  currentId: any;
  logoHeight: any;
  logoWidth: any;
  constructor(private router: Router, private formBuilder: FormBuilder,
    private eventMsg: EventMessage,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private validationFormService: ValidationFormService,
    private httpRequestService: HttpRequestService,
    private authenticationService: AuthenticationService,
    private sanitizer: DomSanitizer,
    private openModalService: OpenModalService) {
    this.changePasswordForm = this.formBuilder.group({
      'password': ['', [Validators.required, this.validationFormService.passwordValidator]],
      'confirmPassword': ['', [Validators.required, this.validationFormService.confirmPasswordValidator]],
    });
    this.email = this.authenticationService.LoginInfo.email;
    this.uploadInput = new EventEmitter<UploadInput>();
  }

  ngOnInit() {
    //get subdomain
    const domain = /:\/\/([^\/]+)/.exec(window.location.href)[1];
    if (domain.indexOf('.') > -1) {
      const subdomain = domain.split('.')[0];
      if (subdomain) {
        this.subDomain = subdomain;
      } else {
        this.subDomain = 'www';
      }
    } else {
      this.subDomain = 'www';
    }
    this.getSubDomain();
    this.getUserRole();
    this.getAllSubdomain();
    // this.getCancelBookingReasons();
    this.getCancelReasons();
  }

  ngAfterViewInit() {
    const matActive =  Array.from(document.getElementsByClassName('mat-tab-label-active') as HTMLCollectionOf<HTMLElement>);
    const matLabel =  Array.from(document.getElementsByClassName('mat-tab-label') as HTMLCollectionOf<HTMLElement>);
    const matInk =  Array.from(document.getElementsByClassName('mat-ink-bar') as HTMLCollectionOf<HTMLElement>);


    for (let num = 0; num < matLabel.length; num++) {
      matLabel[num].style['background-color'] = "#ffffff";
    }
    const primaryColor = localStorage.getItem('primaryColor');
    const secondaryColor = localStorage.getItem('secondaryColor');
    const logo_url = localStorage.getItem('logoUrl');
    const logo_height = localStorage.getItem('logoHeight');
    const logo_width = localStorage.getItem('logoWidth');

    if (primaryColor) {
      this.primaryColor = primaryColor;
      this.secondaryColor = secondaryColor;      
    } else {
      this.primaryColor = "#CC5757";
    }
    for (let num = 0; num < matLabel.length; num++) {
      matLabel[num].style['background-color'] = "#ffffff";
      matLabel[num].style['border-bottom'] = "3px solid " + this.primaryColor;
    }

    matActive[0].style['background-color'] = this.primaryColor;
    matInk[0].style['background-color'] = this.primaryColor;

    this.httpRequestService.getSettingsByDomain(this.subDomain).subscribe(resp => {
      const res = resp.json();
      if(res){
      this.buttonTypeOpt = res.button_type;
      this.primaryColor = res.primary_color;
      this.secondaryColor = res.secondary_color;
      this.customSettingsForm.patchValue({ color_scheme: { adminSubdomain : res.subdomain }} );
      this.customSettingsForm.patchValue({ color_scheme: { primary_color: res.primary_color } });
      this.customSettingsForm.patchValue({ color_scheme: { secondary_color: res.secondary_color } });
      this.customSettingsForm.patchValue({ logo_settings: { url: res.logo_url } });
      this.customSettingsForm.patchValue({ logo_settings: { width: res.logo_width } });
      this.customSettingsForm.patchValue({ logo_settings: { height: res.logo_height } });
      matActive[0].style['background-color'] = res.primary_color;
      matInk[0].style['background-color'] = res.primary_color;
      } else {
        this.primaryColor = "#CC5757";
      }
    });
  }

  getSubDomain() {
    this.httpRequestService.getSettingsByDomain(this.subDomain).subscribe(resp => {
      const res = resp.json();
      if(res) {
      this.recordId = res.id;
      console.log('Record Id: ', this.recordId);
      }
    });
  }
  getUserRole() {
    this.httpRequestService.getHeroUserDetailByEmail(this.authenticationService.LoginInfo.email).subscribe((resp) => {
      const res = resp.json();
      if(res) {
      this.userData = res;
      console.log('Role: ', res);
      } 
    });
  }

  getCancelReasons(){
    this.httpRequestService.getCancelReasons().subscribe((resp) => {
      const res = resp.json();
      console.log('Cancel Res: ', res);
      if(res) {
        res.reasons.forEach(element => {
          this.listCancelBookingReasons.push({
            value: element.cancellationReasonCode,
            text: element.cancellationReasonText
          });
        });
        console.log('Cancel Reasons: ', this.listCancelBookingReasons); 
      } 
    });
  }
  

  public save(p) {
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const file = this.file;
    const imgFile = this.imageURL;
    const data = this.customSettingsForm.value;
    if(imgFile){
      data.image = imgFile;
      data.imageFileName = file.name;
    this.httpRequestService.uploadFile(data).subscribe(resp => {
      const res = resp.json();
      this.s3url = res.Location;
      console.log('File Upload Res: ', this.s3url);
      const params = {
        id: this.recordId,
        subdomain: this.subDomain,
        button_type: data.button_type,
        primary_color: data.color_scheme.primary_color,
        secondary_color: data.color_scheme.secondary_color,
        logo_url: this.s3url,
        logo_width: data.logo_settings.width,
        logo_height: data.logo_settings.height
      }
      // set local stroage
      localStorage.setItem('primaryColor', data.color_scheme.primary_color);
      localStorage.setItem('secondaryColor', data.color_scheme.secondary_color);
      localStorage.setItem('buttonType', data.button_type);
      localStorage.setItem('logoUrl', this.s3url);
      localStorage.setItem('logoHeight', data.logo_settings.height);
      localStorage.setItem('logoWidth', data.logo_settings.width);

      if((data.color_scheme.adminSubdomain) && (p == 'admin')){
        params.subdomain = data.color_scheme.adminSubdomain;
        params.id = this.adminId;
      }
      this.httpRequestService.patchSettingsByDomain(params).subscribe(resp => {
        const res = resp.json();
        console.log('Data Res: ', res);
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
        this.snackBar.open('Applying changes!','page reloading...' ,{ duration: 3000, verticalPosition: 'top' });
        setTimeout(function(){ location.reload(); }, 3000);
      }, error => {
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
        this.snackBar.open('Error!', error, { duration: 3000, verticalPosition: 'top' });
      });

    }, error => {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.snackBar.open('Error!', error, { duration: 3000, verticalPosition: 'top' });
    }
    );
  } else {
    const params = {
      id: this.recordId,
      subdomain : this.subDomain,
      button_type: data.button_type,
      primary_color: data.color_scheme.primary_color,
      secondary_color: data.color_scheme.secondary_color,
      logo_width: data.logo_settings.width,
      logo_height: data.logo_settings.height
    }
    if((this.newSubDomain) && (p == 'new')) { 
      params.subdomain = this.newSubDomain
      params.id = null;
      console.log('new subdomain: ', this.newSubDomain);  
    }
    if((data.color_scheme.adminSubdomain) && (p == 'admin')){
      params.subdomain = data.color_scheme.adminSubdomain;
      params.id = this.adminId;
    }
    
    // set local storage
    localStorage.setItem('primaryColor', data.color_scheme.primary_color);
    localStorage.setItem('secondaryColor', data.color_scheme.secondary_color);
    localStorage.setItem('buttonType', data.button_type);
    localStorage.setItem('logoHeight', data.logo_settings.height);
    localStorage.setItem('logoWidth', data.logo_settings.width);

      this.httpRequestService.patchSettingsByDomain(params).subscribe(resp => {
      const res = resp.json();
      console.log('Data Res: ', res);
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.snackBar.open('Applying changes!','page reloading...' ,{ duration: 5000, verticalPosition: 'top' });
      setTimeout(function(){ location.reload(); }, 3000);
    }, error => {
      this.snackBar.open('Error!', error, { duration: 3000, verticalPosition: 'top' });
    })
  }
}

  public updateHeroUserSubdomain() {
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const data = this.heroUserSubdomainForm.value;
    const index = this.allHeroUsers.findIndex(({ email }) => email === data.email);
    this.httpRequestService.updateHeroUserSubdomain(this.allHeroUsers[index].id, data).subscribe(resp => {
      this.allHeroUsers[index].subdomain = data.subdomain;
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.snackBar.open('Success!','User subdomain updated.' ,{ duration: 5000, verticalPosition: 'top' });
    }, error => {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.snackBar.open('Error!', error, { duration: 3000, verticalPosition: 'top' });
    });
  }

  public onChangeColor(color: any, formControl: string, formGroup: string) {
    this.customSettingsForm.patchValue({ [formGroup]: { [formControl]: color } });
  }


  changePassword() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const params = {
      'email': this.email,
      'password': this.changePasswordForm.get('password').value
    };

    this.authenticationService.resetPasswordWithEmail(params).subscribe(resp => {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.message = SYSTEM_MESSAGE.msg_reset_success;
      this.changePasswordForm = this.formBuilder.group({
        'password': ['', [Validators.required, this.validationFormService.passwordValidator]],
        'confirmPassword': ['', [Validators.required, this.validationFormService.confirmPasswordValidator]],
      });
      try {
        this.changePasswordForm.control.clearValidators();
      } catch{ }


    }, error => {


    });
  }

  isLoading:any = true;
  isLoading1:any = true;

  getMyBooking() {
    let email =  this.email;
    this.httpRequestService.getMyBooking(email, this.offset, this.limit).subscribe(resp => {
      const res = resp.json();
      console.log('Current Bookings: ', res);

        this.lstMyBookings = res;

        for(let i = 0; i < this.lstMyBookings.length; i++){
          this.bookingOptionId[i] = 0
        }

        this.bookingCount = res.total;
        setTimeout(() => {
          this.getMyBookingsProductImage();
        }, 500)
      
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);

      this.isLoading = false;

    }, error => {
      this.lstMyBookings = [];
      this.bookingCount = 0;
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    })
  }


  onLoadMoreReviews() {
    this.offset += this.limit;
    this.getMyBooking();
  }

  getMyBookingsProductImage() {
    for (let item of this.lstMyBookings) {

      for (let data of item.data) {
        for (let booking of data.itemSummaries) {
          booking.thumbnailHiResURL = '';
          this.httpRequestService.getProductDetail(booking.productCode).subscribe(resp => {

            const res = resp.json();
            if (res) {
              if (res.thumbnailHiResURL && res.thumbnailHiResURL.length === 0) {
                booking.thumbnailHiResURL = res.userPhotos !== null ?
                (res.userPhotos[0].photoHiResURL.indexOf('https') == -1 ?
                UtilService.getInstance().toHttps(res.userPhotos[0].photoHiResURL) : res.userPhotos[0].photoHiResURL) : '';
              } else {

                booking.thumbnailHiResURL = (res.thumbnailHiResURL && res.thumbnailHiResURL.indexOf('https') == -1) ?
                UtilService.getInstance().toHttps(res.thumbnailHiResURL) : res.thumbnailHiResURL;
              }
            }
          });
        }
      }
    }

  }

  getBookingHistoriesProductImage() {
    for (let item of this.lstBookingHistories) {

      for (let data of item.data) {
        for (let booking of data.itemSummaries) {
          booking.thumbnailHiResURL = '';
          this.httpRequestService.getProductDetail(booking.productCode).subscribe(resp => {

            const res = resp.json();
            // //console.log(res);
            if (res) {
              if (res.thumbnailHiResURL && res.thumbnailHiResURL.length === 0) {
                //booking.thumbnailHiResURL = res.userPhotos !== null ? UtilService.getInstance().toHttps(res.userPhotos[0].photoHiResURL) : '';

                booking.thumbnailHiResURL = res.userPhotos !== null ?
                (res.userPhotos[0].photoHiResURL.indexOf('https') == -1 ?
                UtilService.getInstance().toHttps(res.userPhotos[0].photoHiResURL) : res.userPhotos[0].photoHiResURL) : '';


              } else {

                //booking.thumbnailHiResURL = UtilService.getInstance().toHttps(res.thumbnailHiResURL);

                booking.thumbnailHiResURL = (res.thumbnailHiResURL && res.thumbnailHiResURL.indexOf('https') == -1) ?
                UtilService.getInstance().toHttps(res.thumbnailHiResURL) : res.thumbnailHiResURL;

              }
            }
          });
        }
      }
    }

  }


  onLoadMoreHistory() {
    this.offsetHistory += this.limitHistory;
    this.getBookingHistories();
    this.getAllBookingSub();
  }

  getBookingHistories() {
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    let email = this.email;
    this.httpRequestService.getBookingHistory(email, this.offsetHistory, this.limitHistory).subscribe(resp => {
      const res = resp.json();

      console.log('Past Bookings: ', res);

      this.lstBookingHistories = res.result;

      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.isLoading1 = false;
    }, error => {
      this.lstBookingHistories = [];
      this.bookingHistoryCount = 0;
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    })
  }

  getAllBookingSubAdmin() {
    this.httpRequestService.getAllBookingAdmin(this.offset, this.limit).subscribe(resp => {
      const res = resp.json();
      console.log('All Booking: ', res);
      if(!(res.result && res.result.code )){

        this.allBookingsSubAdmin = res.results;

        for(let i = 0; i < this.allBookingsSubAdmin.length; i++){
          this.bookingOptionId[i] = 0
        }
      }


      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.isLoading = false;

    }, error => {
      this.allBookingsSubAdmin = [];
      //this.bookingHistoryCountSub = 0;
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    })
  }

  getAllPrevBookingSubAdmin() {
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.httpRequestService.getAllPrevBookingAdmin(this.prevoffset, this.prevlimit).subscribe(resp => {
      const res = resp.json();
      console.log('All Prev/Cancel Booking: ', res);
      if(!(res.result && res.result.code )){

        this.allPrevBookingsSubAdmin = this.allPrevBookingsSubAdmin.concat(res.results).filter(function(el) {
          return el.data !== null;
        });

        for(let i = 0; i < this.allPrevBookingsSubAdmin.length; i++){
          this.bookingOptionId[i] = 0
        }

        if(res.results.length > 0) {
          this.prevmore = true;
        }
      } else {
        this.prevmore = false;
      }

      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.isLoading = false;
      this.prevoffset += this.prevlimit;

    }, error => {
      this.allPrevBookingsSubAdmin = [];
      //this.bookingHistoryCountSub = 0;
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    })
  }

  getCancelBookingReasons() {
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.httpRequestService.getCancelBookingReasonsService().subscribe(resp => {
      const res = resp.json();

      if(!(res.result && res.result.code )){
        if(res){
        res.result.forEach(element => {
          this.listCancelBookingReasons.push({
            value: element.cancellationReasonCode,
            text: element.cancellationReasonText
          });
        });
      }
      }

      console.log('Cancel Reasons: ', this.listCancelBookingReasons);

      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.isLoading = false;

    }, error => {
      this.listCancelBookingReasons = [];
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    })
  }

  getAllBookingSub() {
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    let sub =  this.subDomain;
    this.httpRequestService.getAllBooking(sub, this.offset, this.limit).subscribe(resp => {
      const res = resp.json();
      if(!(res.result && res.result.code )){
        this.allBookingsSub = this.allBookingsSub.concat(res.results).filter(function(el) {
          return el.data !== null;
        });

        for(let i = 0; i < this.allBookingsSub.length; i++){
          this.bookingOptionId[i] = 0
        }
      }

      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.isLoading = false;

    }, error => {
      this.allBookingsSub = [];
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    })
  }

  getAllBookingSubPrev() {
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    let sub =  this.subDomain;
    this.httpRequestService.getAllBookingPrev(sub, this.offset, this.limit).subscribe(resp => {
      const res = resp.json();
      if(!(res.result && res.result.code )){
        this.allBookingsSubPrev = this.allBookingsSubPrev.concat(res.results).filter(function(el) {
          return el.data !== null;
        });

        for(let i = 0; i < this.allBookingsSubPrev.length; i++){
          this.bookingOptionId[i] = 0;
        }
      }

      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.isLoading = false;

    }, error => {
      this.allBookingsSubPrev = [];
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    })
  }

  domainChange(e) {
    console.log('Domain Change:', e.value);
    this.adminSub = e.value;
    this.httpRequestService.getSettingsByDomain(e.value).subscribe(resp => {
      const res = resp.json();
      this.adminId = res.id;
      this.buttonTypeOpt = res.button_type;
      this.primaryColor = res.primary_color;
      this.secondaryColor = res.secondary_color;
      this.customSettingsForm.patchValue({ color_scheme: { primary_color: res.primary_color } });
      this.customSettingsForm.patchValue({ color_scheme: { secondary_color: res.secondary_color } });
      this.customSettingsForm.patchValue({ logo_settings: { url: res.logo_url } });
      this.customSettingsForm.patchValue({ logo_settings: { width: res.logo_width } });
      this.customSettingsForm.patchValue({ logo_settings: { height: res.logo_height } });
    })
  };

  heroUserChange(e) {
    const user = this.allHeroUsers.find(({ email }) => email === e.value);
    this.heroUserSubdomainForm.patchValue({ subdomain: user.subdomain });
  }

  tabChange(e) {
    console.log('Event: ', e.tab.textLabel);
    const matActive =  Array.from(document.getElementsByClassName('mat-tab-label-active') as HTMLCollectionOf<HTMLElement>);
    const matLabel =  Array.from(document.getElementsByClassName('mat-tab-label') as HTMLCollectionOf<HTMLElement>);
    const matInk =  Array.from(document.getElementsByClassName('mat-ink-bar') as HTMLCollectionOf<HTMLElement>);


    for (let num = 0; num < matLabel.length; num++) {
      matLabel[num].style['background-color'] = "#ffffff";
      matLabel[num].style['border-bottom'] = "3px solid " + this.primaryColor;
    }
    matActive[0].style['background-color'] = this.primaryColor;
    matInk[0].style['background-color'] = this.primaryColor;

    console.log(this.secondaryColor);

    if (e.tab.textLabel == 'My Bookings') {
      if (this.lstMyBookings.length == 0) {
        this.getMyBooking();
      }
    }
    else if (e.tab.textLabel == 'Past Bookings') {
      if (this.lstBookingHistories.length == 0) {
        this.getBookingHistories();

      }
    }
    else if (e.tab.textLabel == 'Admin') {
      this.getAllBookingSubAdmin();
      this.getAllPrevBookingSubAdmin();
      this.getAllHeroUsers();
    }
    else if (e.tab.textLabel == 'Account Status') {
      this.allBookingsSub = [];
      this.allBookingsSubPrev = [];
      this.getAllBookingSub();
      this.getAllBookingSubPrev();
    }
    else if (e.tab.textLabel == 'Reports') {
      this.getReportUsers();
    }
    else if (e.index == 4) {
      //this.addSubDomain = this.customSettingsForm.value
        // this.getInitSettings();

    }
  }

  // async cancelThisBooking(item, reasonCode) {
  //   if(!reasonCode){
  //     this.openModalService.showModalCommon({
  //       message: SYSTEM_MESSAGE.msg_choose_reason
  //     });
  //     return;
  //   }

  //   let confirm = await this.openModalService.showModalConfirm({
  //     title: '',
  //     message: SYSTEM_MESSAGE.msg_cancel_this_booking
  //   });

  //   if (confirm) {
  //     let data = item.data[0];

  //     const params = {
  //       "itineraryId": data.itineraryId,
  //       "distributorRef": data.distributorRef,
  //       "cancelItems": [
  //         {
  //           "itemId": data.itemSummaries[0].itemId,
  //           "distributorItemRef": data.itemSummaries[0].distributorItemRef,
  //           "cancelCode": id,
  //           "cancelDescription": this.listReasonOption.filter(x=> x.id == id)[0].name
  //         }
  //       ]
  //     }

  //     this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
  //     this.httpRequestService.cancelThisBooking(params).subscribe(resp=> {


  //       const res = resp.json();
  //       this.openModalService.showModalCommon({
  //         title: SYSTEM_MESSAGE.msg_booking_cancelled
  //       });
  //       this.lstMyBookings = [];
  //       this.offset = 0;
  //       this.limit = 10;

  //       this.getMyBooking();
  //       this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
  //     }, error => {
  //       this.openModalService.showModalCommon({
  //         title: SYSTEM_MESSAGE.msg_try_again
  //       });
  //       this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
  //     });

  //   }
  // }

async cancelThisBooking(item, reasonCode) {
  console.log('Cancel Item: ', item);
  console.log('Cancel Reason: ', reasonCode);
      if(reasonCode == ''){
      reasonCode = this.listReasonOption[3];
      console.log('new reason code: ', reasonCode);
      // alert('no reason!');
      // this.openModalService.showModalCommon({
      //   message: SYSTEM_MESSAGE.msg_choose_reason
      // });
      // return;
    }
    let confirm = await this.openModalService.showModalConfirm({
      title: '',
      message: SYSTEM_MESSAGE.msg_cancel_this_booking
    });

    if (confirm) {
      let data = item.data[0];

      const params = {
        "itineraryId": data.itineraryId,
        "distributorRef": data.distributorRef,
        "cancelItems": [
          {
            "itemId": data.itemSummaries[0].itemId,
            "distributorItemRef": data.itemSummaries[0].distributorItemRef,
            "cancelCode": reasonCode[0],
            "cancelDescription": this.listReasonOption.filter(x=> x.reasonCode == reasonCode)[0].name
          }
        ]
      }
      console.log(params);
  
      // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
        this.httpRequestService.cancelThisBooking(params).subscribe(resp=> {
        const res = resp.json();
        this.openModalService.showModalCommon({
          title: SYSTEM_MESSAGE.msg_booking_cancelled
        });
        this.lstMyBookings = [];
        this.offset = 0;
        this.limit = 10;

        this.getMyBooking();
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      }, error => {
        this.openModalService.showModalCommon({
          title: SYSTEM_MESSAGE.msg_try_again
        });
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      });

    }
  }

  async cancelBookingAdmin(item) {

    // check cancel status
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.httpRequestService.checkStatusAdmin(item.itineraryId).subscribe(resp=> {
    const statusCheck = resp.json();

    console.log('Cancel Item: ', item);
    
    if (statusCheck.status === 'CANCELLABLE') {
      let confirmStatus = this.openModalService.showModalConfirm({
        title: 'Proceed to cancel?',
        message: `Refund status and amount: <br/><br/>
          Booking reference: ${statusCheck.bookingId}<br />
          Refund amount: ${statusCheck.refundDetails.currencyCode} ${item.chargedPrice.toFixed(2)}<br />
          Status: ${statusCheck.status}
        `
      });
      
      
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);

      confirmStatus.then((confirmCancel) => {
        console.log('Resolved Value:', confirmCancel); // This will log the true/false value
        if(confirmCancel === true){
          this.openModalService.showModalOptions({
            title: '',
            message: SYSTEM_MESSAGE.msg_cancel_this_booking,
            options: this.listCancelBookingReasons
          }).then(cancelReason =>{ 
            console.log('Cancel Reason: ', cancelReason);

            if (cancelReason) {
              let data = item;
        
              const params = {
                "bookingReference": data.itineraryId,
                "reasonCode": cancelReason,
              }
            
              console.log('Cancel Params: ', params);
                this.httpRequestService.cancelThisBooking(params).subscribe(resp=> {
                const res = resp.json();
                console.log('Cancel Status: ', res);
                if(res.status === 'ACCEPTED') { 
                  this.openModalService.showModalCommon({
                    title: 'Your booking has been cancelled.',
                    message: `Refund status and amount: <br/><br/>
                    Booking reference: ${res.bookingId}<br />
                    Refund amount: ${statusCheck.refundDetails.currencyCode} ${item.chargedPrice.toFixed(2)}<br />
                    Status: ${res.status}<br/><br/>
                    Your refund will be processed within 5 to 10 business days. Should you have any further questions or concerns, please feel free to reach out to us at hello@heroexplorer.com.
                  `
                  });


                // query the Product from DB and add cancel status

                  this.httpRequestService.cancelBookingDB(res.bookingId).subscribe(resp=> {
                    const res = resp.json();
                    console.log('Cancel Change: ', res);
                  })
                }
                this.getAllBookingSubAdmin();
                console.log(res);
                this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
              }, error => {
                this.openModalService.showModalCommon({
                  title: '',
                  message: error
                });
                this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
              });
            }
          })
        }
      });
    }
    });




    // if (cancelReason) {
    //   let data = item;

    //   const params = {
    //     "bookingReference": data.itineraryId,
    //     "reasonCode": cancelReason,
    //   }

    //   console.log('Cancel Params: ', params);
  
    //   this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    //     this.httpRequestService.cancelThisBooking(params).subscribe(resp=> {
    //     const res = resp.json();
    //     console.log('Cancel Status: ', res);
    //     this.openModalService.showModalCommon({
    //       title: SYSTEM_MESSAGE.msg_booking_cancelled,
    //       message: res.reason
    //     });

    //     // query the Product from DB and add cancel status
    //     if(res.status === 'ACCEPTED') { 
    //       this.httpRequestService.cancelBookingDB(res.bookingId).subscribe(resp=> {
    //         const res = resp.json();
    //         console.log('Cancel Change: ', res);
    //       })
    //     }

    //     this.getAllBookingSubAdmin();
    //     console.log(res);
    //     this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    //   }, error => {
    //     this.openModalService.showModalCommon({
    //       title: '',
    //       message: error
    //     });
    //     this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    //   });

    // }
  }

  async checkStatusAdmin(item) {
    console.log('Status Item: ', item);
      let data = item;
      const params = {
        "bookingReference": data.itineraryId,
      }
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
        this.httpRequestService.cancelThisBooking(params).subscribe(resp=> {
        const res = resp.json();
        console.log('Cancel Status: ', res);
        this.openModalService.showModalCommon({
          title: SYSTEM_MESSAGE.msg_booking_cancelled,
          message: res.reason
        });

        // query the Product from DB and add cancel status
        if(res.status === 'ACCEPTED') { 
          this.httpRequestService.cancelBookingDB(res.bookingId).subscribe(resp=> {
            const res = resp.json();
            console.log('Cancel Change: ', res);
          })
        }

        this.getAllBookingSubAdmin();
        console.log(res);
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      }, error => {
        this.openModalService.showModalCommon({
          title: '',
          message: error
        });
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      });

    
  }

 async showModalAddmoreTraveler(travellerAgeBands) {

    let confirm = await this.openModalService.showModalAddmoreTraveler(travellerAgeBands);

  }
  async showModalEditTraveler() {
    let confirm = await this.openModalService.showModalEditTraveler({data: ''});

  }

  async bookingOptionChange(event, i, itineraryId, item){

    if(this.bookingOptionId[i] == null) return;

    let title:string = "";
    let isCheck = false;

    // if(this.bookingOptionId[i] == 5){
    //   title = this.listBookingOption.filter(o => o.id == 5)[0].name;
    //   if(item.isRequestCancel == 1){
    //     isCheck = true;
    //   }
    // }
    if(this.bookingOptionId[i] == 4){
      title = this.listBookingOption.filter(o => o.id == 4)[0].name;
      if(item.isRequestChangeDate == 1){
        isCheck = true;
      }
    }
    else  if(this.bookingOptionId[i] == 3){
      title = this.listBookingOption.filter(o => o.id == 3)[0].name;
      if(item.isRequestChangeTour == 1){
        isCheck = true;
      }
    }
    else  if(this.bookingOptionId[i] == 2){
      title = this.listBookingOption.filter(o => o.id == 2)[0].name;
      if(item.isRequestEditTraveller == 1){
        isCheck = true;
      }
    }
    else  if(this.bookingOptionId[i] == 1){
      title = this.listBookingOption.filter(o => o.id == 1)[0].name;
      if(item.isRequestChangeName == 1){
        isCheck = true;
      }
    }

    if(isCheck == true ) {

      this.openModalService.showModalCommon({
        title: "You have already sent us this request. Please bear with us, we will reply you soon."
      })
      this.bookingOptionId[i] = null;
      return;
    }

    if(this.bookingOptionId[i] != 5) {
    let res = await this.openModalService.showModalManagerBooking({
      title: title,
      option: "Please share us your request detail!",
      itineraryId: itineraryId
    });
  
    console.log('Request Booking: ', res);

    if (res.confirm == true) {
      this.openModalService.showModalCommon({
        title: "Your request has been sent successfully."
      });
      try{
        var booking = this.lstMyBookings.filter(o => o.data.length > 0 && o.data[0].itineraryId == itineraryId)[0];
        booking.isRequestCancel = res.data.isRequestCancel;
        booking.isRequestEditTraveller = res.data.isRequestEditTraveller
        booking.isRequestChangeTour = res.data.isRequestChangeTour
        booking.isRequestChangeDate = res.data.isRequestChangeDate
        booking.isRequestChangeName = res.data.isRequestChangeName
        //console.log(booking)
        this.bookingOptionId[i] = null;
      }
      catch{
        this.getMyBooking();
      }


    }
    else{
      this.bookingOptionId[i] = null;
    }
  }
  }

  public upload() {
    const file = this.file;
    // const data = this.customSettingsForm.value;
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    // this.generalDetailServ.upload(file.nativeFile, data.subdomain).then((uploadURL) => {
    //   this.imagePreview = '';
    //   this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    //   this.snackBar.open('Save the data to reflect changes.', 'Upload Success', { duration: 3000, verticalPosition: 'top' });
    //   this.customSettingsForm.controls.logo_settings.patchValue({ url: uploadURL });
    // });
  }

  private previewImagem(file: any) {
    const fileReader = new FileReader();
    return new Promise((resolve) => {
      fileReader.readAsDataURL(file.nativeFile);
      fileReader.onload = async (e: any) => {
        resolve(e.target.result);
        this.imageURL = e.target.result;
      };
    });
  }

  public onUploadOutput(output: UploadOutput): void {
    this.uploadInput.emit({ type: 'removeAll' });
    switch (output.type) {
      case 'addedToQueue':
        if (output.file) {
          this.file = output.file;
          this.previewImagem(output.file).then((response) => {
            if (this.file.type.includes('image')) {
              this.imagePreview = response;
            }
          });
        }
        break;
      case 'dragOver':
        this.dragOver = true;
        break;
      case 'drop':
        this.dragOver = false;
        break;
      case 'done':
        break;
    }
  }

  addSubDomain() {
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const data = this.adminSettingsForm.value
    this.newSubDomain = data.add_subdomain;
    console.log('new sub: ', this.newSubDomain);

    this.httpRequestService.addDomainAws(data.add_subdomain).subscribe(resp=>{
      const res = resp.json()
      if(res.ChangeInfo){
        this.snackBar.open('Success!','subdomain added' ,{ duration: 3000, verticalPosition: 'top' });
        this.save('new');
        this.getAllSubdomain();
      } else {
        this.snackBar.open('Error', res.message ,{ duration: 3000, verticalPosition: 'bottom' });
      }
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    });
  }

  getAllSubdomain() {
    this.httpRequestService.getAllSubdomain().subscribe(resp => {
      const res = resp.json();
      res.sort((a, b) => a.subdomain.localeCompare(b.subdomain));
      this.allList = res;
      this.currentId = res.id;
    })
  }

  getAllHeroUsers() {
    this.httpRequestService.getAllHeroUsers().subscribe(resp => {
      const res = resp.json();
      res.sort((a, b) => a.email.localeCompare(b.email));
      this.allHeroUsers = res;
    })
  }

  chooseDates(event: MatDatepickerInputEvent<any>) {
    this.errorSelectDates = this.endDate < this.startDate;
  }

  searchReportBookings(newSearch = false) {
    if (this.errorSelectDates || !this.endDate || !this.startDate) {
      this.snackBar.open('Error', 'Please select correct dates.' ,{ duration: 3000, verticalPosition: 'bottom' });
    } else {
      if (newSearch) {
        this.reportBookings = [];
        this.reportBookingsOffset = 0;
        this.reportBookingsLimit = 10;
        this.reportBookingsPrevmore = true;
      }

      // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);

      const startDate = this.startDate.format('YYYY-MM-DD');
      const endDate = this.endDate.format('YYYY-MM-DD');

      this.httpRequestService.getReportBookings(startDate, endDate, this.reportBookingsOffset, this.reportBookingsLimit).subscribe(resp => {
        const res = resp.json();

        if(!(res.result && res.result.code)){
          this.reportBookings = this.reportBookings.concat(res.results).filter(function(el) {
            return el.data !== null;
          });

          if(res.results.length > 0) {
            this.reportBookingsPrevmore = true;
          }
        } else {
          this.reportBookingsPrevmore = false;
        }

        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
        this.reportBookingsOffset += this.reportBookingsLimit;
      }, error => {
        this.reportBookings = [];
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      });
    }
  }

  downloadReportBookings() {
    if (this.errorSelectDates || !this.endDate || !this.startDate) {
      this.snackBar.open('Error', 'Please select correct dates.' ,{ duration: 3000, verticalPosition: 'bottom' });
    } else {
      // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);

      const startDate = this.startDate.format('YYYY-MM-DD');
      const endDate = this.endDate.format('YYYY-MM-DD');

      this.httpRequestService.downloadReportBookings(startDate, endDate).subscribe(resp => {
        const res = resp.json();

        if(!(res.result && res.result.code)){
          const items = res.results.filter(function(el) {
            return el.data !== null;
          });

          var itemsFormatted = [];
          items.forEach((data) => {
              itemsFormatted.push({
                // 'name': data.data[0].itemSummaries[0].leadTravellerFirstname + ' ' + data.data[0].itemSummaries[0].leadTravellerSurname,
                // 'email': data.data[0].bookerEmail,
                'productCode': data.data[0].itemSummaries[0].productCode,
                'travelDate': data.data[0].itemSummaries[0].travelDate,
                'orderDate': data.data[0].bookingDate,
                'bookingReference': 'BR-' + data.data[0].itemSummaries[0].itemId,
                'totalPricePaid': data.data[0].totalPriceFormatted,
                'bookingSource': data.bookingSource,
                // 'voucher': data.data[0].itemSummaries[0].voucherURL
              });
          });

          const fileTitle = startDate + '_' + endDate + '_Bookings';

          this.exportCSVFile(this.downloadReportBookingsHeaders, itemsFormatted, fileTitle);
        }

        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      }, error => {
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      });
    }
  }

  getReportUsers() {
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.httpRequestService.getReportUsers(this.reportUsersOffset, this.reportUsersLimit).subscribe(resp => {
      const res = resp.json();

      if (res.length) {
        this.reportUsers = this.reportUsers.concat(res);
      } else {
        this.reportUsersPrevmore = false;
      }

      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.reportUsersOffset += this.reportUsersLimit;
    });
  }

  downloadReportUsers() {
    // this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.httpRequestService.getAllHeroUsers().subscribe(resp => {
      const res = resp.json();

      var itemsFormatted = [];
      res.forEach((data) => {
          itemsFormatted.push({
            'id': data.id,
            'username': data.username,
            'firstname': data.firstname,
            'lastname': data.lastname,
            'email': data.email,
            'mobile': data.mobile,
            'city': data.city,
            'country': data.country,
            'province': data.province,
            'postcode': data.postcode,
            'billingadress': data.billingadress,
            'subdomain': data.subdomain
          });
      });

      const fileTitle = (new Date()).toISOString().split('T')[0] + '_Users';

      this.exportCSVFile(this.downloadReportUsersHeaders, itemsFormatted, fileTitle);

      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    });
  }

  convertToCSV(objArray) {
      var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
      var str = '';

      for (var i = 0; i < array.length; i++) {
          var line = '';
          for (var index in array[i]) {
              if (line != '') line += ','

              line += array[i][index];
          }

          str += line + '\r\n';
      }

      return str;
  }

  exportCSVFile(headers, items, fileTitle) {
      if (headers) {
          items.unshift(headers);
      }

      // Convert Object to JSON
      var jsonObject = JSON.stringify(items);

      var csv = this.convertToCSV(jsonObject);

      var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", exportedFilenmae);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  }
}