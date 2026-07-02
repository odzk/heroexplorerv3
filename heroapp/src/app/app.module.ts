import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';

import { SharedModule } from './shared/modules/shared.module';

import { AppComponent } from './app.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { EmailSubscribeForm } from './shared/components/email-subscribe-form/email-subscribe-form.component';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';
import { ModalCommonComponent } from './shared/components/modal/modal-common/modal-common.component';
import { ModalViewPriceCalendarComponent } from './shared/components/modal/modal-view-price-calendar/modal-view-price-calendar.component';
import { ModalViewPriceDetailComponent } from './shared/components/modal/modal-view-price-detail/modal-view-price-detail.component';
import { ModalConfirmComponent } from './shared/components/modal/modal-confirm/modal-confirm.component';
import { ModalOptionsComponent } from './shared/components/modal/modal-options/modal-options.component';
import { ModalForgotPasswordComponent } from './shared/components/modal/modal-forgot-password/modal-forgot-password.component';

import { ModalAddmoreTravellerComponent } from './shared/components/modal/modal-add-more-travellers/modal-addmore-traveller.component';

import { ModalEditTravellerComponent } from './shared/components/modal/modal-edit-traveler-info/modal-edit-traveler-info.component';
import { ModalManagerBookingComponent } from './shared/components/modal/modal-manager-booking/modal-manager-booking.component';

import { DatePickerHeader } from './shared/services/datepicker/datepicker-header.service';
import { CalendarHeaderComponent } from './shared/components/calendar-header/calendar-header.component';

import { AuthGuard } from './shared/_guards/auth.guard';
import { VoucherComponent } from './voucher/voucher.component';

import { MatTableModule } from "@angular/material/table";
import { CdkTableModule } from '@angular/cdk/table';


// AngularFire
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    EmailSubscribeForm,
    NavBarComponent,
    ModalCommonComponent,
    ModalViewPriceCalendarComponent,
    ModalViewPriceDetailComponent,
    ModalConfirmComponent,
    ModalOptionsComponent,
    ModalForgotPasswordComponent,
    ModalEditTravellerComponent,
    ModalAddmoreTravellerComponent,
    ModalManagerBookingComponent,
    VoucherComponent,
    CalendarHeaderComponent
  ],
  imports: [
    CdkTableModule,
    MatTableModule,
    SharedModule,
    AppRoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  entryComponents: [
    ModalCommonComponent,
    ModalViewPriceCalendarComponent,
    ModalViewPriceDetailComponent,
    ModalConfirmComponent,
    ModalOptionsComponent,
    ModalForgotPasswordComponent,
    ModalEditTravellerComponent,
    ModalAddmoreTravellerComponent,
    ModalManagerBookingComponent,
    CalendarHeaderComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  providers: [AuthGuard, DatePickerHeader],
  bootstrap: [AppComponent]
})
export class AppModule {}
