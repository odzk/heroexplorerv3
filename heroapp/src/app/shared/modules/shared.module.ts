import { ModuleWithProviders, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2CarouselamosModule } from 'ng2-carouselamos';
import { NouisliderModule } from 'ng2-nouislider';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxCarouselModule } from 'ngx-carousel';
import { RatingModule } from 'ngx-rating';
import { SlideshowModule } from 'ng-simple-slideshow';
import { LoadingModule } from 'ngx-loading';
import { LazyImagesModule } from 'ngx-lazy-images';
import { PerfectScrollbarModule, PerfectScrollbarConfigInterface, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { NgxGalleryModule } from 'ngx-gallery';

import { MaterialModule } from './material.module';

import { ToHttps } from '../filters/to-https.filter';
import { SafePipe } from '../filters/safe.filter';
import { HighlightKeyword } from '../filters/highlight-keyword.filter';

import { GMapsService } from '../services/google/google.service';
import { HttpService } from '../services/http/http-service.service';
import { HttpRequestService } from '../services/http/http-request.service';
import { I18nService } from '../services/translation/i18n-service.service';
import { EventMessage } from '../services/event-message/event-message.service';
import { Broadcaster } from '../services/event-message/broadcaster.service';
import { OpenModalService } from '../services/open-modal/open-modal.service';
import { ValidationFormService } from '../services/validation-form/validation-form.service';
import { WindowService } from '../services/window/window.service';
import { AuthenticationService } from '../services/authentication.service';

import { ClickElsewhereDirective } from '../directives/click-elsewhere';

import { HeaderComponent } from '../components/header/header.component';
import { HomeComponent } from '../../home/home.component';
import { ProductDetailComponent } from '../../product-detail/product-detail.component';
import { SelectOptionsComponent } from '../../select-options/select-options.component';
import { ListResultComponent } from '../../list-result/list-result.component';
import { OrderComponent } from '../../order/order.component';
import { VerifyComponent } from '../../verify/verify.component';
import { LoginComponent } from '../../login/login.component';
import { MyProfileComponent } from '../../my-profile/my-profile.component';
import { RegisterComponent } from '../../register/register.component';
import { ResetComponent } from '../../reset/reset.component';

import { ProductItemComponent } from '../components/product-item/product-item.component';
import { SearchBarComponent } from '../components/search-bar/search-bar.component';
import { ControlMessageComponent } from '../components/control-message/control-message.component';
import { ToastrModule } from 'ngx-toastr';
import { NgxUploaderModule } from 'ngx-uploader';

import { ColorPickerModule } from 'ngx-color-picker';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import 'hammerjs';
import { ErrorInterceptor } from '../_helpers/error.interceptor';

import { MatTableModule } from "@angular/material/table";
import {MatAccordion} from '@angular/material/expansion';

/* Custom Hammer configuration */
import { GestureConfig, MatSelectModule } from '@angular/material';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';

export class CustomHammerConfig extends HammerGestureConfig {
  overrides = {
    pan: {
      direction: Hammer.DIRECTION_ALL
    }
  };
}
/* End Custom hammer configuration */
// Old GoogleMap apiKey: 'AIzaSyCknSrYr7gD6rLac1tF3BXopEwWrp-jwME'
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [
    SafePipe,
    ToHttps,
    HighlightKeyword,
    ClickElsewhereDirective,
    HeaderComponent,
    HomeComponent,
    ProductDetailComponent,
    SelectOptionsComponent,
    ListResultComponent,
    OrderComponent,
    LoginComponent,
    MyProfileComponent,
    RegisterComponent,
    VerifyComponent,
    ProductItemComponent,
    SearchBarComponent,
    ControlMessageComponent,
    ResetComponent
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCknSrYr7gD6rLac1tF3BXopEwWrp-jwME'
    }),
    MatSelectModule,
    MatTableModule,
    NgxGalleryModule,
    FlexLayoutModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    RouterModule,
    HttpModule,
    ColorPickerModule,
    DeviceDetectorModule.forRoot(),
    TranslateModule.forRoot(),
    NgSelectModule,
    Ng2CarouselamosModule,
    NouisliderModule,
    NgxPaginationModule,
    NgxCarouselModule,
    NgxUploaderModule,
    RatingModule,
    SlideshowModule,
    LoadingModule.forRoot({
      backdropBackgroundColour: 'rgba(255,255,255,0.5)',
      primaryColour: '#CC5757',
      secondaryColour: '#CC5757',
      tertiaryColour: '#CC5757',
      fullScreenBackdrop: true
    }),
    LazyImagesModule,
    PerfectScrollbarModule,
    ScrollToModule.forRoot(),

    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-left',
      preventDuplicates: true
    }),
    HttpClientModule,
    MaterialModule
  ],
  exports: [
    HeaderComponent,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,

    ClickElsewhereDirective,

    ProductItemComponent,
    SearchBarComponent,
    ControlMessageComponent,

    NgxPaginationModule,
    AgmCoreModule,
    NgxCarouselModule,
    NgxUploaderModule,
    NgSelectModule,
    Ng2CarouselamosModule,
    NouisliderModule,
    TranslateModule,
    RatingModule,
    SlideshowModule,
    LoadingModule,
    LazyImagesModule,
    PerfectScrollbarModule,
    ScrollToModule,
    MaterialModule
  ],
  providers: [
    GMapsService,
    HttpService,
    HttpRequestService,
    I18nService,
    EventMessage,
    Broadcaster,
    OpenModalService,
    ValidationFormService,
    WindowService,

    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: CustomHammerConfig
    },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: GestureConfig
    },
    AuthenticationService
    // { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule
    };
  }
}
