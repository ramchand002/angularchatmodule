import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SocketComponent } from './socket/socket.component';
import { RouterModule } from '@angular/router';
import { JwtInterceptor } from './JWTInterceptor/jwt.interceptor';
import { ChannelsComponent } from './groupChat/channels.component';
import { WebSocketService } from './services/websocket.service';
import { TestComponent } from './test/test.component';
import { ThumbnailPipe } from './Pipe/thumbnailToken';
import { LesftSidebarOneComponent } from './sidebar/leftSidebar1/sidebar.component';
import { LesftSidebarTwoComponent } from './sidebar/leftSidebar2/sidebar.component';
import { RightSidebarComponent } from './sidebar/rightSidebar/sidebar.component';
import { ChatComponent } from './chatComponent/chat.component';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
  declarations: [
    AppComponent,
    SocketComponent,
    ChannelsComponent,
    TestComponent,
    ThumbnailPipe,
    LesftSidebarOneComponent,
    LesftSidebarTwoComponent,
    RightSidebarComponent,
    ChatComponent
   // RoutingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    RouterModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    WebSocketService,
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
