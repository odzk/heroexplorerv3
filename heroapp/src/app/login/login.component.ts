import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidationFormService } from '../shared/services/validation-form/validation-form.service';
import { HttpRequestService } from '../shared/services/http/http-request.service';
import { EventMessage } from '../shared/services/event-message/event-message.service';
import { MESSAGE_EVENT, SYSTEM_MESSAGE } from '../../constants';
import { AuthenticationService } from '../shared/services/authentication.service';
import { OpenModalService } from '../shared/services/open-modal/open-modal.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: any;
  verifyForm: any;
  message: any;
  customizeSettings: any;
  pages = ['/assets/images/home-header-bg-1.jpeg', '/assets/images/home-header-bg-2.jpeg', '/assets/images/home-header-bg-3.jpg'];
  isShowSet = false;
  buttonType: string;
  secondaryColor: string;
  subDomain: string;
  primaryColor: any;
  constructor(
    private formBuilder: FormBuilder,
    private eventMsg: EventMessage,
    private router: Router,
    private httpRequestService: HttpRequestService,
    private authenticationService: AuthenticationService,
    private validationFormService: ValidationFormService,
    private openModalService: OpenModalService,

  ) {
    if (this.authenticationService.isAuthenticated) {
      this.router.navigate(['']);
    }
  }

  ngOnInit() {
    // init login form
    const primaryColor = localStorage.getItem('primaryColor')
    const secondaryColor = localStorage.getItem('secondaryColor');
    const buttonType = localStorage.getItem('buttonType');
    if (primaryColor) {
      this.primaryColor = primaryColor;
      this.secondaryColor = secondaryColor;
      this.buttonType = buttonType;
    } else {
    this.getCustomization();
    }
    this.loginForm = this.formBuilder.group({
      password: ['', [Validators.required, this.validationFormService.loginPasswordValidator]],
      email: ['', [Validators.required, this.validationFormService.emailValidator]]
    });
  }

  getCustomization() {
    const domain = /:\/\/([^\/]+)/.exec(window.location.href)[1];
    if (domain.indexOf('.') > -1) {
      const subdomain = domain.split('.')[0];
      if (subdomain) {
        this.subDomain = subdomain;
      } else {
        this.subDomain = 'www';
      }
    }
    this.httpRequestService.getSettingsByDomain(this.subDomain).subscribe((resp) => {
      const res = resp.json();
      if(res){
      this.primaryColor = res.primary_color;
      this.secondaryColor = res.secondary_color;
      this.buttonType = res.button_type;
      } else {
        this.primaryColor = "#CC5757";
      }
      })
    }

  onSubmit() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const params = {
      email: this.loginForm.get('email').value,
      password: this.loginForm.get('password').value
    };

    //console.log('params', params);
    this.authenticationService.login(params).subscribe(
      resp => {
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_login_success, true);
        this.router.navigate(['/my-profile']);
      },
      error => {
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
        if (error.text().indexOf('LOGIN_FAILED_EMAIL_NOT_VERIFIED') != -1) {
          this.router.navigate(['/verify']);
        } else {
          if (this.loginForm.get('email').errors !== '' && this.loginForm.get('password').errors !== '') {
            this.message = SYSTEM_MESSAGE.msg_login_failed;
          }
        }
      }
    );
  }

  async showForgotPasswordModal() {
    let confirm = await this.openModalService.showModalForgorPassword({
      title: '',
      message: ''
    });
    //console.log(confirm);
    if (confirm) {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
      let email = confirm;
      const params = {
        email: email
      };

      this.httpRequestService.sentCodeForgotPassword(params).subscribe(resp => {
        this.isShowSet = true;
        this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      });
    }
  }
}