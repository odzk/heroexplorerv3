import { Injectable } from '@angular/core';

// rxjs
import { BehaviorSubject } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable()
export class DatePickerHeader {
  public changePrice = new BehaviorSubject<any>(false);
  public changeMonth = new BehaviorSubject<any>(false);
  constructor() {}

  public onChangeMonth(activeDate: any) {
    this.changeMonth.next(activeDate);
  }

  public onChangePrice(price: string) {
    this.changePrice.next(price);
  }
}
