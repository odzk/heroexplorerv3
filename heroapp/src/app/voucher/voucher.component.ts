import { Component, OnInit } from '@angular/core';

import { EventMessage } from '../shared/services/event-message/event-message.service';
import { ActivatedRoute } from '@angular/router';
import { MESSAGE_EVENT } from '../../constants';
import { HttpRequestService } from '../shared/services/http/http-request.service';

@Component({
  moduleId: module.id,
  selector: 'app-voucher-template',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.scss']
})
export class VoucherComponent implements OnInit {

  voucherKey: any;
  data: any ;
  constructor(private activatedRoute: ActivatedRoute, private eventMsg: EventMessage, private httpRequestService: HttpRequestService, ) {
    this.activatedRoute.params.subscribe(res => {

      this.voucherKey = res.voucherKey

      this.httpRequestService.getVoucher(this.voucherKey).subscribe(resp => {

        //console.log(resp.json());
        const res = resp.json();
        if( res.Vouchers && res.Vouchers.Voucher) {
          this.data = res.Vouchers.Voucher[0];
        }
        else this.data = []
      })

      this.eventMsg.sendMessage(MESSAGE_EVENT.msg_show_loading, false);
    });
  }
  ngOnInit() {

  }
  print() {
    window.print();
  }
}
