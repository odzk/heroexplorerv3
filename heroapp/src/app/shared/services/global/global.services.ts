import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';   

@Injectable({providedIn: 'root'})
export class GlobalService {
 pValue = new BehaviorSubject(this.primaryColor);
 sValue = new BehaviorSubject(this.secondaryColor);

 set primaryColor(value) {
   this.pValue.next(value); 
   localStorage.setItem('primary_color', value);
 }

 set secondaryColor(value) {
  this.sValue.next(value); 
  localStorage.setItem('secondary_color', value);
}

 get primaryColor() {
   return localStorage.getItem('primary_color');
 }

 get secondaryColor() {
  return localStorage.getItem('secondary_color');
  }
}