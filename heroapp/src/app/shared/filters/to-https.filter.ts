import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toHttps'
})
export class ToHttps implements PipeTransform {
  transform(value: string): string {
    if (!value || value === null || value.includes('hare-media-cdn.tripadvisor.com/media')) {
      return '/assets/images/no-image.png';
    }
    if (value && value.includes('http:')) {
      return value.replace('http', 'https');
    } else {
      return value;
    }
  }
}
