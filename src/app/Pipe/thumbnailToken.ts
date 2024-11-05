import { Pipe, PipeTransform } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';

@Pipe({
    name: 'thumbnail'
})

export class ThumbnailPipe implements PipeTransform {
    constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }
   transform(url: any) {
       console.log(url)
       return this.http
            .get(url, { responseType: 'blob' }).
                pipe(
                    map((val: any) => this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(val))
                )
            )
   }
}