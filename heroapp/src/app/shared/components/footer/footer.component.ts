import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpRequestService } from '../../services/http/http-request.service';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  // styleUrls: ['./footer.component.scss']
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent implements OnInit {
  secondaryColor: any;
  customizeSettings: any;
  primaryColor: string;
  subDomain: string;
  constructor( 
    private httpRequestService: HttpRequestService
    ){
    }

  ngOnInit() {
    const secondaryColor = localStorage.getItem('secondaryColor');
    if (secondaryColor) {
      this.secondaryColor = secondaryColor;
    } else {
    this.getCustomization();
    }
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
      this.secondaryColor = res.secondary_color;
      }
      })
    }
}
