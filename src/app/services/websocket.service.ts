
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import * as Rx from "rxjs";
import { chatInteface } from '../Interface/Interface.component';
import { BehaviorSubject } from 'rxjs';
const CHAT_URL = "wss://slack.clienturls.com/api/v4/websocket?connection_id=&sequence_number=0";
const defaultPingInterval = 60000;
const usersRoute = '/users'
@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    public _msgObj = new BehaviorSubject<any>(null);
    public _msgObjeVal = this._msgObj.asObservable();
    //my var
    private subject: Rx.Subject<MessageEvent>;
    public ws: WebSocket;
    observable: Rx.Observable<any>;
    sequence: number;
    heartbeat_msg = '--heartbeat--'
    heartbeat_interval: any = null
    missed_heartbeats: number = 0;
    _connecting = false;
    _reconnecting = false;
    connected = true;
    _connAttempts = 0;
    _lastPong: any;
    _messageID = 0;
    _pending:any = {};
    _pongTimeout: any;
    _pingInterval = 600000;
    authenticated = false;
    personalAccessToken = false;
    token:any = null
    messageMaxRunes:any = 4000;
    _chatMessage: chatInteface[];
    _activeUserName: string;
    constructor(private http: HttpClient) {
        this.sequence = 1;
    }

   
    public create() {
        if (this._connecting) { return; }
        this._connecting = true;
        if (this.ws) {
            this.ws.close();
        }

        this.ws = new WebSocket(CHAT_URL);

        this.ws.onerror = (event) => {
            this._connecting = false;
            console.log("error:-", event);
            return;
        }
        this.ws.onopen = (event) => {
            this._connecting = false;
            this._reconnecting = false;
            this.connected = true;
            this._connAttempts = 0;
            this._lastPong = Date.now();
            console.log("open:-", event);
            const challenge = {
                action: 'authentication_challenge',
                data: {
                    token: localStorage.getItem('token'),
                },
            };
            this._send(challenge);
            this._pongTimeout = setInterval(() => {
                
                if (!this.connected) {
                    this.reconnect();
                    return; 
                }
                if ((this._lastPong != null)
                    && ((Date.now() - this._lastPong) > (2 * this._pingInterval))) {
                    this.authenticated = false;
                    this.connected = false;
                    this.reconnect();
                    return;
                }
                this._send({ action: 'ping' });
            },
            this._pingInterval);
            return true;
        }
        this.ws.onclose = (event) => {
            console.log("close:-", event);
        }
        this.ws.onmessage = (event) => {
            console.log("receive message:-", event);
            this._getMessage(JSON.parse(event.data))
        }
    }

    _send(msg: any) {
        const message = {
            ...msg,
        };
        if (!this.connected) {
            return false;
        }
        this._messageID += 1;
        message.id = this._messageID;
        message.seq = message.id;
        this._pending[message.id] = message;
        this.ws.send(JSON.stringify(message));
        return message;
    }

    reconnect() {
        if (this._reconnecting) {
            return false;
        }
        this._connecting = false;
        this._reconnecting = true;

        if (this._pongTimeout) {
            clearInterval(this._pongTimeout);
            this._pongTimeout = null;
        }
        this.authenticated = false;

        if (this.ws) {
            this.ws.close();
        }

        this._connAttempts += 1;

        const timeout = this._connAttempts * 1000;
        return setTimeout(
            () => {
                if (this.personalAccessToken) {
                    return this.tokenLogin(this.token);
                }
               // return this.login(this.email, this.password, this.mfaToken);
            },
            timeout,
        );
    }
    tokenLogin(token: any) {
        this.token = token;
        this.personalAccessToken = true;
        const uri = `${usersRoute}/me`;
       // return this._apiCall('GET', uri, null, this._onLogin);
    }
    public close() {
        if (this.ws) {
            this.ws.close();
            // this.subject = null;
        }
    }
    login(email:any, password:any, mfaToken:any) {
        // this.personalAccessToken = false;
        // this.email = email;
        // this.password = password;
        // this.mfaToken = mfaToken;
        // this.logger.info('Logging in...');
        // return this._apiCall(
        //     'POST',
        //     `${usersRoute}/login`,
        //     {
        //         login_id: this.email,
        //         password: this.password,
        //         token: this.mfaToken,
        //     },
        //     this._onLogin,
        // );
    }

    public sendMessage(action?: string, data?: any) {
        let msg = {
            "seq": 1,
            "action": "authentication_challenge",
            "data": {
                "token": localStorage.getItem('token')
            }
        }
        if (this.ws && this.ws.readyState == WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
            return;
        }
        // this.ws.send()
    }


    public sendMessage2(actions?: string, datas?: any) {
        let msg = {
            action: actions,
            seq: this.sequence++,
            data: {
                channel_id: datas,
                 parent_id: ""
                 }
           
        }
        if (this.ws && this.ws.readyState == WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
        }
        // this.ws.send()
    }
    userTyping(channelId: string, parentId: string) {
        this.sendMessage('user_typing', {
            channel_id: channelId,
            parent_id: parentId,
        });
    }

    _getMessage(val: any) {
        
         console.log(val)
         if (val && val.data && val.data.post) {
            let post = JSON.parse(val.data.post);
            if (this._activeUserName == val.data.channel_name) {
                this._chatMessage.push(post)
            } else {
                 this._setUnreadPost(post);
            }
         }
         
    }

    _setUnreadPost(val: any) {
        this._msgObj.next(val);
    }
}
