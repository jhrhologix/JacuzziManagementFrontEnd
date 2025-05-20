import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth.routes';
import { ToastrModule } from 'ngx-toastr';



@NgModule({
  declarations: [
  ], 
  imports: [
    CommonModule,
    AuthRoutingModule,
    ToastrModule
    
  ]
})
export class AuthModule { }
