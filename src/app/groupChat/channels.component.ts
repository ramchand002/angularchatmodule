import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, AfterViewInit, AfterViewChecked } from "@angular/core";
import { usersInterface, chatInteface, fileInterface } from '../Interface/Interface.component';
import { ChatService } from '../services/chat.service';
import { WebSocketService } from '../services/websocket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
selector: 'app-channel',
templateUrl: './channels.component.html',
styleUrls: ['./channels.component.css']
})

export class ChannelsComponent implements OnInit, AfterViewChecked {

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

    @ViewChild('scrollMe') private myScrollContainer: ElementRef

    constructor(private chatService: ChatService,
        public socketService: WebSocketService,
        private router: Router,
        private _Activatedroute: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private _chatService: ChatService) {
            this.router.routeReuseStrategy.shouldReuseRoute = () => false;
         }


    ngOnInit() {
        this._filesArray = [];
        this._filesIdsArray = [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || "");
        this.username = this._Activatedroute.snapshot.paramMap.get("id");
        this._channelId = this._Activatedroute.snapshot.paramMap.get("cid");
        this.socketService._activeUserName = '@' + this.username;
        console.log('channel id ', this._channelId)
        this.id = this.currentUser.id;
        this._myUserName = this.currentUser.username;
        this.socketService.create();
        this._getUsers();
        this._getUserChat(this.currentUser.id, this._channelId);
        this._channels(localStorage.getItem('team_id'));
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

      onFileSelected(event: any) {
        console.log('event triggered', event.target.files[0]);
        if (event && event.target && event.target.files && event.target.files.length > 0) {
          this.uploadImageLoop(0, event.target.files.length, event.target.files);
        }
        
        }
   
        uploadImageLoop(index: number, limit: number, file: any) {
           this.readFileUrl(file[index], (msg: string) => {
               let base64Image = new Blob([msg], { type: file[index].type });
               let string = Math.random().toString(36).substr(2);
               const formData = new FormData();
               formData.append('channel_id', this._channelId);
               formData.append('client_ids', string);
               formData.append('files', base64Image, file[index].name);
                this._uploadFile(index, limit, file, formData);
           });
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

        _bindThumbnail(image: fileInterface) {
            let url = "";
           // this._getThumb(image.id);
              if (image) {
                 url = environment._chatUrl + '/api/v4/files/' + image.id + '/thumbnail';
              }
              return url;
          }

          _getUsers() {
            this._chatService._getUsersList().toPromise()
              .then((res: any) => {
                  
                this.members = [];
                if (res && res.length > 0) {
                  this.members = res;
                  console.log(this.members)
                }
              }).catch(err => {
        
                console.log(err)
              })
          }

          _getUserName(id: any) {
              if (!this.members) {
                  return '';
              }
              let _msgSenderName = this.members.filter((x: any) => x.id == id).map((y: any) => y.username);
              if (_msgSenderName) {
                  return _msgSenderName;
              }
              return "";

              
          }
          scrollToBottom(): void {
            try {
                this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
            } catch(err) { }                 
        }

        ngAfterViewChecked() {
          this.scrollToBottom();
        }
  
}