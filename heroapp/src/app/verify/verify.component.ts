import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ValidationFormService } from '../shared/services/validation-form/validation-form.service';
import { HttpRequestService } from '../shared/services/http/http-request.service';
import { EventMessage } from '../shared/services/event-message/event-message.service';
import { MESSAGE_EVENT, SYSTEM_MESSAGE } from '../../constants';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../shared/services/authentication.service';
import { OpenModalService } from '../shared/services/open-modal/open-modal.service';
@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  verifyForm: any;
  emailParams: any;
  codeParams: any;
  message: any;
  pages = [
    '/assets/images/home-header-bg-1.jpeg',
    '/assets/images/home-header-bg-2.jpeg',
    '/assets/images/home-header-bg-3.jpg'
  ]; 
  isVerified:any = false;
  constructor(private formBuilder: FormBuilder,
              private eventMsg: EventMessage,
              private router: Router,
              private httpRequestService: HttpRequestService,
              private validationFormService: ValidationFormService,
              private activatedRoute: ActivatedRoute, private toastr: ToastrService,
              private authenticationService: AuthenticationService, private openModalService: OpenModalService) {
                this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);

                  
                if (this.authenticationService.isAuthenticated) {
                  this.router.navigate(['']);
                }

                this.activatedRoute.params.subscribe((res) => {
                  const params = {
                    'email': res['email'],
                    'verifyCode': Number(res['verifyCode'])
                  };
                  this.httpRequestService.verifyCode(params).subscribe(resp => {
                    const res = resp.json();
                    this.authenticationService.autoLoginAfterVerify(params.email)
                    this.isVerified = true;
                    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_login_success, true);
                    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
                  },
                   error => {
                    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
                    //this.router.navigate(['/verify']);
                  });
                });
               }

  ngOnInit() {
    this.verifyForm = this.formBuilder.group({
      'email': ['', [Validators.required, this.validationFormService.emailValidator]],
      'verifyCode': ['', [Validators.required, this.validationFormService.numberValidator]]
    });
  }

  onSubmit() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
    const params = {
      'email': this.verifyForm.get('email').value,
      'verifyCode': Number(this.verifyForm.get('verifyCode').value)
    };

    this.httpRequestService.verifyCode(params).subscribe(resp => {
      const res = resp.json();
      //console.log(res, 'res');
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      if (res.status === 401) {
        this.message = SYSTEM_MESSAGE.msg_wrong_verify_code;
        //this.toastr.error('Verify code was wrong');
        return;
      }
      if (this.authenticationService.isAuthenticated) {
        this.router.navigate(['/my-profile']);
      }
      else{
        this.router.navigate(['/login']);

      }},
    error => {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.openModalService.showModalCommon({
        title: 'Server is temporarily unavailable. Please reload and try again.'
      });
    } 
    );
  }

}
