import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SendingemailService } from '../../platform/admin/sending-email/sendingemail.service';

interface Client {
  clientId: number;
  clientNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  emailClient: boolean;
  sms: boolean;
  mobileNumber: string;
  selectrow: boolean;
  sMS: boolean;
  emailSend: boolean;
}

@Component({
  selector: 'app-sending-email',
  templateUrl: './sending-email.component.html',
  styleUrls: ['./sending-email.component.scss']
})
export class SendingEmailComponent implements OnInit {
  clients: Client[] = [];

  constructor(
    private emailService: SendingemailService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  private sendSMS(mobileNumbers: string[], message: string): void {
    if (!mobileNumbers.length) {
      console.error('No valid mobile numbers to send SMS to');
      return;
    }

    // Format numbers for API
    const formattedNumbers = mobileNumbers.map(num => {
      // Remove any non-digit characters and ensure it starts with country code
      const cleaned = num.replace(/\D/g, '');
      return cleaned.startsWith('1') ? cleaned : `1${cleaned}`;
    });

    console.log('Sending SMS to numbers:', formattedNumbers);

    const smsRequest = {
      to: formattedNumbers,
      message: message
    };

    this.emailService.sendSMS(smsRequest).subscribe({
      next: (response: any) => {
        console.log('SMS sent successfully:', response);
        this.snackBar.open('SMS sent successfully', 'Close', { duration: 3000 });
      },
      error: (error: any) => {
        console.error('Error sending SMS:', error);
        this.snackBar.open('Error sending SMS: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
      }
    });
  }

  private getSelectedMobileNumbers(): string[] {
    const selectedClients = this.clients.filter(client => client.selectrow);
    const mobileNumbers: string[] = [];

    selectedClients.forEach(client => {
      if (client.sms && client.mobileNumber) {
        // Clean the number - remove any non-digit characters
        const cleanedNumber = client.mobileNumber.replace(/\D/g, '');
        console.log('Cleaned number:', cleanedNumber);
        
        // Validate the number has at least 10 digits
        if (cleanedNumber.length >= 10) {
          mobileNumbers.push(cleanedNumber);
        } else {
          console.warn(`Invalid mobile number for client ${client.firstName} ${client.lastName}: ${client.mobileNumber}`);
        }
      }
    });

    console.log('Selected mobile numbers:', mobileNumbers);
    return mobileNumbers;
  }
}