import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard, isAlreadyLoggedIn } from '../core/guards/auth.guard';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent,
      canActivate : [isAlreadyLoggedIn]
    },
    { path: 'forget-password', component: ForgetPasswordComponent
      // ,
      // canActivate : [isAlreadyLoggedIn]
    }
      
];
@NgModule({
    imports: [
      CommonModule,
      [RouterModule.forChild(routes)]
    ]
  })
  export class AuthRoutingModule{

  }
// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
 
// const routes: Routes = [];
 
// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule]
// })
// export class AuthRoutingModule { }