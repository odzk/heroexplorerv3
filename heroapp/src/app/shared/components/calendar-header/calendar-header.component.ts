import { Inject, Component, ChangeDetectorRef, OnDestroy, Renderer2, ElementRef, AfterViewInit, OnInit, Input } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as _moment from 'moment';

import { DatePickerHeader } from '../../services/datepicker/datepicker-header.service';
import { LocalStoreService } from '../../services/localstore/localstore.service';


@Component({
  selector: 'app-calendar-header',
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.scss']
})
export class CalendarHeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  public isPrevActive: boolean;
  private _destroyed = new Subject<void>();
  primaryColor: string;
  secondaryColor: string;
  private staticPrice = LocalStoreService.getInstance().getStaticPrice();

  constructor(
    private el: ElementRef,
    private _calendar: MatCalendar<any>,
    private _dateAdapter: DateAdapter<any>,
    @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
    public cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private datePickerServ: DatePickerHeader
  ) {
    _calendar.stateChanges.pipe(takeUntil(this._destroyed)).subscribe(() => cdr.markForCheck());
  }

  ngOnInit() {
    this.primaryColor = localStorage.getItem('primaryColor');
    this.secondaryColor = localStorage.getItem('secondaryColor');
    this.checkActivePreview();
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  ngAfterViewInit() {
    this.addPriceElement();
    this.datePickerServ.onChangeMonth(this._calendar.activeDate);
  }

  get periodLabel() {
    return this._dateAdapter.format(this._calendar.activeDate, this._dateFormats.display.monthYearA11yLabel).toLocaleUpperCase();
  }

  previousClicked(mode: 'month' | 'year') {
    this.addPriceElement();
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, -1);
    this.checkActivePreview();
    this.datePickerServ.onChangeMonth(this._calendar.activeDate);
  }

  nextClicked(mode: 'month' | 'year') {
    this.addPriceElement();
    this._calendar.activeDate =
      mode === 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1)
        : this._dateAdapter.addCalendarYears(this._calendar.activeDate, 1);
    this.checkActivePreview();
    this.datePickerServ.onChangeMonth(this._calendar.activeDate);
  }

  checkActivePreview() {
    const activeDate = this._calendar.activeDate.format('L');
    const prevMonth = _moment(activeDate, 'L').subtract(1, 'months').format('L');
    this.isPrevActive = _moment().isSameOrBefore(_moment(prevMonth, 'L'), 'month');
  }

  addPriceElement() {
    this.datePickerServ.changePrice.subscribe(priceData => {
      if (priceData) {
        console.log('Price Data Calendar: ', priceData);
        // setTimeout(() => {
        // check if date price already exists:
        const checkDiv = document.getElementsByClassName('date-price');
        console.log('Check div: ', checkDiv);
        while(checkDiv.length > 0){
          checkDiv[0].parentNode.removeChild(checkDiv[0]);
        }

        const div = document.createElement('div');
        const price = parseInt(priceData.summary.fromPrice);
        const text = document.createTextNode(price.toString());
        div.appendChild(text);
        div.className = 'date-price';
        div.style['color'] = this.secondaryColor;

        const activeDateColor = Array.from(document.getElementsByClassName('mat-calendar-body-selected') as HTMLCollectionOf<HTMLElement>)
        const activeDateColorHover = Array.from(document.getElementsByClassName('mat-calendar-body-cell') as HTMLCollectionOf<HTMLElement>)
        const elements = document.getElementsByClassName('mat-calendar-body-cell-content');

        const iconsColor = Array.from(document.getElementsByClassName('material-icons') as HTMLCollectionOf<HTMLElement>)
        if(activeDateColor[0]) {
        activeDateColor[0].style.cssText = "color: #ffffff;";
        activeDateColor[0].style['background-color'] = this.primaryColor;
        }
        for (let element = 0; element < elements.length; element++) {
          elements[element].appendChild(div.cloneNode(true));
        }
      
      //   for (let num = 0; num < iconsColor.length; num++) {
      //   activeDateColor[num].style['background-color'] = this.primaryColor;
      // }
      //   for (let num = 0; num < iconsColor.length; num++) {
      //     iconsColor[num].style['color'] = this.primaryColor;
      //     }

      //   // }, 500);
      // }
      }

    });
  }
}
