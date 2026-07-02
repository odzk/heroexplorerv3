import { Injectable } from '@angular/core';
import {
  Http, Request, Response, RequestOptionsArgs, RequestMethod,
} from '@angular/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { Logger } from '../logger/loger-service.service';

const log = new Logger('HttpService');

/**
 * Provides a base framework for http service extension.
 * The default extension adds support for API prefixing, request caching and default error handler.
 */
@Injectable()
export class HttpService {

  constructor(private http: Http) { }

  /**
   * Performs any type of http request.
   * You can customize this method with your own extended behavior.
   */
  request(request: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    options = options || {};
    let url: string;
    if (request && request.toString().indexOf('pro.ip-api.com') === -1) {
      if (typeof request === 'string') {
        url = request;
        request = environment.apiUrl + url;
      } else {
        url = request.url;
        request.url = environment.apiUrl + url;
      }
    }
    // Do not use cache
    return this.httpRequest(request, options);
  }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(url, Object.assign({}, options, { method: RequestMethod.Get }));
  }

  post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(url, Object.assign({}, options, {
      body: body,
      method: RequestMethod.Post
    }));
  }

  put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(url, Object.assign({}, options, {
      body: body,
      method: RequestMethod.Put
    }));
  }

  delete(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(url, Object.assign({}, options, {
      body: body,
      method: RequestMethod.Delete
    }));
  }

  patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(url, Object.assign({}, options, {
      body: body,
      method: RequestMethod.Patch
    }));
  }

  head(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(url, Object.assign({}, options, { method: RequestMethod.Head }));
  }

  options(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.request(url, Object.assign({}, options, { method: RequestMethod.Options }));
  }

  // Customize the default behavior for all http requests here if needed
  private httpRequest(request: string | Request, options: RequestOptionsArgs): Observable<Response> {
    log.debug(request);
    let req = this.http.request(request, options);
    // Customize error handling if needed
    req = req.pipe(catchError(this.errorHandler.bind(this)));
    return req;
  }

  // Customize the default error handler here if needed
  private errorHandler(response: Response): Observable<Response> {
    if (environment.production) {
      // Avoid uncaught exceptions on production
      log.error('Request error', response);
      return throwError(response);
    }
    throw response;
  }
}
