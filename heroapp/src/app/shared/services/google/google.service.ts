import { Injectable, NgZone } from '@angular/core';
import { GoogleMapsAPIWrapper } from '@agm/core';
import { MapsAPILoader } from '@agm/core';
import { Observable } from 'rxjs/Observable';

declare var google: any;

@Injectable()
export class GMapsService extends GoogleMapsAPIWrapper {

  constructor(private __loader: MapsAPILoader,
              private __zone: NgZone) {
              super(__loader, __zone);
  }

  getLatLan(address: string) {
    const geocoder = new google.maps.Geocoder();
    return Observable.create(observer => {
      geocoder.geocode( { 'address': address}, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          observer.next(results[0].geometry.location);
          observer.complete();
        } else {
          //console.log('Error - ', results, ' & Status - ', status);
          observer.next({});
          observer.complete();
        }
      });
    });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      return new Observable(observer => {
        navigator.geolocation.getCurrentPosition(
          position => {
            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            const latlng = { lat: lat, lng: long };
            const geocoder = new google.maps.Geocoder();
  
            geocoder.geocode({ 'location': latlng }, (results, status) => {
              if (status === google.maps.GeocoderStatus.OK) {
                observer.next(results[0]);
                observer.complete();
              } else {
                console.log('Error - ', results, ' & Status - ', status);
                observer.error(new Error('Geocoding error')); // Emit error using observer.error
              }
            });
          },
          error => {
            console.log('Geolocation error - ', error);
            observer.error(new Error('Geolocation error')); // Emit error if getCurrentPosition fails
          }
        );
      });
    } else {
      return new Observable(observer => {
        observer.error(new Error('Geolocation not supported'));
      });
    }
  }
}
