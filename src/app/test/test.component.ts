import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ChatService } from '../services/chat.service';

@Component({
 selector: 'app-test',
 templateUrl: './test.component.html',
 styleUrls: ['./test.component.css']
})

export class TestComponent implements OnInit, OnDestroy {
    userName: any;
    public showScreen = false;
    constructor(private _Activatedroute: ActivatedRoute,
                private route: Router,
                private _cookieService: CookieService,
                private _chatService: ChatService) { }

    ngOnInit() {
        debugger
        this.userName = this._Activatedroute.snapshot.paramMap.get("id");
        if (this.userName) {
            let token = this._cookieService.get(this.userName);
            localStorage.setItem('token', token);
            this._getMe();
        }
    }
    _getMe() {
        this._chatService._getMe().toPromise()
        .then((res: any) => {
          localStorage.setItem('currentUser', JSON.stringify(res));
          this.route.navigateByUrl('/message');
          console.log(res)
         }).catch((err: any) => { console.log(err) })
      }

      ngOnDestroy() {
          window.location.reload();
      }



}