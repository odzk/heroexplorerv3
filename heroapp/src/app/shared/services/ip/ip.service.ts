import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IpService {
  private apiUrl = 'https://ipinfo.io/json?token=e03ac427402ce9'; // Ensure no extra callback parameter

  constructor(private http: HttpClient) {}

  getIpInfo(): Observable<any> {
    return this.http.jsonp(this.apiUrl, 'callback'); // Angular will handle callback parameter
  }
}
