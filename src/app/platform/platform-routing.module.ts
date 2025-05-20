import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainContainorComponent } from './main-containor.component';
import { AuthGuard, haveAdminPermission, haveTechPermission } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MainContainorComponent,
    children: [
      {
        path: 'admin',
        loadChildren: () =>
          import('./admin/admin.module').then((m) => m.AdminModule),
        canActivate: [AuthGuard,haveAdminPermission],
      },
      {
        path: 'technician',
        loadChildren: () =>
          import('./technician/technician.module').then(
            (m) => m.TechnicianModule
          ),
        canActivate: [AuthGuard,haveTechPermission],
        

      },
      {
        path: 'admin-users',
        loadChildren: () =>
          import('./admin-users/admin-users.module').then(
            (m) => m.AdminUsersModule
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlatformRoutingModule { }