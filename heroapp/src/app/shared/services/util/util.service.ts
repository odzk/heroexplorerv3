import {Injectable} from '@angular/core';

// import {Md5} from 'ts-md5/dist/md5';

@Injectable()
export class UtilService {

  private static _instance: UtilService;

  constructor() {
  }

  public static getInstance(): UtilService {
    if (!UtilService._instance) {
      UtilService._instance = new UtilService();
    }

    return UtilService._instance;
  }
  
  toHttps(value: string) {
    if (value && value.includes('http')) {
      
      return value.replace('http', 'https');
    } else {
      return value;
    }
  }
}
