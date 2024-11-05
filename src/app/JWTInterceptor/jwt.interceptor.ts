import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError as observableThrowError } from 'rxjs';
import { environment } from '../../environments/environment';

import { tap, catchError, switchMap, finalize, filter, take } from 'rxjs/operators';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LoginService } from '../services/login.service';
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: LoginService, private router: Router) { }

    isRefreshingToken: boolean = false;
    tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any> | any> {
        
        return next.handle(this.addTokenToRequest(request, this.authenticationService.getAuthToken()))
            .pipe(
                catchError(err => {
                    if (err instanceof HttpErrorResponse) {
                        switch ((<HttpErrorResponse>err).status) {
                            case 401: 
                               // this.authenticationService.logout();
                                return this.handle401Error(request, next);
                            case 400: {
                                 return observableThrowError(err);
                            }
                            case 500: {
                                return observableThrowError(err);
                            }
                        }
                    } else {
                        return observableThrowError(err);
                    }
                }));
    }

    private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
        return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        let token: any = localStorage.getItem('token');
        return token;
    }


}
