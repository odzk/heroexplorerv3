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
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit {
  resetForm: any;
  emailParams: any;
  codeParams: any;
  message: any;
  pages = [
    '/assets/images/home-header-bg-1.jpeg',
    '/assets/images/home-header-bg-2.jpeg',
    '/assets/images/home-header-bg-3.jpg'
  ]; 
  constructor(private formBuilder: FormBuilder,
              private eventMsg: EventMessage,
              private router: Router,
              private httpRequestService: HttpRequestService,
              private validationFormService: ValidationFormService,
              private authenticationService: AuthenticationService, private openModalService: OpenModalService) {
                if (this.authenticationService.isAuthenticated) {
                  this.router.navigate(['']);
                }
                this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
                    
              
               }

  ngOnInit() {
    this.resetForm = this.formBuilder.group({
      'email': ['', [Validators.required, this.validationFormService.emailValidator]],
      'code': ['', [Validators.required, this.validationFormService.numberValidator]],
      'password': ['', [Validators.required, this.validationFormService.passwordValidator]],
      'confirmPassword': ['', [Validators.required, this.validationFormService.confirmPasswordValidator]]
    });

  }

  onSubmit() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);
  
    let email = this.resetForm.get('email').value;
    let code =Number(this.resetForm.get('code').value);
    let password= this.resetForm.get('password').value;
    
//console.log(email)
    this.httpRequestService.resetPasswordUseCode(email, code, password).subscribe(resp => {
      const res = resp.json();
      //console.log(res, 'res');
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      if (res.status === 504) {
        this.message = SYSTEM_MESSAGE.msg_wrong_recovery_code;
        return;
      }
      this.router.navigate(['/login']);

    },
    error => {
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
      this.openModalService.showModalCommon({
        title: 'Server is temporarily unavailable. Please reload and try again.'
      });
    } 
    );
  }

}
