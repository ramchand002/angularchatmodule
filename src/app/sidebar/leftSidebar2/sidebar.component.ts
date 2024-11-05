import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { usersInterface, channelInteface, userStatusInteface } from '../../Interface/Interface.component';
import { WebSocketService } from '../../services/websocket.service';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/services/commonService.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-left-sidebar2',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class LesftSidebarTwoComponent implements OnInit {
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
  _channelsAndMembers: channelInteface[];
  _selectedChannelId: any;
  _searchRecords: usersInterface[];
  timeout: any = null;
  _totalUserCount = 0;

  constructor(private cdr: ChangeDetectorRef,
    private router: Router,
    private _chatService: ChatService,
    private _socketService: WebSocketService,
    public _commonService: CommonService,
    private modalService: NgbModal) { }

  ngOnInit() {
    debugger
    if (localStorage.getItem('token')) {
      this._socketService.create();
      this._getUsers();
      if (localStorage.getItem('team_id')) {
        this._getMyChannels(localStorage.getItem('team_id'));
      } else { this._getMyTeam(); }
      this._checkUnreadPost();
    }
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
  _getMyChannels(id: any) {
    this._chatService._getMyChannels(id).toPromise()
      .then((res: any) => {
        if (res && res.length > 0) {
          this._channelsAndMembers = res;
          this._publicChannels = res.filter((x: any) => x.type.toLowerCase() == 'o');
          this._privateChannels = res.filter((x: any) => x.type.toLowerCase() == 'p');
          this._directMessageUsers = res.filter((x: any) => x.type.toLowerCase() == 'd' || x.type.toLowerCase() == 'g');
          this._getMembers(localStorage.getItem('team_id'))
        }
      })
      .catch(err => { console.log(err) })
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

  _getMembers(id: any) {
    this._chatService._getMembers(id).toPromise()
      .then((res: any) => {
        this._allMembers = res;
        if (this._directMessageUsers.length > 0) {
          this._patchUserNameWithUsers();
        }
      }).catch((err) => { console.log(err) })
  }
  _patchUserNameWithUsers() {
    let user = JSON.parse(localStorage.getItem('currentUser') || "");
    this._channelsAndMembers.forEach((element: any) => {
      if (element.type.toLowerCase() == "d") {
        if (element.name) {
          let userId = element.name.split('__');
          let userName: any;
          if (userId[0] == user.id && userId[1] == user.id) {
            userName = this.members.filter(x => x.id == userId[0]).map(y => y.username)[0];
            element.user_Id = userId[0];
          } else {
            if (userId[0] != user.id) {
              userName = this.members.filter(x => x.id == userId[0]).map(y => y.username)[0];
              element.user_Id = userId[0];
            } else {
              userName = this.members.filter(x => x.id == userId[1]).map(y => y.username)[0];
              element.user_Id = userId[1];
            }
          }
          element.display_name = userName;
          element.username = userName
          if (user && userId[0] == user.id && userId[1] == user.id)
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

  _goToChat(user: channelInteface) {
    this._selectedChannelId = user.id;
    this.router.navigate(['message', user.username ? user.username : user.name, user.id]);
    this._channelView(user.id);
    let ids = this.members.map((x: any) => x.id);
    this._getUsersStatus(ids);
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

  _checkUserStatus(id: any) {
    if (id && this._status && this._status.length > 0) {
      let status: string = this._status.filter((x: any) => x.user_id == id).map((y: any) => y.status).toString();;
      if (status) { return status.toLowerCase(); }
      else { return 'offline'; }
    } else { return 'offline'; }
  }

  _getUnreadMsgCount(id: any) {
    if (id && this._allMembers) {
      let msgCount = this._allMembers.filter((x: any) => x.channel_id == id).map((y: any) => y.mention_count);
      return msgCount;
    } else { return 0 };
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

  openLg(content: any) {
    debugger
    this.modalService.open(content, { size: 'lg' });
    this._getTotalUsers();
  }

  _searchRecord(event: any) {
    clearTimeout(this.timeout);
    var $this = this;
    if (event.keyCode != 13) {
      if (event.target.value !== '') {
        this._searchDirectUsers(event.target.value);
      }
    }
  }

  _searchDirectUsers(val: any) {
    let obj = {
      "term": val,
      "team_id": ""
    }
    this._chatService._getDirectUsersSearchResult(obj).toPromise().then((res: any) => {
      debugger
      this._searchRecords = res;
    }).catch((err: any) => { console.log(err) })
  }

  _getTotalUsers() {
    this._chatService._getDirectUsersSearchStats().toPromise().then((res: any) => {
      if (res && res.total_users_count) {
        this._totalUserCount = res.total_users_count;
      }
    }).catch((err: any) => { console.log(err) })
  }

  _startDirectChat(data: any) {
    debugger
    let idsArray = [];
    let user = JSON.parse(localStorage.getItem('currentUser') || "");
    idsArray.push(user.id);
    idsArray.push(data.id);
    this._chatService._startDirectChat(idsArray)
      .toPromise().then((res: any) => {
        this._getUsers();
        this._getMyChannels(localStorage.getItem('team_id'));
        res.username = data.username;
        this.modalService.dismissAll();
        this._goToChat(res);
        console.log(res)
      }).catch((err: any) => { console.log(err) })
  }
}