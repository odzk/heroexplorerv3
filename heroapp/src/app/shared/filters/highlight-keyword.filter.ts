import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightKeyword'
})
export class HighlightKeyword implements PipeTransform {
  transform(value: string, keyword: string): string {
    //console.log(value);
    if (value && value.length > 0) {
      //console.log(value.replace(keyword, '<span class="hx-highlight-keyword">' + keyword + '</span>'));
      return value.replace(keyword, '<span class="hx-highlight-keyword">' + keyword + '</span>');
    } else {
      return value;
    }
  }
}
