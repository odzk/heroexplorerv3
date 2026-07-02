import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidationFormService } from '../../../services/validation-form/validation-form.service';
import { MESSAGE_EVENT } from '../../../../../constants';
import { EventMessage } from '../../../services/event-message/event-message.service';
import { HttpRequestService } from '../../../services/http/http-request.service';

@Component({
  selector: 'app-modal-manager-booking',
  templateUrl: './modal-manager-booking.component.html',
  styleUrls: ['./modal-manager-booking.component.scss']
})
export class ModalManagerBookingComponent implements OnInit {
  title: any;
  option: any;
  id: any;
  itineraryId: any;
  form:any;
  constructor(public dialogRef: MatDialogRef<ModalManagerBookingComponent>, private formBuilder: FormBuilder, private eventMsg: EventMessage, private http: HttpRequestService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.option = data.option;
    this.itineraryId = data.itineraryId;
    this.id = data.id;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      'reason': ['', [Validators.required]]
    });

  }
  
  request(){
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    this.http.requestEditBooking(this.id, this.itineraryId, this.title, this.form.get('reason').value).subscribe(resp => {
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
        let res = {
          confirm: true,
          data: resp.json()
        }
        this.dialogRef.close(res);
    })
  }

}
