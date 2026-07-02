import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ModalCommonComponent } from '../../components/modal/modal-common/modal-common.component';
import { ModalViewPriceCalendarComponent } from '../../components/modal/modal-view-price-calendar/modal-view-price-calendar.component';
import { ModalConfirmComponent } from '../../components/modal/modal-confirm/modal-confirm.component';
import { ModalOptionsComponent } from '../../components/modal/modal-options/modal-options.component';
import { ModalForgotPasswordComponent } from '../../components/modal/modal-forgot-password/modal-forgot-password.component';
import { ModalEditTravellerComponent } from '../../components/modal/modal-edit-traveler-info/modal-edit-traveler-info.component';
import { ModalAddmoreTravellerComponent } from '../../components/modal/modal-add-more-travellers/modal-addmore-traveller.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ModalManagerBookingComponent } from '../../components/modal/modal-manager-booking/modal-manager-booking.component';
@Injectable()
export class OpenModalService {
  constructor(public dialog: MatDialog, private deviceService: DeviceDetectorService) {}
  public showModalCommon(data: any) {
    const dialogRef = this.dialog.open(ModalCommonComponent, {
      width: '500px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed');
    });
  }

  public showModalViewPriceCalendar(data) {
    if (this.deviceService.isMobile()) {
      const dialogRef = this.dialog.open(ModalViewPriceCalendarComponent, {
        width: '800px',
        data: data,
        panelClass: 'dialog-fullscreen'
      });
      return dialogRef.afterClosed().toPromise();
    } else {
      const dialogRef = this.dialog.open(ModalViewPriceCalendarComponent, {
        width: '800px',
        data: data
      });
      return dialogRef.afterClosed().toPromise();
    }
  }

  public confirmYes: any = false;

  public showModalConfirm(data) {
    const dialogRef = this.dialog.open(ModalConfirmComponent, {
      width: '500px',
      data: data
    });
    return dialogRef.afterClosed().toPromise();
  }

  public showModalOptions(data) {
    const dialogRef = this.dialog.open(ModalOptionsComponent, {
      width: '500px',
      data: data
    });
    return dialogRef.afterClosed().toPromise();
  }

  public showModalForgorPassword(data) {
    const dialogRef = this.dialog.open(ModalForgotPasswordComponent, {
      width: '500px',
      data: data
    });
    return dialogRef.afterClosed().toPromise();
  }

  public showModalEditTraveler(data) {
    const dialogRef = this.dialog.open(ModalEditTravellerComponent, {
      width: '500px',
      data: data
    });
    return dialogRef.afterClosed().toPromise();
  }

  public showModalAddmoreTraveler(data) {
    const dialogRef = this.dialog.open(ModalAddmoreTravellerComponent, {
      width: '700px',
      data: data
    });
    return dialogRef.afterClosed().toPromise();
  }
  public showModalManagerBooking(data) {
    const dialogRef = this.dialog.open(ModalManagerBookingComponent, {
      width: '500px',
      data: data
    });
    return dialogRef.afterClosed().toPromise();
  }
}
