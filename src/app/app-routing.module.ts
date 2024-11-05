import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocketComponent } from './socket/socket.component';
import { ChannelsComponent } from './groupChat/channels.component';
import { TestComponent } from './test/test.component';
import { ChatComponent } from './chatComponent/chat.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  {path:'*/:id', component: AppComponent},
  {path:'component/:id', component: AppComponent},
  {path: 'socket', component: SocketComponent},
  {path: 'socket/:id', component: SocketComponent},
  {path: 'socket/:id/:cid', component: SocketComponent},
  {path: 'channel', component: ChannelsComponent},
  {path: 'channel/:id', component: ChannelsComponent},
  {path: 'channel/:id/:cid', component: ChannelsComponent},
  {path: 'test', component: TestComponent},
  {path: 'test/:id', component: TestComponent},
  {path: 'message', component: ChatComponent},
  {path: 'message/:id', component: ChatComponent},
  {path: 'message/:id/:cid', component: ChatComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// export const RoutingComponent = [
//   SocketComponent
// ]
