import { Component, OnInit, HostBinding, ViewChild, ElementRef, Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { EventMessage } from './shared/services/event-message/event-message.service';
import { I18nService } from './shared/services/translation/i18n-service.service';
import { WindowService, ICustomWindow } from './shared/services/window/window.service';
import { fadeInAnimation } from './shared/directives/animations';
import { environment } from '../environments/environment';
import { MESSAGE_EVENT } from '../constants';
import { HttpRequestService } from './shared/services/http/http-request.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fadeInAnimation()]
})
export class AppComponent implements OnInit {
  @ViewChild('scrollContainer') public scrollContainer: ElementRef;
  @HostBinding('@fadeInAnimation') any: '';

  private _window: ICustomWindow;

  location = '';
  isShowLoading = false;
  isShowMask = false;
  subDomain: string;

  constructor(
    private router: Router,
    private i18nService: I18nService,
    private eventMsg: EventMessage,
    private windowService: WindowService,
    private httpRequestService: HttpRequestService
  ) {
    router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((href: any) => {
        this.location = href.url;
      });

    this.eventMsg.onMessage(MESSAGE_EVENT.msg_show_loading).subscribe((res: any) => {
      this.isShowLoading = res;
    });

    this.eventMsg.onMessage(MESSAGE_EVENT.msg_show_mask).subscribe((res: any) => {
      this.isShowMask = res;
    });
  }

  ngOnInit() {
    this.i18nService.init(environment.defaultLanguage, environment.supportedLanguages);
    if (environment.production) {
      console.log('Running in Production Mode');
    } else {
      console.log('Running in Development Mode');
    }
  }

  hideMask() {
    this.isShowMask = false;
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_menu, false);
  }

  onActivate(e, scrollContainer) {
    scrollContainer.scrollTop = 0;
    this.scrollContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getCustomValues() {
    const domain = /:\/\/([^\/]+)/.exec(window.location.href)[1];
    if (domain.indexOf('.') > -1) {
      const subdomain = domain.split('.')[0];
      if (subdomain) {
        this.subDomain = subdomain;
      } else {
        this.subDomain = 'www';
      }
    }
    this.httpRequestService.getSettingsByDomain(this.subDomain).subscribe(resp => {
      const res = resp.json();
      console.log('Res from MYSQL:', res);
      localStorage.setItem('primaryColor', res.primary_color);
      localStorage.setItem('secondaryColor', res.secondary_color);
      localStorage.setItem('buttonType', res.button_type);
      localStorage.setItem('textColor', res.text_color);
    });
  }
}