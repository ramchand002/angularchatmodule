import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { WebSocketService } from './websocket.service';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { User } from '../modal/user';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
const CHAT_URL = "ws://echo.websocket.org/";
@Injectable({
  providedIn: 'root'
})
export class LoginService {
    private url = 'https://slack.clienturls.com/api/v4'; // your server local path
    public currentUserSubject: BehaviorSubject<any>;
    constructor(private http: HttpClient,
                private router: Router) { }
  //my var


  login(login_id: string, password: string) {
    return this.http.post<any>(this.url + "/users/login", { login_id, password }, {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json'),
      observe: 'response'
    }).pipe(map((response: HttpResponse<any>) => {
      localStorage.setItem('currentUser', JSON.stringify(response.body));
     // this.currentUserSubject.next(response.body);
      const JWTtoken: any = response.headers.get('Token');
      localStorage.setItem('token', JWTtoken);
      return response;
    }));
  }

  public get currentUserValue(): any {
      
      if (this.currentUserSubject && this.currentUserSubject.value) {
        return this.currentUserSubject.value;
      }

    return null;
  }

  getAuthToken(): string {
    const currentUser = localStorage.getItem('token');
    if (currentUser != null) {
        return currentUser;
    }
    return '';
}

logout() {
  localStorage.clear();
  this.router.navigateByUrl('');
}

refreshToken() {
  const token = localStorage.getItem('token');
  const formData: FormData = new FormData();

  //formData.append('refreshToken', token);
  // formData.append('client_id', 'ro.angular');
  // formData.append('grant_type', 'refresh_token');
  // formData.append('client_secret', 'secret');
  ;
  return this.http.post<any>(`${environment._chatUrl}/api/TokenAuthMobile/RefreshToken?refreshToken=` +token, formData)
      .pipe(
          map(user => {

              if (user && user.result && user.result.accessToken) {
                  user.result.refreshToken = token;
                  localStorage.setItem('currentUser', JSON.stringify(user.result));
              }

              return user.result;
          }));
}

}
