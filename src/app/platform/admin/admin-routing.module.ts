import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from './clients/manage-client/client.component';
import { SpaModelComponent } from './spa-model/spa-model.component';
import { ServiceCallComponent } from './service-call/service-call/service-call.component';
import { SpaReportsComponent } from './spa-reports/spa-reports.component';
import { SendingEmailComponent } from './sending-email/sending-email.component';
import { AddServiceCallComponent } from './service-call/add-service-call/add-service-call.component';
import { CalendarComponent } from './calendar/calendar.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'manage-clients', component: ClientComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'spa-models', component: SpaModelComponent },
      { path: 'service-call', component: ServiceCallComponent },
      { path: 'spa-reports', component: SpaReportsComponent },
      { path: 'addservice-call', component: AddServiceCallComponent },
      { path: 'send-email', component: SendingEmailComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
