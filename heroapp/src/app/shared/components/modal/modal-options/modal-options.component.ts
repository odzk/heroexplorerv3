import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidationFormService } from '../../../services/validation-form/validation-form.service';

@Component({
  selector: 'app-modal-options',
  templateUrl: './modal-options.component.html',
  styleUrls: ['./modal-options.component.scss']
})
export class ModalOptionsComponent implements OnInit {
  form: any;

  constructor(public dialogRef: MatDialogRef<ModalOptionsComponent>,
              private formBuilder: FormBuilder,
              private validationFormService: ValidationFormService,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      'selectedOption': [null, [Validators.required]]
    });
  }

  close(){
    this.dialogRef.close(this.form.get("selectedOption").value);
  }

}
