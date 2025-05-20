import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageTechnicianComponent } from './manage-technician/manage-technician.component';
import { TechnicianVisitDetailsComponent } from './technician-visit-details/technician-visit-details.component';
import { ToastrModule } from 'ngx-toastr';
import { ClientDetailsComponent } from './client-details/client-details.component';
import { SpaDetailsComponent } from './spa-details/spa-details.component';
import { TechnicianServicecallHistoryComponent } from './technician-servicecall-history/technician-servicecall-history.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'manage-technician', component: ManageTechnicianComponent },
      { path: 'technician-visit', component: TechnicianVisitDetailsComponent },
      { path: 'client-details', component: ClientDetailsComponent },
      { path: 'spa-details', component: SpaDetailsComponent },
      { path: 'servicecall-history', component: TechnicianServicecallHistoryComponent }
    ]
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes),  ToastrModule.forRoot()],
  exports: [RouterModule]
})
export class TechnicianRoutingModule { }
