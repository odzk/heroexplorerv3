import { Component, OnInit, Input } from '@angular/core';
import { COMMON_VAR } from '../../../../constants';
import { GlobalService } from '../../services/global/global.services';


@Component({
  selector: 'app-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.scss']
})
export class ProductItemComponent implements OnInit {
  @Input() data: any;

  defaultNoImage = COMMON_VAR.defaultNoImage;
  primaryColor: any;
  secondaryColor: any;

  constructor(private globalSrv: GlobalService) { 
    globalSrv.pValue.subscribe((pValue) => {
      this.primaryColor = JSON.parse(pValue);
    });

    globalSrv.sValue.subscribe((sValue) => {
      this.secondaryColor = JSON.parse(sValue);
    });
  }

  ngOnInit() {
  }
}
