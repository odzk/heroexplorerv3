import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidationFormService } from '../../../services/validation-form/validation-form.service';

@Component({
  selector: 'app-modal-edit-traveller',
  templateUrl: './modal-edit-traveler-info.component.html',
  styleUrls: ['./modal-edit-traveler-info.component.scss']
})
export class ModalEditTravellerComponent implements OnInit {
  form: any;
  constructor(public dialogRef: MatDialogRef<ModalEditTravellerComponent>,private formBuilder: FormBuilder,private validationFormService: ValidationFormService,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  listTitle: Array<any> = [
    { value: 'Mr' },
    { value: 'Mrs' },
    { value: 'Miss' }
  ];
  ngOnInit() {
    this.form = this.formBuilder.group({
      'title': ['', [Validators.required]],
      'firstName': ['', [Validators.required]],
      'lastName': ['', [Validators.required]]
    });
  }
  close(){
    this.dialogRef.close(this.form.get("email").value);
  }

}
