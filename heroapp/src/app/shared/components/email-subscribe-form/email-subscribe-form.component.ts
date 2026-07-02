import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

interface MailChimpResponse {
  result: string;
  msg: string;
}

@Component({
	selector: 'email-subscribe-form',
	templateUrl: './email-subscribe-form.component.html'
})
export class EmailSubscribeForm {
	submitted = false;
    mailChimpEndpoint = 'https://8020hotelconference.us17.list-manage.com/subscribe/post-json?u=372bda6ab3d6be3f63fe39bb5&amp;id=70593bdbea&';
	error = '';

	constructor(private http: HttpClient) { }

	emailControl = new FormControl('', [
		Validators.required,
		Validators.email,
	]);

	submit() {
        this.error = '';
        if (this.emailControl.status === 'VALID') {
			const params = new HttpParams()
				.set('EMAIL', this.emailControl.value)
				.set('b_372bda6ab3d6be3f63fe39bb5_70593bdbea', ''); // hidden input name

			const mailChimpUrl = this.mailChimpEndpoint + params.toString();

            // 'c' refers to the jsonp callback param key. This is specific to Mailchimp
			this.http.jsonp<MailChimpResponse>(mailChimpUrl, 'c').subscribe(response => {
				if (response.result && response.result !== 'error') {
                    this.submitted = true;
                    alert('Subscribed!');
				}
				else {
                    this.error = response.msg;
                    alert(this.error);
				}
			}, error => {
				console.error(error);
				this.error = 'Sorry, an error occurred.';
			});
		}
	}
}