import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidationFormService } from '../../../services/validation-form/validation-form.service';
import { MESSAGE_EVENT } from '../../../../../constants';
import { EventMessage } from '../../../services/event-message/event-message.service';

@Component({
  selector: 'app-modal-addmore-traveller',
  templateUrl: './modal-addmore-traveller.component.html',
  styleUrls: ['./modal-addmore-traveller.component.scss']
})
export class ModalAddmoreTravellerComponent implements OnInit {
  form: any;
  lst: Array<any> = [];
  formConfig: any = {};
  listTitle: Array<any> = [
    { value: 'Mr' },
    { value: 'Mrs' },
    { value: 'Miss' }
  ];
  constructor(public dialogRef: MatDialogRef<ModalAddmoreTravellerComponent>, private formBuilder: FormBuilder, private eventMsg: EventMessage,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {


    this.data.forEach((ageBand, index) => {
      if (ageBand.count > 0) {
        ageBand['travellers'] = [];
        for (let x = 0; x < ageBand.count; x++) {
          const randomNumber = Math.floor(Math.random() * Math.floor(9999));
          this.formConfig['person_' + randomNumber + '_firstname'] = ['', [Validators.required]];
          this.formConfig['person_' + randomNumber + '_surname'] = ['', [Validators.required]];
          ageBand.travellers.push({
            description: ageBand.description,
            randomNumber: randomNumber
          });
        }
      }
    });

    this.lst = this.data;
    //console.log(this.lst)
    this.form = this.formBuilder.group(this.formConfig);


  }
close(){
  
}
  ngOnInit() {


  }
  addMore() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    setTimeout(() => {
      const randomNumber = Math.floor(Math.random() * Math.floor(9999));
      this.formConfig['person_' + randomNumber + '_firstname'] = ['', [Validators.required]];
      this.formConfig['person_' + randomNumber + '_surname'] = ['', [Validators.required]];

      this.lst[0].travellers.push({
        description: this.lst[0].travellers.length > 0 ? this.lst[0].travellers[this.lst[0].travellers.length - 1].description : '',
        randomNumber: randomNumber
      });
      this.form = this.formBuilder.group(this.formConfig);
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    }, 1000);
  }

  remove(id) {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    setTimeout(() => {
      const foundItem = this.lst[0].travellers.filter(i => i.randomNumber === id)[0]; this.lst[0].travellers.splice(this.lst[0].travellers.indexOf(foundItem), 1);
      //console.log(this.formConfig)
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    }, 1000);
  }
}
