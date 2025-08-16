import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
  styleUrls: ['./sending-email.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [MatSnackBar]
})
export class SendingEmailComponent implements OnInit {
  clients: Client[] = [];
  message: string = ''; // Add missing message variable

  constructor(
    private emailService: SendingemailService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClients(); // Load clients on component initialization
  }

  private loadClients(): void {
    // Load clients from the service
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    this.emailService.getClientEmailSendList(today).subscribe({
      next: (response: any) => {
        if (response && response.value) {
          this.clients = response.value.map((client: any) => ({
            ...client,
            selectrow: false,
            sMS: client.sMS || client.sms || false,
            emailSend: client.emailClient || client.emailclient || false
          }));
        }
      },
      error: (error: any) => {
        console.error('Error loading clients:', error);
        this.snackBar.open('Error loading clients', 'Close', { duration: 3000 });
      }
    });
  }

  public sendSMS(mobileNumbers: string[], message: string): void { // Make method public
    if (!mobileNumbers.length) {
      this.snackBar.open('No valid mobile numbers to send SMS to', 'Close', { duration: 3000 });
      return;
    }

    if (!message.trim()) {
      this.snackBar.open('Please enter a message', 'Close', { duration: 3000 });
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

  public getSelectedMobileNumbers(): string[] { // Make method public
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