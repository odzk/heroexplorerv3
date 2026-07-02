import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, NgForm } from '@angular/forms';
import { ValidationFormService } from '../shared/services/validation-form/validation-form.service';
import { HttpRequestService } from '../shared/services/http/http-request.service';
import { EventMessage } from '../shared/services/event-message/event-message.service';
import { MESSAGE_EVENT, SYSTEM_MESSAGE } from '../../constants';
import { AuthenticationService } from '../shared/services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @ViewChild('registerFormEle') registerFormEle: NgForm;
  registerForm: any;
  isRegisterSuccessfully = false;
  isShowEmailExist = false;
  message: any;
  pages = [
    '/assets/images/home-header-bg-1.jpeg',
    '/assets/images/home-header-bg-2.jpeg',
    '/assets/images/home-header-bg-3.jpg'
  ]; 
  constructor(private formBuilder: FormBuilder,
    private eventMsg: EventMessage,
    private httpRequestService: HttpRequestService,
    private validationFormService: ValidationFormService,
    private authenticationService: AuthenticationService,
    private router: Router) {
    if (this.authenticationService.isAuthenticated) {
      this.router.navigate(['']);
    }
  }

  ngOnInit() {
    // init register form
    this.registerForm = this.formBuilder.group({
      'password': ['', [Validators.required, this.validationFormService.passwordValidator]],
      'confirmPassword': ['', [Validators.required, this.validationFormService.confirmPasswordValidator]],
      'email': ['', [Validators.required, this.validationFormService.emailValidator]],
      'isUpdateOffer': ['']
    });
  }

  onSubmit() {
    this.message = "";
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const params = {
      'email': this.registerForm.get('email').value,
      'password': this.registerForm.get('password').value,
      'confirmPassword': this.registerForm.get('confirmPassword').value,
      'isUpdateOffer': this.registerForm.get('isUpdateOffer').value
    };

    console.log('params', params);
    this.httpRequestService.register(params).subscribe(resp => {
      const res = resp.json();
      //console.log(res, 'res');
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.isRegisterSuccessfully = true;
    }, error => {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      //console.log(error.status, error.status === 422);
      if (error.status === 422) {
        this.message = SYSTEM_MESSAGE.msg_your_email_taken;
      }
    });
  }

}
