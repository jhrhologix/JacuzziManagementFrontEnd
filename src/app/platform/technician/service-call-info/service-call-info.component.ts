import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-service-call-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  template: `
    <div class="service-call-info" *ngIf="serviceCallData">
      <div class="row info_client">
        <div class="col-12 col-md-6 d-flex justify-content-between align-items-center mb-2">
          <span class="badge title">{{ 'HEADER.Service_call' | translate }}</span>
          <span class="badge bg-primary">{{ serviceCallData.serviceCallNumber }}</span>
        </div>
        <div class="col-12 col-md-6 d-flex justify-content-between align-items-center mb-2">
          <span class="badge title">{{ 'HEADER.Reception_Date' | translate }}</span>
          <span class="badge bg-primary">{{ serviceCallData.dateReception }}</span>
        </div>
        <div class="col-12 col-md-6 d-flex justify-content-between align-items-center mb-2">
          <span class="badge title">{{ 'HEADER.PLACEMENT' | translate }}</span>
          <span class="badge bg-primary">{{ serviceCallData.datePlacement }}</span>
        </div>
        <div class="col-12 col-md-6 d-flex justify-content-between align-items-center mb-2">
          <span class="badge title">{{ 'Technician.ServiceRequester' | translate }}</span>
          <span class="badge bg-primary">{{ serviceCallData.poolSpecialist }}</span>
        </div>
        <div class="col-12 col-md-6 d-flex justify-content-between align-items-center mb-2">
          <span class="badge title">{{ 'SERVICE_CALL.Issue' | translate }}</span>
          <span class="badge bg-primary">{{ serviceCallData.issueProblem }}</span>
        </div>
        <div class="col-12 col-md-6 d-flex justify-content-between align-items-center mb-2">
          <span class="badge title">{{ 'SERVICE_CALL.Status' | translate }}</span>
          <span class="badge bg-primary">{{ serviceCallData.status }}</span>
        </div>
        <div class="col-md-12 col-12 mb-2">
          <label class="form-label">{{ 'SERVICE_CALL.ProblemDescription' | translate }}</label>
          <textarea class="form-control" rows="2" readonly>{{ serviceCallData.description }}</textarea>
        </div>
        <div class="col-md-6 col-12">
          <label class="form-label">{{ 'HEADER.NOTES' | translate }}</label>
          <textarea class="form-control" rows="2" readonly>{{ serviceCallData.notes }}</textarea>
        </div>
        <div class="col-md-6 col-12">
          <label class="form-label">{{ 'HEADER.COMMENTS' | translate }}</label>
          <textarea class="form-control" rows="2" readonly>{{ serviceCallData.comments }}</textarea>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .service-call-info {
      padding: 1rem;
    }
    .badge {
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
    }
    .title {
      background-color: #f8f9fa;
      color: #212529;
    }
    textarea {
      resize: none;
    }
  `]
})
export class ServiceCallInfoComponent {
  @Input() serviceCallData: any;
} 