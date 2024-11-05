import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ToastrService } from 'ngx-toastr';
// import {WebSocketService} from "./websocket.service";
import { Subscription, Observable } from "rxjs";
import { ChatService } from './services/chat.service';
import { LoginService } from './services/login.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { usersInterface, channelInteface, userStatusInteface } from './Interface/Interface.component';
import { WebSocketService } from './services/websocket.service';
import { CookieService } from 'ngx-cookie-service';
import { tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, AfterViewInit {
  messageFromServer = "";
  status: any;
  members: usersInterface[];

  @ViewChild('popup', { static: false }) popup: any;

  public roomId = "";
  public messageText = "";
  public messageArray: { user: string, message: string }[] = [];
  private storageArray = [];
  public showScreen = false;
  public phone = "";
  public currentUser: any;
  selectedUser: any;
  loginForm = true;
  model: any = {};
  userList: any;
 _publicChannels: channelInteface[];
 _privateChannels: channelInteface[];
 _directMessageUsers: channelInteface[];
 _status: userStatusInteface[];
_allMembers: any;
_checkMsgCountUpdate = true;
_userName: string;
 
  constructor(
    private modalService: NgbModal,
    private chatService: LoginService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private _chatService: ChatService,
    private _socketService: WebSocketService,
    private _cookieService: CookieService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    debugger
  
  //   this.route.queryParams
  //   .subscribe(params => {
  //     console.log(params); 
  //     if (params && params.userName) {
  //       this._userName = params.userName;
  //       let token = this._cookieService.get(this._userName);
  //       localStorage.setItem('token', token);
  //       this.showScreen = true;
  //       this._getMe();
  //     } else {
  //       if (localStorage.getItem('token')) {
  //         this.showScreen = true;
  //       }
  //     }
  //   }
  // )
    // if (localStorage.getItem('token')) {
    //   this._socketService.create();
    //   this._getUsers();
    //   if (localStorage.getItem('team_id')) {
    //     this._getMyChannels(localStorage.getItem('team_id'));
    //   } else { this._getMyTeam(); }
    // }
    // this._checkUnreadPost();
  }


  ngAfterViewInit(): void {
    this.checkUser();
    this.cdr.detectChanges();
  }

  _checkUnreadPost() {
    this._socketService._msgObjeVal.subscribe((res: any) => {
      if (res) { this._addUnreadCount(res); }
    })
  }

  _addUnreadCount(val: any) {
    if (val && this._allMembers) {
      let _filteredChannel = this._allMembers.filter((x: any) => x.channel_id == val.channel_id);
      if (_filteredChannel && _filteredChannel.length > 0) {
        _filteredChannel[0].mention_count += 1;
      } 
    }
  }

  getmessage() {
    if (this.chatService.currentUserValue) {
      // this.chatService.getMessage()
      // console.log(this.chatService.getMessage()
      // )
      // this.messageArray.push(data);
      ;
    }
  }

  checkUser() {
    if (localStorage.getItem('token')) {
      this.showScreen = true;
    } else {
      this.openPopup(this.popup);
    }
  }


  openPopup(content: any): void {
    this.modalService.open(content, { backdrop: 'static', centered: true });
  }

  sendMessage(): void {
  }

  onSubmit() {
    this.chatService.login(this.model.userName, this.model.password).subscribe(res => {
      if (res) {
        debugger
        this.showScreen = true;
        this.modalService.dismissAll();
        this.router.navigateByUrl('/message');
        window.location.reload();
      }
    });
  }

  _getUsers() {
    this._chatService._getUsersList().toPromise()
      .then((res: any) => {
        this.members = [];
        if (res && res.length > 0) {
          this.members = res;
          
          let ids = this.members.map((x: any) => x.id);
          this._getUsersStatus(ids);
          console.log(this.members)
        }
      }).catch(err => {

        console.log(err)
      })
  }

  _goToChat(user: channelInteface) {
    
    this.router.navigate(['socket', user.username ? user.username : user.name, user.id]);
    this._channelView(user.id);
    let ids = this.members.map((x: any) => x.id);
    this._getUsersStatus(ids);
  }

  _goToChannel(user: channelInteface) {
    
    this.router.navigate(['channel', user.name, user.id]);
    this._channelView(user.id);
  }
  _getMyTeam() {
    this._chatService._getMyTeam().toPromise()
      .then((res: any) => {
        if (res && res.length > 0) { 
          localStorage.setItem('team_id', res[0].id);
          this._getMyChannels(res[0].id);
          // this._getMembers(localStorage.getItem('team_id'))
        }
      })
      .catch(err => { console.log(err) })
  }

  _getMyChannels(id: any) {
    this._chatService._getMyChannels(id).toPromise()
      .then((res: any) => {
        if (res && res.length > 0) {
            this._publicChannels = res.filter((x: any) => x.type.toLowerCase() == 'o');
            this._privateChannels = res.filter((x: any) => x.type.toLowerCase() == 'p');
            this._directMessageUsers= res.filter((x: any) => x.type.toLowerCase() == 'd' || x.type.toLowerCase() == 'g');
            this._getMembers(localStorage.getItem('team_id'))
        }
      })
      .catch(err => { console.log(err) })
  }

  _patchUserNameWithUsers() {
    let user = JSON.parse(localStorage.getItem('currentUser') || "");
    this._directMessageUsers.forEach((element: any) => {
      if (element.type.toLowerCase() == "d") {
      if (element.name) {
      let userId = element.name.split('__');
      let userName = this.members.filter(x => x.id == userId[0]).map(y => y.username)[0];
       element.display_name = userName;
       element.username = userName
       element.user_Id = userId[0];
      if (user && userId[0] == user.id)
       element.display_name = element.display_name + ' (You)';
      }
    } else { element.username = element.display_name; }
    })
    this.cdr.detectChanges();
  }

  _getUsersStatus(obj: any) {
     this._chatService._getUsersStatus(obj).toPromise()
     .then((res: any) => {
         this._status = [];
         if (res && res.length > 0) {
           this._status = res;
         }
     }).catch((err: any) => { console.log(err) });
  }

  _checkUserStatus(id: any) {
     if (id && this._status && this._status.length > 0) {
        let status:string = this._status.filter((x: any) => x.user_id == id).map((y: any) => y.status).toString();;
        if (status) { return status.toLowerCase(); }
        else { return 'offline'; }
     } else { return 'offline'; }
  }

  _getMembers(id: any) {
    this._chatService._getMembers(id).toPromise()
    .then((res: any) => {
        this._allMembers = res;
        if (this._directMessageUsers.length > 0) {
          this._patchUserNameWithUsers();
        }
    }).catch((err) => { console.log(err) })
  }

  _getUnreadMsgCount(id: any) {
      if (id && this._allMembers) {
        let msgCount = this._allMembers.filter((x: any) => x.channel_id == id).map((y: any) => y.mention_count);
        return msgCount;
      } else  { return 0 };
  }

  _channelView(id: any) {
    let obj = {
      channel_id: id,
      collapsed_threads_supported: true
    }
    this._chatService._channelView(obj).toPromise()
    .then((res: any) => { 
      let rec = this._allMembers.filter((x: any) => x.channel_id == id);
      if (rec && rec.length > 0) {
         rec[0].mention_count = 0;
      }
    })
    .catch((err: any) => { console.log(err) })
  }

  testFun(ev: any) {
    
    console.log(ev)
  }

  _getMe() {
    this._chatService._getMe().toPromise()
    .then((res: any) => {
      debugger
      console.log(res)
     }).catch((err: any) => { console.log(err) })
  }
}
