import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { JsonModel } from '../../../shared/Models/json.model';
import { VisitReport } from '../../../shared/Models/visit-report.model';
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

  sendNotification(visitId: number, clientId: number): Observable<JsonModel<VisitReport>> {
    console.log('Getting client details for visitId:', visitId, 'clientId:', clientId);
    
    if (!clientId) {
      console.error('No client ID provided');
      throw new Error('Client ID is required');
    }
    
    // Get full client details using the client ID
    return this.http.post<any>(`${environment.apiUrl}/api/clients/getclientbyid?clientId=${clientId}`, null).pipe(
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
        console.log('Full client data structure:', JSON.stringify(clientData, null, 2));
        
        console.log('Client communication preferences:', {
          SMS: clientData.SMS,
          sms: clientData.sms,
          EmailClient: clientData.EmailClient,
          emailClient: clientData.emailClient,
          email: clientData.email,
          Email: clientData.Email,
          primaryEmail: clientData.primaryEmail,
          primaryemail: clientData.primaryemail,  // Check lowercase version
          PrimaryEmail: clientData.PrimaryEmail,
          mobileNumber: clientData.mobileNumber,
          MobileNumber: clientData.MobileNumber,
          home: clientData.home,
          Home: clientData.Home
        });
        
        // Use the email service endpoint that accepts client preferences directly
        const notificationData = {
          masterEmailTemplateId: 13,  // Email template ID
          masterSMSTemplateId: 13,    // SMS template ID (using same template for now)
          recipients: [clientData.primaryEmail || ''],  // List of email addresses
          visitDate: new Date().toISOString().split('T')[0],  // Today's date
          sms: [clientData.sms || false],  // List of SMS preferences
          emailClient: [clientData.emailClient || false],  // List of email preferences
          mobileNumber: [clientData.streetNumber || clientData.home || '']  // List of mobile numbers
        };
        console.log('Sending notification with data:', notificationData);
        
        // Use the email service endpoint that accepts client preferences directly
        return this.http.post<any>(`${environment.apiUrl}/api/EmailSechedule/SendEmail`, notificationData).pipe(
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