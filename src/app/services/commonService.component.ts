import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor() { }

  _bindProfileImage(user: any) {
    let url = "";
    if (user && user.user_Id) {
       url = environment._chatUrl + '/api/v4/users/' + user.user_Id + '/image?_=' + user.update_at;
    } else {
        if (user && user.id) {
            url = environment._chatUrl + '/api/v4/users/' + user.id + '/image?_=' + user.update_at;
        }
    }
    return url;
}
       
}
