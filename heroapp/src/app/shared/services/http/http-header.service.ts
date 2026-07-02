import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';


function _window(): any {
  // return the global native browser window object
  return window;
}


@Injectable()
export class HttpHeaderService {

  private static instance: HttpHeaderService;

  constructor() {
  }

  public static getInstance(): HttpHeaderService {
    if (!HttpHeaderService.instance) {
      HttpHeaderService.instance = new HttpHeaderService();
    }
    return HttpHeaderService.instance;
  }


  getRequestHeader(isAuthorize:boolean = false): Headers {
    const headers = new Headers();

    if(isAuthorize){
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.token) {
        headers.append('Authorization', `${currentUser.token}`);
      }
    }
    headers.append('exp-api-key', '8fed96d3-2cb6-49aa-b232-4816b01debe7');
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append("Access-Control-Allow-Methods","GET, POST");
    headers.append('Access-Control-Allow-Origin', '*');

    return headers;
  }  
  getRequestHeaderFormData(isAuthorize:boolean = false): Headers {
    const headers = new Headers();

    if(isAuthorize){
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.token) {
        headers.append('Authorization', `${currentUser.token}`);
      }
    }
    headers.append('exp-api-key', '8fed96d3-2cb6-49aa-b232-4816b01debe7');
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Accept', 'application/json');
    headers.append("Access-Control-Allow-Methods","GET, POST");
    headers.append('Access-Control-Allow-Origin', '*');
    return headers;
  }  
}
