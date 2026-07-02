import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import { Logger } from '../logger/loger-service.service';

const log = new Logger('Broadcast Service')

interface BroadcastEvent {
  key: any;
  data?: any;
}

@Injectable()
export class Broadcaster {

  private static _instance: Broadcaster;
  private _eventBus: Subject<BroadcastEvent>;

  public static getInstance(): Broadcaster {
    if (!Broadcaster._instance) {
      Broadcaster._instance = new Broadcaster();
    }
    return Broadcaster._instance;
  }

  constructor() {
    if (Broadcaster._instance) {
      throw new Error('Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.');
    }
    Broadcaster._instance = this;
    this._eventBus = new Subject<BroadcastEvent>();
  }

  broadcast(key: any, data?: any) {
    this._eventBus.next({key, data});
  }

  on<T>(key: any): Observable<T> {
    return this._eventBus.asObservable()
      .filter(event => event.key === key)
      .map(event => <T>event.data);
  }
}
