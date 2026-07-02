import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidationFormService } from '../../../services/validation-form/validation-form.service';

@Component({
  selector: 'app-modal-forgot-password',
  templateUrl: './modal-forgot-password.component.html',
  styleUrls: ['./modal-forgot-password.component.scss']
})
export class ModalForgotPasswordComponent implements OnInit {
form: any;
  constructor(public dialogRef: MatDialogRef<ModalForgotPasswordComponent>,private formBuilder: FormBuilder,private validationFormService: ValidationFormService,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      'email': ['', [Validators.required, this.validationFormService.emailValidator]]
    });
  }
  close(){
    this.dialogRef.close(this.form.get("email").value);
  }
}
