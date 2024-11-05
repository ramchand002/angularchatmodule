import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { WebSocketService } from './websocket.service';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
const CHAT_URL = "wss://slack.clienturls.com/api/v4/websocket?connection_id=&sequence_number=0";
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  //my var
  sequence: number;
  public messages: Subject<any>;
  constructor(private ws: WebSocketService,
              private http: HttpClient) {
               this.sequence = 1;
  }

  sendMessage(action?: string, val?: any) {
    let user = localStorage.getItem('currentUser')
  let msg = {
    action: "user_typing",
    data: {channel_id: "j1x7gb5y3in8mrytrxygsczxza", parent_id: ""},
    seq: this.sequence++
  }

    this.messages.next(msg);
}

_postData(id: string, channel_id: string | null, fileIds: any, msg: string) {
  let obj = {
      "file_ids": fileIds && fileIds.length > 0 ? fileIds : [],
      "message": msg,
      "channel_id": channel_id,
      "pending_post_id":id + ':' + Date.now(),
      "user_id": id,
      "create_at": 0,
      "metadata":{},
      "props":{
        "disable_group_highlight": true
      },
      "update_at": Date.now(),"reply_count":0}
      let _url = environment._chatUrl + "/api/v4/posts"; 
      return this.http.post(_url, obj)
    }

      _getUsersList() {
        let _url = environment._chatUrl + '/api/v4/users'
        return this.http.get(_url);
      }

      _getUserByUserName(userName: string) {
        let _url = environment._chatUrl + '/api/v4/users/username/' + userName;
        return this.http.get(_url);
      }

      _getMembers(id: string) {
        let _url = environment._chatUrl + '/api/v4/users/me/teams/' + id + '/channels/members';
        return this.http.get(_url);
      }

      _getUserChat(id: string, cid: string) {
        let _url = environment._chatUrl + '/api/v4/users/' + id + '/channels/' + cid + '/posts/unread?limit_after=30&limit_before=30&skipFetchThreads=false&collapsedThreads=false&collapsedThreadsExtended=false';
        return this.http.get(_url);
      }

      _getMyTeam() {
        let _url = environment._chatUrl + '/api/v4/users/me/teams';
        return this.http.get(_url);
      }
      _getMyChannels(team_id: any) {
        let _url = environment._chatUrl + '/api/v4/users/me/teams/' + team_id + '/channels?include_deleted=true';
        return this.http.get(_url);
      }

      _uploadFile(obj: any, cid: any, filename: any) {
        let _url = environment._chatUrl + '/api/v4/files?channel_id=' + cid + '&filename=' + filename;
        return this.http.post(_url, obj);
      }

      _getThumbnail(id: any) {
        let _url = environment._chatUrl + '/api/v4/files/' + id + '/thumbnail';
        return this.http.get(_url);
      }

      _getUsersStatus(ids: any) {
        let _url = environment._chatUrl + '/api/v4/users/status/ids';
        return this.http.post(_url, ids);
      }

      _channelView(obj: any) {
        let _url = environment._chatUrl + '/api/v4/channels/members/me/view';
        return this.http.post(_url, obj);
      }

      _getMe() {
        let _url = environment._chatUrl + '/api/v4/users/me';
        return this.http.get(_url);
      }

      _getDirectUsersSearchResult(obj: any) {
        let _url = environment._chatUrl + '/api/v4/users/search';
        return this.http.post(_url, obj);
      }

      _getDirectUsersSearchStats() {
        let _url = environment._chatUrl + '/api/v4/users/stats';
        return this.http.get(_url);
      }

      _startDirectChat(obj: any) {
        let _url = environment._chatUrl + '/api/v4/channels/direct';
        return this.http.post(_url, obj);
      }
       
}
