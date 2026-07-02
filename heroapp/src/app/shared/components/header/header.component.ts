import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { HttpRequestService } from '../../services/http/http-request.service';


// Services

export interface CustomSettings {
  button_settings?: ButtonSettings;
  logo_settings?: LogoSettings;
  subdomain: string;
  price_settings?: PriceSettings;
}

export interface ButtonSettings {
  border_radius?: number;
  text_color?: string;
  border_color?: string;
  background_color?: string;
  border_width?: number;
}

export interface LogoSettings {
  width?: number;
  url?: string;
  optimize_url?: string;
  height?: number;
}

export interface PriceSettings {
  text_color?: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  // styleUrls: ['./header.component.scss']
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit, AfterViewInit {
  subDomain: any;
  primaryColor: any;
  secondaryColor: any;
  logo_url: any;
  logo_width: any;
  logo_height: any;

  constructor( 
  private httpRequestService: HttpRequestService
  ){
  }

  public ngOnInit() {
    // const primaryColor = localStorage.getItem('primaryColor');
    // const secondaryColor = localStorage.getItem('secondaryColor');
    // const logo_url = localStorage.getItem('logoUrl');
    // const logo_height = localStorage.getItem('logoHeight');
    // const logo_width = localStorage.getItem('logoWidth');

    // if (primaryColor) {
    //   this.primaryColor = primaryColor;
    //   this.secondaryColor = secondaryColor;
    //   this.logo_url = logo_url;
    //   this.logo_height = logo_height;
    //   this.logo_width = logo_width;
    // } else {
    // this.getCustomization();
    // }
    this.getCustomization();
  }

    private updateHeader(value: any): void {
      this.logo_url = value; 
    }

  public ngAfterViewInit() {
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
      console.log('header mysql: ', res);
      this.primaryColor = res.primary_color;
      this.secondaryColor = res.secondary_color;
      this.logo_url = res.logo_url;
      this.logo_width = res.logo_width;
      this.logo_height = res.logo_height;
      }
      })
    }

}
