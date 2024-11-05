import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, ViewEncapsulation } from "@angular/core";
import { ChatService } from '../services/chat.service';
import { WebSocketService } from '../services/websocket.service';
import { usersInterface, chatInteface, fileInterface } from '../Interface/Interface.component';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CommonService } from '../services/commonService.component';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
    members: usersInterface[];
    id: any;
    messageText: string;
    username: any;
    currentUser: any;
    _toUserDetail: any;
    _chatMessage: chatInteface[];
    _myUserName: string;
    _channelId: any;
    _filesArray: fileInterface[];
    _filesIdsArray:any = [];
    _userIsOnline = false;
    _showStatus = false;
    _currentChatuser: any;

    @ViewChild('scrollMe') private myScrollContainer: ElementRef

     constructor(private chatService: ChatService,
        public socketService: WebSocketService,
        private router: Router,
        private _Activatedroute: ActivatedRoute,
        private cd: ChangeDetectorRef,
        public _commonService: CommonService) {
            this.router.routeReuseStrategy.shouldReuseRoute = () => false;
         }

    ngOnInit() {
        if (localStorage.getItem('token')) {
        this._filesArray = [];
        this._filesIdsArray = [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || "");
        this.username = this._Activatedroute.snapshot.paramMap.get("id");
        this._channelId = this._Activatedroute.snapshot.paramMap.get("cid");
        this.socketService._activeUserName = '@' + this.username;
        console.log('channel id ', this._channelId)
        this.id = this.currentUser.id;
        this._myUserName = this.currentUser.username;
       // this.socketService.create();
        this._getUserChat(this.currentUser.id, this._channelId);
        this._channels(localStorage.getItem('team_id'));
        this._getUsers();
        }
    }
    
    sendMessage() { 
        this.chatService._postData(this.currentUser.id, this._channelId, this._filesIdsArray, this.messageText).subscribe((res: any) => {
            console.log(res);
            this.messageText = "";
            this._filesArray = [];
            this._filesIdsArray = [];
        }, (err) => {
            console.log(err)
        })
    }

    _getUsers() {
        this.chatService._getUsersList().toPromise()
        .then((res: any) => { 
            this.members = [];
            if (res && res.length > 0) {
                this.members = res;
                this._currentChatuser = res.filter((x: any) => x.username == this.username);
                let id = res.filter((x: any) => x.username == this.username).map((y: any) => y.id);
                if (id && id.length > 0) { this._getUsersStatus(id); }
                console.log(this.members)
            }
        }).catch(err => {
            
            console.log(err)
        })
    }

    ngAfterViewInit() {
        
        console.log()
    }

    _getUserByUserName(username: string) {
      this.chatService._getUserByUserName(username).toPromise()
      .then((res: any) => {
          
          this._toUserDetail = res;
          console.log(res)
      }).catch((err) => { console.log(err) })
    }

    _getMembers(id: string) {
        this.chatService._getMembers(id).toPromise()
        .then((res: any) => {
            
           // this._toUserDetail = res;
            console.log(res)
        }).catch((err) => { console.log(err) })
      }

      _getUserChat(id: string, cid: string) {
        this.chatService._getUserChat(id, cid).toPromise()
        .then((res: any) => {
            
            let arr: any = [];
            if (res && res.order && res.order.length > 0) {
                res.order.forEach((element: any) => {
                    let record = res.posts[element];
                    arr.push(record);
                });
            }
            this.socketService._chatMessage = arr;
            this.socketService._chatMessage = this.socketService._chatMessage.reverse();
            console.log(res)
        }).catch((err) => { console.log(err) })
      }

      _channels(id: any) {
        this.chatService._getMyChannels(id).toPromise()
        .then((res: any) => {
          if (res && res.length > 0) {
             this.socketService._activeUserName = res.filter((x: any) => x.id == this._channelId).map((y: any) => y.name);
          }
        })
        .catch(err => { console.log(err) })
      }

      scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { }                 
    }

    onFileSelected(event: any) {
     console.log('event triggered', event.target.files[0]);
     if (event && event.target && event.target.files && event.target.files.length > 0) {
       this.uploadImageLoop(0, event.target.files.length, event.target.files);
     }
     
     }

     uploadImageLoop(index: number, limit: number, file: any) {
      //  this.readFileUrl(file[index], (msg: string) => {
          //  let base64Image = new Blob([msg], { type: file[index].type });
            let string = Math.random().toString(36).substr(2);
            const formData = new FormData();
            formData.append('channel_id', this._channelId);
            formData.append('client_ids', string);
            formData.append('files', file[index]);
             this._uploadFile(index, limit, file, formData);
       // });
      }
      readFileUrl(file: File, callback: (msg: string) => any) {
        const reader = new FileReader();
        reader.onload = (function (f) {
          return function (e: any) {
            callback(e.target.result);
          }
        })(file);
        reader.readAsDataURL(file);
      }

      _uploadFile(index: number, limit: number, file: any, formData: any) {
          this.chatService._uploadFile(formData, this._channelId, file[index].name).toPromise()
          .then((res: any) => {
              if (res && res.file_infos && res.file_infos.length > 0) {
                  this._filesIdsArray.push(res.file_infos[0].id);
                  this._filesArray.push(res.file_infos[0]);
                  this.cd.detectChanges();
              }
              console.log(res)
              if (index < limit - 1) {
                this.uploadImageLoop(++index, limit, file);
              }
          }).catch((err: any) => {
              console.log(err)
              if (index < limit - 1) {
                this.uploadImageLoop(++index, limit, file);
              }
          })
      }

      _bindThumbnail(image: fileInterface) {
        let url = "";
        //this._getThumb(image.id);
          if (image) {
             url = environment._chatUrl + '/api/v4/files/' + image.id + '/thumbnail';
          }
          return url;
      }

      _getThumb(id: any) {
          this.chatService._getThumbnail(id).toPromise()
          .then((res: any) => {
              debugger
              console.log(res)
          }).catch((err: any) => {
              console.log(err)
          })
      }
      _getUsersStatus(obj: any) {
        this.chatService._getUsersStatus(obj).toPromise()
        .then((res: any) => {
            debugger
            this._userIsOnline = false;
            if (res && res.length > 0) {
                if (res[0].status.toLowerCase() == "online") {
                    this._userIsOnline = true;
                }
            }
            this._showStatus = true;
        }).catch((err: any) => { console.log(err) });
     }

     _bindImageToChat(item: any) {
         let _url = "";
         let record = this.members.filter((x: any) => x.id == item.user_id);
         if (record && record.length > 0) {
            _url = environment._chatUrl + '/api/v4/users/' + item.user_id + '/image?_=' + record[0].update_at;
         }
         return _url;
     }

}