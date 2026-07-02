import { Component, OnInit, OnDestroy, HostBinding, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LocalStoreService } from '../../services/localstore/localstore.service';
import { EventMessage } from '../../services/event-message/event-message.service';
import { fadeInAnimation } from '../../directives/animations';
import { MESSAGE_EVENT, LIST_CURRENCY_CODE, LIST_LANGUAGES } from '../../../../constants';
import { AuthenticationService } from '../../services/authentication.service';
import { MatMenuTrigger } from '@angular/material';
declare var $: any;

import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  animations: [fadeInAnimation()]
})
export class NavBarComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private eventMsg: EventMessage,
    private authenticationService: AuthenticationService,
  ) {
    let width = $(window).width();
    this.marginRight = (width - $('.header-container').width()) / 2 + 'px';

    this.eventMsg.onMessage(MESSAGE_EVENT.msg_update_card_number).subscribe((res: any) => {
      this.cartNumber = res;
    });

    this.eventMsg.onMessage(MESSAGE_EVENT.msg_show_menu).subscribe((res: any) => {
      this.isShowMenu = res;
    });

    this.eventMsg.onMessage(MESSAGE_EVENT.msg_login_success).subscribe((res: any) => {
      this.isLogged = res;
    });

    this.isLogged = this.authenticationService.isAuthenticated;
    window.addEventListener('scroll', this.scroll, true);
    let location = '';
    router.events
      .filter((event) => event instanceof NavigationEnd)
      .subscribe((href: any) => {
        location = href.url;

        if (location !== '/') {
          window.onresize = (event) => {
            width = $(window).width();
            const rightPx = (width - $('.header-container').width()) / 2;
            this.marginRight = rightPx + 'px';
          };
        } else {
          window.onresize = (event) => {
            width = $(window).width();
            const rightPx = (width - $('.home-content').width()) / 2 + 10;
            this.marginRight = rightPx + 'px';
          };
        }
      });
  }
  @HostBinding('@fadeInAnimation') any: '';

  currentAccountAction: any;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  cartShopping: Array<any>;
  account = [{ name: 'Account' }, { name: 'Login' }, { name: 'Register' }];
  currency = LIST_CURRENCY_CODE;

  currencyCode = 'AUD';
  cartNumber = 0;
  isShowMenu = false;
  isShowCurrency = false;
  isShowLanguage = false;
  isLogged = false;
  marginRight = '6rem';
  lastTime: any = new Date().getTime();
  timeLeft: any = 10000;
  currentIndex: any = 45;
  currentTime: any = new Date().getTime();

  isFirebaseAuth = false;
  isAdminProfileRoute = false;
  customizeSettings: any;

  scroll = (): void => {
    if (this.trigger) {
      this.trigger.closeMenu();
    }

    // this.detectTopPositionForFilterBar(1);
  };

  ngOnInit() {
    this.currencyCode = LocalStoreService.getInstance().getCurrencyCode();
    this.cartShopping = LocalStoreService.getInstance().getCartShopping();
    this.cartNumber = this.cartShopping.length;
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scroll, true);
  }

  currencyCodeChange() {
    LocalStoreService.getInstance().setCurrencyCode(this.currencyCode);
    window.location.reload();
  }

  goToOrderPage() {
    this.router.navigate(['order']);
  }

  goToLogin() {
    this.router.navigate(['login']);
  }

  goToRegister() {
    this.router.navigate(['register']);
  }

  goToAdminProfile() {
    this.router.navigate(['admin-profile']);
  }

  toggleShowMenu() {
    this.isShowMenu = !this.isShowMenu;
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_mask, this.isShowMenu);
  }

  onClickChangeCurrency(item) {
    this.currencyCode = item;
    this.currencyCodeChange();
  }

  logout() {
    this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, true);

    setTimeout((x) => {
      this.isLogged = false;
      this.authenticationService.logout();
      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    }, 1000);
  }

  currentAccountActionChange() {
    // if (this.currentAccountAction === 'Login') {
    //   this.router.navigate(['login']);
    // } else {
    //   this.router.navigate(['register']);
    // }
  }
}
