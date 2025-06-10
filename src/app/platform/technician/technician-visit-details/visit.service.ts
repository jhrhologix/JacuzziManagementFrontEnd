import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { JsonModel } from '../../../shared/models/json.model';
import { VisitReport } from '../../../shared/models/visit-report.model';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private apiUrl = `${environment.apiUrl}/api/Visit`;
  private technicianApiUrl = `${environment.apiUrl}/api/M_Technician`;

  constructor(private http: HttpClient) {}

  updateVisitStatus(visitId: number, completed: boolean | null): Observable<JsonModel<VisitReport>> {
    return this.http.post<JsonModel<VisitReport>>(`${this.apiUrl}/update-status`, {
      visitId,
      completed
    });
  }

  sendNotification(visitId: number): Observable<JsonModel<VisitReport>> {
    console.log('Getting client details for visitId:', visitId);
    // First get client details using the correct endpoint
    return this.http.get<any>(`${environment.apiUrl}/api/Technician/GetAllTechnicianDetailTechnicianPageByID?visitId=${visitId}`).pipe(
      tap(response => {
        console.log('Client details response:', response);
      }),
      switchMap(clientResponse => {
        if (!clientResponse || !clientResponse.value || clientResponse.value.length === 0) {
          console.error('No client details found in response:', clientResponse);
          throw new Error('No client details found');
        }
        
        const clientData = clientResponse.value[0];
        console.log('Client data:', clientData);
        
        // Use the same structure as the working service call notification
        const notificationData = {
          visitId: visitId,
          emailTemplateId: 13  // Using the same template ID as the working notification
        };
        console.log('Sending notification with data:', notificationData);
        
        // Use the same endpoint as the working service call notification
        return this.http.post<any>(`${environment.apiUrl}/api/ServiceCall/SendEmail`, notificationData).pipe(
          tap(response => {
            console.log('Notification response:', response);
            if (!response || !response.isSuccess) {
              throw new Error(response?.error?.message || 'Failed to send notification');
            }
          }),
          map(response => ({
            StatusCode: 200,
            Message: 'Notification sent successfully',
            data: response,
            accessToken: '',
            refreshToken: '',
            expires_in: 0,
            AppError: ''
          }))
        );
      })
    );
  }
}