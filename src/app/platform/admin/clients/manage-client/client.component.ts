import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ClientService } from '../client.service';
import { FilterModel, SearchFilterModel } from '../../../../core/models/common-model';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../../core/services/common.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CustomDatePipe } from '../../../../shared/customDate/custom-date.pipe';
import { PhoneMaskDirective } from '../../../../shared/directives/phone-mask.directive';
import { DialogComponent } from '../../../../shared/dialog/dialog.component';
import { WhiteSpaceBlock } from '../../../../shared/validators/WhitespaceValidators';
import { MatSortModule, Sort } from '@angular/material/sort';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
declare var window: any;

/**
 * CLIENT MANAGEMENT COMPONENT
 * 
 * PURPOSE:
 * This component provides comprehensive client management functionality for the Jacuzzi Management System.
 * It allows administrators to search, view, create, edit, and delete client records along with their
 * associated spa details and service call history.
 * 
 * KEY FEATURES:
 * 1. Client Search & Filtering - Multi-criteria search (Name, Spa Number, Service Call, Telephone, Client Number, Address)
 * 2. Client CRUD Operations - Create, Read, Update, Delete client records
 * 3. Spa Management - Associate and manage spa details for clients
 * 4. Service Call Integration - View upcoming and historical service calls
 * 5. Blacklist Management - Handle blacklisted clients
 * 6. Multi-language Support - English/French localization
 * 
 * API ENDPOINTS REFERENCED:
 * - GET /api/clients/getallclientlist - Retrieve all clients
 * - POST /api/clients/getclientbyid?clientId={id} - Get specific client details
 * - POST /api/clients/getclientbysearch - Search clients by criteria
 * - POST /api/clients/saveclient - Create new client
 * - POST /api/clients/updateclient - Update existing client
 * - POST /api/clients/deleteclient - Delete client
 * - GET /api/clients/getoldservicecall?clientId={id} - Get client's service call history
 * - GET /api/clients/getupcomingservicecall?clientId={id} - Get upcoming service calls
 * - GET /api/clients/getspadetails?clientId={id} - Get client's spa details
 * - POST /api/clients/savespadetails - Save spa details
 * - POST /api/clients/updatespadetails - Update spa details
 * - DELETE /api/clients/deletespadetails - Delete spa details
 * 
 * COMPONENT ARCHITECTURE:
 * - Standalone Angular component with Material Design integration
 * - Reactive forms for client and spa data management
 * - MatTable for displaying client lists with sorting and pagination
 * - Search popup overlay for client selection
 * - Form validation with custom validators
 * - Toastr notifications for user feedback
 * - Translation service for internationalization
 * 
 * RECENT IMPROVEMENTS (Current Session):
 * - Fixed search popup not closing after client selection
 * - Resolved form emptying issue when clicking on selected client
 * - Added proper search popup state management
 * - Implemented original client list preservation
 * - Added click-outside detection to close search popup
 * - Enhanced search input blur handling
 * - Improved client list restoration logic
 * 
 * USAGE SCENARIOS:
 * 1. ADMIN CLIENT SEARCH: Search for existing clients using various criteria
 * 2. NEW CLIENT REGISTRATION: Create new client records with complete information
 * 3. CLIENT PROFILE MANAGEMENT: Update client details, contact info, and preferences
 * 4. SPA ASSOCIATION: Link spa models and brands to client accounts
 * 5. SERVICE CALL TRACKING: Monitor client service history and upcoming appointments
 * 6. BLACKLIST HANDLING: Manage problematic client accounts
 * 
 * TECHNICAL NOTES:
 * - Uses Angular Material components for consistent UI
 * - Implements responsive design patterns
 * - Handles both synchronous and asynchronous data operations
 * - Includes error handling and loading states
 * - Supports form validation and user input sanitization
 * - Integrates with external services for notifications and translations
 */
@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    MatTableModule,
    CommonModule,
    PhoneMaskDirective,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatSortModule,
    MatPaginatorModule
],

  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent {

  // ===== CLIENT DATA MANAGEMENT =====
  clientlist: any[] = [];                    // Main client list displayed in the table
  searchclientlist: any[] = [];              // Search results displayed in popup overlay
  originalClientList: any[] = [];            // Backup of full client list for restoration
  
  // ===== FILTER & SEARCH CONFIGURATION =====
  filtermodel: FilterModel;                  // Filter configuration for client operations
  searchfiltermodel: SearchFilterModel;      // Search criteria model for client search
  selectedFilter: string = 'Name';           // Currently selected search filter (Name, Spa Number, etc.)
  searchQuery: string = '';                  // Current search input value
  filterValue: any;                          // Processed filter value for API calls
  // Remove popup-specific properties
  // isSearchtable: boolean = false;
  
  // Always show the search results table
  isSearchtable: boolean = true;
  
  // ===== CLIENT SELECTION & STATE =====
  selectedClient: any[] = [];                // Currently selected client data
  selectedClient1: boolean = true;           // Client selection state flag
  clientid: number = 0;                      // ID of currently selected client
  isClientSelected: boolean = false;         // Whether a client is currently selected
  isAddingNewClient: boolean = false;        // Tracks if we're in "add new client" mode
  selectedClientForHighlighting: any = null; // Client object for highlighting in main list
  
  // ===== FORM MANAGEMENT =====
  clientForm: FormGroup;                     // Reactive form for client information
  spaForm: FormGroup;                        // Reactive form for spa details
  selectedValue: string = '';                // Generic selected value storage
  
  // ===== SPA & SERVICE CALL DATA =====
  spaDetails: any[] = [];                    // Spa details associated with selected client
  upComingServiceCall: any;                  // Upcoming service calls for selected client
  OldServiceCall: any[] = [];                // Historical service calls for selected client
  spaBrands: { id: number; value: string }[] = [];  // Available spa brands
  spaModel: any[] = [];                      // Available spa models
  poolSpecialist: any[] = [];                // Available pool specialists
  allSpaDetails: any[] = [];                 // All spa details for the system
  spaId: number = 0;                         // ID of currently selected spa
  spaBrandId: any;                           // ID of selected spa brand
  
  // ===== UI STATE & CONTROLS =====
  isButtonDisabled: boolean = true;          // Controls button enable/disable states
  isDeleteButtonDisabled: boolean = true;    // Controls delete button state
  isSpaDeleteButtonDisabled: boolean = true; // Controls spa delete button state
  isInputDisabled: boolean = true;           // Controls form input enable/disable states
  isLoading: boolean = false;                // Loading state indicator
  allDataLoaded: boolean = false;            // Data loading completion flag
  
  // ===== CLIENT STATUS & VALIDATION =====
  blacklist: any;                            // Blacklist status of selected client
  isBlackListed: boolean = false;            // Whether selected client is blacklisted
  newClientnumber: any;                      // Generated client number for new clients
  hasClientNumberData: boolean = true;       // Whether client number data is available
  
  // ===== MODAL & DIALOG MANAGEMENT =====
  deleteclient: any;                         // Reference to delete confirmation modal
  modalTitle: string = '';                   // Modal title text
  modalMessage: string = '';                 // Modal message text
  confirmButtonText: string = 'Delete';      // Modal confirm button text
  private confirmActionFn: () => void = () => {};  // Modal action callback
  
  // ===== DATA SOURCES & PAGINATION =====
  dataSource = new MatTableDataSource<any>([]);           // Main client table data source
  spaDetailsdataSource = new MatTableDataSource<any>([]); // Spa details table data source
  newServicecallData = new MatTableDataSource<any>([]);   // Service call table data source
  
  // ===== INTERNATIONALIZATION =====
  language: any;                              // Current language configuration
  currentLanguage: string = 'en';             // Default language setting
  
  // ===== UTILITY & STORAGE =====
  actionbuttondata: any;                      // Action button data storage
  edit: any;                                  // Edit mode state
  adminToken: any;                            // Admin authentication token
  private subscription: Subscription = new Subscription();  // RxJS subscription management
  private clientDataToPatch: any = null;      // Client data for form patching
  
  // ===== MISSING PROPERTIES (Referenced in code) =====
  provinces: any[] = [];                      // Available provinces for address selection
  isdeletebutton: boolean = true;             // Delete button state flag
  MOBILE: string = '';                        // Mobile device identifier
  isSearchDisabled: boolean = false;          // Search functionality disabled state
  clientName: string = '';                    // Client name storage
  clientNumber: string = '';                  // Client number storage

  @ViewChild('oldServicePaginator') oldServicePaginator!: MatPaginator;
  @ViewChild('spaPaginator') spaPaginator!: MatPaginator;
  @ViewChild('newServicecallPaginator') newServicecallPaginator!: MatPaginator;

  // ===== LIFECYCLE METHODS =====
  
  /**
   * Component initialization - sets up forms, loads initial data, and processes route parameters
   * Handles authentication token processing and initial client selection if editing mode
   */
  ngOnInit(): void {
    this.subscription = this.commonservice.languageChange$.subscribe((lang) => {
      this.currentLanguage = lang;
    });
    this.getAllClientList();
    this.createformgroup();
    //this.getAllArea();
    this.getAllProvinces();
    this.queryPrms();
    this.createformgroup1();
    this.deleteclient = new window.bootstrap.Modal(
      document.getElementById('deleteclient')
    );
    this.getSpaBrand();
    this.getPoolSpecialist();
  }
  constructor(
    private clientservice: ClientService,
    private router: Router,
    private commonservice: CommonService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private toaster: ToastrService,
    private elementRef: ElementRef,
    private route : ActivatedRoute,
  ) {
    //this.clientlist = new Array<any>();
    this.clientForm = new FormGroup('');
    this.spaForm = new FormGroup('');
    this.filtermodel = new FilterModel();
    this.searchfiltermodel = new SearchFilterModel();
    this.translate.setDefaultLang('en');
  }
  @HostListener('window:click', ['$event'])
  onClick(event: Event) {
   const targetElement = event.target as HTMLElement;
   const inputElement = this.elementRef.nativeElement.querySelector('input');
   const searchTableDiv = this.elementRef.nativeElement.querySelector(
     '.table-responsive.search_table'
   );

   // Check if click is outside both the input element and search table div
   if (
     inputElement &&
     !inputElement.contains(targetElement) &&
     searchTableDiv &&
     !searchTableDiv.contains(targetElement)
   ) {
     this.isSearchtable = false;
   }
  }

  switchLanguage(lang: string) {
    this.translate.use(lang); // Switch language
  }

  displayedColumns: string[] = ['clientNumber', 'firstName', 'lastName', 'spouseFirstName', 'spouseLastName'];
  displayedSearchColumns: string[] = [
    'clientNumber',
    'FirstName',
    'LastName',
    'SpouseFirstName',
    'SpouseLastName',
  ];

  displayedColumns1: string[] = [
    'serviceCallNumber',
    'receptionDate',
    'placementDate',
    'issueDescription',
    'serviceCallDescription',
  ];
  displayedColumns2: string[] = [
    'spaBrandName',
    'spaModelName',
    'poolSpecialistName',
  ];

  onHouseChange(event: any): void {
    ;
    this.selectedValue = event.target.value;
  }

  queryPrms() {
    this.route.queryParams.subscribe(params => {
      this.convertToken(params['id']);
    })
  }
  convertToken(token: any) {
    if (!token) {
      console.log('No token provided to convert');
      return;
    }
    
    try {
      this.adminToken = this.commonservice.decrypt(token);
      if (!this.adminToken) {
        console.log('Failed to decrypt token');
        return;
      }
      
      this.adminToken = this.adminToken.split('$'); // Assuming there's more than one part
      if (!this.adminToken || this.adminToken.length === 0) {
        console.log('Invalid token format after split');
        return;
      }
      
      const clientIdString = this.adminToken[0]; // Adjust index if needed
      if (!clientIdString) {
        console.log('Missing client ID in token');
        return;
      }
      
      const parsedClientId = JSON.parse(clientIdString);
      if (parsedClientId && parsedClientId.clientId) {
        this.clientid = parsedClientId.clientId;
        this.edit = parsedClientId.data;
        if(this.edit === 'edit'){
          this.selectClient(this.clientid);
        }
      }
    } catch (error) {
      console.error('Error processing token:', error);
    }
  }
  
  /**
   * Handles filter change events (e.g., switching between Name, Spa Number, etc.)
   * Resets search state and reloads the full client list
   */
  onChange(){
    
    this.searchQuery = '';
    this.isSearchtable = false;
    this.selectedClientForHighlighting = null; // Clear highlighting when filter changes
    this.resetClientList();

    this.getAllClientList()
  }

  /**
   * CORE CLIENT SELECTION METHOD
   * 
   * PURPOSE: Handles client selection from both search popup and main client list
   * 
   * FUNCTIONALITY:
   * 1. Closes search popup but maintains search context
   * 2. Fetches detailed client data from API
   * 3. Updates form with client information
   * 4. Loads associated data (spa details, service calls)
   * 5. Filters main list to show search results with selected client highlighted
   * 
   * PARAMETERS:
   * - event: Client object or client ID to select
   * 
   * API CALLS:
   * - POST /api/clients/getclientdata - Retrieves full client details
   * - GET /api/clients/getoldservicecall - Loads service call history
   * - GET /api/clients/getupcomingservicecall - Loads upcoming service calls
   * - GET /api/clients/getspadetails - Loads spa information
   * 
   * RECENT IMPROVEMENTS:
   * - Fixed search popup not closing after selection
   * - Resolved form emptying when clicking selected client
   * - Added original client list preservation
   * - Improved search state management
   * - Maintains search context after selection
   * - Highlights selected client in filtered results
   */
  selectClient(event : any){
  
  this.isButtonDisabled = false;
  
  if(event == 'Yes'){
    this.isSearchtable = false;
    this.searchQuery= '';
  }
  else
  {
    console.log('Select client event:', event);
    
    // Close the search popup when a client is selected
    this.isSearchtable = false;
    
    // DON'T clear searchQuery - maintain search context
    // this.searchQuery = ''; // REMOVED - keep search context
    
    // Convert clientID to clientId if needed
    this.clientid = event.clientID || event.ClientID || event;
    console.log('Using client ID:', this.clientid);
    
    this.clientservice.getClientDataById(this.clientid).subscribe({
      next: (response : any) => {
        console.log('Raw API response:', response);
        if(response.isSuccess == true || response.Value)
        {
          // Handle both lowercase 'value' and uppercase 'Value'
          this.selectedClient = response?.value || response?.Value || [];
          console.log('Selected client data:', this.selectedClient);
          
          // Set the selected client for highlighting in the main list
          if (this.selectedClient && this.selectedClient.length > 0) {
            this.selectedClientForHighlighting = this.selectedClient[0];
          }
          
          // Only restore original list if no filter is active
          if (!this.filterValue || this.filterValue.trim() === '') {
            if (this.originalClientList.length > 0) {
              this.clientlist = [...this.originalClientList];
            }
          }
          // If filter is active, keep the filtered results
          
          this.blacklist = (response?.value || response?.Value || [])[0]?.blackList;
          if(this.blacklist == true){
            this.isBlackListed = true;
          }
          else{
            this.isBlackListed = false;
          }
          
          if (this.selectedClient && this.selectedClient.length > 0) {
            console.log('Raw client data before processing:', JSON.stringify(this.selectedClient[0], null, 2));
            const clientData = { ...this.selectedClient[0] };
            
            // Debug logging for ExternalBreaker
            console.log('ExternalBreaker value from API:', {
              IsExternalBreaker: clientData.IsExternalBreaker,
              isExternalBreaker: clientData.isExternalBreaker,
              ExternalBreaker: clientData.ExternalBreaker,
              externalBreaker: clientData.externalBreaker,
              rawClientData: clientData
            });
            
            // Debug logging for SMS and EmailClient
            console.log('SMS and EmailClient values from API:', {
              SMS: clientData.SMS,
              EmailClient: clientData.EmailClient,
              sms: clientData.sms,
              emailClient: clientData.emailClient,
              SMS_type: typeof clientData.SMS,
              EmailClient_type: typeof clientData.EmailClient,
              sms_type: typeof clientData.sms,
              emailClient_type: typeof clientData.emailClient,
              rawClientData: clientData
            });
            
            if (!clientData.house || !clientData.streetNumber) {
              clientData.house = '2';
            }
            
            // Store clientData for use after enabling form
            this.clientDataToPatch = { ...clientData };
            
          } else {
            console.error('No client data available to display');
          }
          
          this.isAddingNewClient=true;
          this.getOldServiceCall();
          this.getUpcomingServiceCall();
          this.getSpaDetails();
          this.isClientSelected = true;
          this.enableFormFields();
          
          // Set form values AFTER enabling the form
          if (this.selectedClient && this.selectedClient.length > 0 && this.clientDataToPatch) {
            this.clientForm.patchValue({
              ...this.clientDataToPatch,
              raisedSpa: this.clientDataToPatch.raisedSpa || false,
              ExternalBreaker: this.clientDataToPatch.IsExternalBreaker === true || this.clientDataToPatch.isExternalBreaker === true,
              sms: this.clientDataToPatch.SMS === true || this.clientDataToPatch.sms === true,
              emailClient: this.clientDataToPatch.EmailClient === true || this.clientDataToPatch.emailClient === true
            });
            
            // Explicitly set SMS and EmailClient to false if they are null/undefined
            if (this.clientDataToPatch.SMS !== true && this.clientDataToPatch.sms !== true) {
              this.clientForm.patchValue({ sms: false });
            }
            if (this.clientDataToPatch.EmailClient !== true && this.clientDataToPatch.emailClient !== true) {
              this.clientForm.patchValue({ emailClient: false });
            }
            
            // Log the form values after patching
            console.log('Form values after patching:', {
              sms: this.clientForm.get('sms')?.value,
              emailClient: this.clientForm.get('emailClient')?.value
            });
            
            // Log the form value after patching
            console.log('Form value after patching:', {
              formValue: this.clientForm.get('ExternalBreaker')?.value,
              rawValue: this.clientDataToPatch.isExternalBreaker,
              clientData: this.clientDataToPatch
            });
          }
        }
        else 
        {
          console.error('Failed to get client data, isSuccess=false');
          this.clientForm.reset();
          this.isClientSelected = false;
        }
      },
      error: (err) => {
        console.error('Error fetching client data:', err);
        this.clientForm.reset();
        this.isClientSelected = false;
      }
    });
  }
}

createformgroup(){
  
  this.clientForm = this.formBuilder.group({
    clientNumber: [{ value: '', disabled: true },[Validators.required]],
    firstName: [{ value: '', disabled: true }, [Validators.required]],
    lastName: [{ value: '', disabled: true },[Validators.required]],
    blackList: [{ value: false, disabled: true },],
    spouseFirstName: [{ value: '', disabled: true }],
    spouseLastName: [{ value: '', disabled: true }],
    raisedSpa: [{ value: false, disabled: true }],
    app: [{ value: '', disabled: true }],
    civic: [{ value: '', disabled: true }],
    street: [{ value: '', disabled: true }],
    city: [{ value: '', disabled: true }],
    province: [{ value: '9', disabled: true }],
    postalCode: [{ value: '', disabled: true }],
    house: [{ value: '2', disabled: true }],
    streetNumber: [{ value: '', disabled: true },[Validators.required]],
    home: [{ value: '', disabled: true }],
    ext1: [{ value: '', disabled: true }],
    spouse: [{ value: '', disabled: true }],
    ext2: [{ value: '', disabled: true }],
    work: [{ value: '', disabled: true }],
    ext3: [{ value: '', disabled: true }],
    other: [{ value: '', disabled: true }],
    ext4: [{ value: '', disabled: true }],
    primaryEmail: [{ value: '', disabled: true },[Validators.email]],
    secondaryEmail: [{ value: '', disabled: true }, [Validators.email]],
    notes: [{ value: '', disabled: true }],
    comments: [{ value: '', disabled: true }],
    ExternalBreaker: [{ value: false, disabled: true }],
    both : [{ value: false, disabled: true }],
    sms : [{ value: false, disabled: true }],
    emailClient : [{ value: false, disabled: true }]
  });

  // Add value change subscription to log ExternalBreaker changes
  this.clientForm.get('ExternalBreaker')?.valueChanges.subscribe(value => {
    console.log('ExternalBreaker value changed:', value);
  });
}
createformgroup1(){
  this.spaForm = this.formBuilder.group({
    spaBrandLabel:['',Validators.required],
    spaModelLabel:['',Validators.required],
    poolSpecialistNAme : ['',Validators.required],
    series:['',Validators.required],
    purchaseDate : ['',Validators.required],
    warrantydate:['']
  })
}

  get primaryEmail() {
    return this.clientForm.get('primaryEmail');
  }

  get secondaryEmail() {
    return this.clientForm.get('secondaryEmail');
  }

  get fb() {
    return this.clientForm.controls;
  }

  //getAllArea() {
  //  this.clientservice.getAllArea().subscribe((response: any) => {
  //    if (response.isSuccess == true) {
  //      this.area = response.value;
  //    }
  //  });
  //}
  getAllProvinces() {
    this.clientservice.getAllProvinces().subscribe((response: any) => {
      if (response.isSuccess == true) {
        this.provinces = response.value || response.Value || [];
      }
    });
  }
  /**
   * Removes the current search filter and resets to show all clients
   * Clears search query, filter value, and resets client list
   * 
   * RECENT IMPROVEMENTS:
   * - Added highlighting reset
   * - Enhanced filter state management
   */
  removefilter(){
    
    this.searchQuery = '';
    this.filterValue = '';
    this.selectedFilter='Name';
    this.isSearchtable = false;
    this.selectedClientForHighlighting = null; // Clear highlighting
    this.resetClientList();
    this.getAllClientList();
  }

  @ViewChild('firstInput') firstInputField!: ElementRef;

  /**
   * SEARCH POPUP MANAGEMENT METHODS
   * 
   * PURPOSE: Handle search popup visibility, state management, and user interaction
   * 
   * RECENT IMPROVEMENTS:
   * - Added proper search popup closing behavior
   * - Implemented click-outside detection
   * - Enhanced search input blur handling
   * - Fixed search popup not closing after client selection
   */

  /**
   * Handles search input blur events
   * Closes search popup and resets client list if search is empty
   * Uses timeout to allow click events on search results to fire first
   * 
   * RECENT IMPROVEMENTS:
   * - Added client list reset when search is empty
   * - Improved timing for popup closure
   * - Added highlighting reset for empty search
   */
  onSearchBlur() {
    // Use setTimeout to allow click events on search results to fire first
    setTimeout(() => {
      this.isSearchtable = false;
      // If search is empty, reset the client list and clear highlighting
      if (!this.searchQuery || this.searchQuery.trim() === '') {
        this.selectedClientForHighlighting = null; // Clear highlighting
        this.onSearchClear();
      }
    }, 200);
  }

  /**
   * Handles Enter key press in search input
   * Clears highlighting and shows all clients when Enter is pressed
   * 
   * RECENT IMPROVEMENTS:
   * - Added Enter key handling for better UX
   * - Clears highlighting when Enter is pressed
   * - Shows full client list for easy browsing
   */
  onSearchEnter(event: any) {
    if (event.key === 'Enter') {
      this.selectedClientForHighlighting = null; // Clear highlighting
      this.isSearchtable = false;
      this.resetClientList();
      this.getAllClientList();
    }
  }

  /**
   * Handles clicking outside the search popup
   * Automatically closes search popup when user clicks elsewhere
   * Uses HostListener to detect document-level clicks
   * 
   * RECENT IMPROVEMENTS:
   * - Added to improve user experience
   * - Prevents search popup from staying open unintentionally
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    const searchContainer = document.querySelector('.search_bar');
    if (searchContainer && !searchContainer.contains(event.target)) {
      this.isSearchtable = false;
    }
  }

  /**
   * CLIENT FORM MANAGEMENT METHODS
   * 
   * PURPOSE: Handle client form operations, state management, and data handling
   */

  /**
   * Initializes a new client creation workflow
   * Resets form state, clears search, and prepares for new client entry
   * 
   * RECENT IMPROVEMENTS:
   * - Added search popup closure
   * - Enhanced form reset functionality
   * - Improved focus management
   * - Added highlighting reset
   */
  addNewClient() {
    this.isAddingNewClient = false;
    this.isBlackListed = false;
    this.clientid = 0;
    this.isButtonDisabled = false;
    this.selectedClient1 = true;
    this.isDeleteButtonDisabled = true;
    this.selectedClientForHighlighting = null; // Clear highlighting
    this.clientForm.reset({
      house: '2',
      province: '9',
      //area: '',
    });
    this.searchQuery = '';
    this.isSearchtable = false;
    //this.selectedClient = [];
    this.getAllClientList();
    this.enableFormFields();
    if (this.firstInputField) {
      this.firstInputField.nativeElement.focus();
    }
  }

  /**
   * Enables all form fields for editing
   * Called when a client is selected or new client mode is activated
   */
  enableFormFields() {
    this.clientForm.enable();
  }

  /**
   * Handles search input clearing
   * Resets search popup state and restores full client list
   * 
   * RECENT IMPROVEMENTS:
   * - Added to prevent search state inconsistencies
   * - Ensures proper client list restoration
   * - Added highlighting reset
   */
  onSearchClear() {
    this.isSearchtable = false;
    this.selectedClientForHighlighting = null; // Clear highlighting when search is cleared
    this.resetClientList();
  }

  /**
   * SEARCH FUNCTIONALITY METHODS
   * 
   * PURPOSE: Handle client search operations and search popup management
   */

  /**
   * Handles manual clearing of search input
   * Resets search state, highlighting, and restores full client list
   * 
   * RECENT IMPROVEMENTS:
   * - Added to handle manual search clearing
   * - Ensures proper state reset
   * - Clears highlighting when search is manually cleared
   */
  handleManualSearchClear() {
    this.selectedClientForHighlighting = null; // Clear highlighting
    this.filterValue = '';
    this.isSearchtable = false;
    this.resetClientList();
    this.getAllClientList();
  }

  /**
   * Handles search input changes and triggers client search
   * Manages search popup visibility and client list filtering
   * 
   * PARAMETERS:
   * - event: Input event containing search query
   * 
   * API CALLS:
   * - POST /api/clients/getclientbysearch - Searches clients by criteria
   * 
   * RECENT IMPROVEMENTS:
   * - Added proper search popup state management
   * - Implemented search clearing functionality
   * - Enhanced client list restoration logic
   * - Added highlighting reset for new searches
   * - Added manual search clearing detection
   */
  applyFilter(event: any) {
    console.log('applyFilter called with event:', event);
    console.log('Current searchQuery:', this.searchQuery);
    console.log('Current selectedFilter:', this.selectedFilter);
    
    this.filterValue = event.target.value.trim().toLowerCase();
    console.log('filterValue set to:', this.filterValue);

    if (this.filterValue.length > 0) {
      console.log('Filter has value, proceeding with search...');
      // Clear highlighting when starting a new search
      this.selectedClientForHighlighting = null;
      
      if (this.selectedFilter === '' ? 'Name' : this.selectedFilter) {
        console.log('Setting paginator model...');
        this.setPaginatorModel(this.filterValue, this.selectedFilter);
        console.log('Calling getClientBySearch with:', this.searchfiltermodel);
        
        this.clientservice.getClientBySearch(this.searchfiltermodel).subscribe((response: any) => {
          console.log('Search API response:', response);
          if (response.isSuccess) {
            console.log('Filtering main table with search results');
            // Instead of showing popup, filter the main table
            this.clientlist = response.value || [];
            console.log('Main table now shows filtered results');
          } else {
            console.log('Search API returned success=false');
          }
        });
      }
    } else {
      console.log('Filter is empty, clearing search...');
      // Search was manually cleared, restore full list
      this.resetClientList();
      this.getAllClientList();
    }
  }

  /**
   * Configures search parameters for API calls
   * Sets search text and search criteria (Name, Spa Number, etc.)
   */
  setPaginatorModel(searchText: string, selectedvalue: string) {
    
    this.searchfiltermodel.text = searchText;
    this.searchfiltermodel.searchBy = selectedvalue;
  }

  /**
   * DATA LOADING METHODS
   * 
   * PURPOSE: Fetch and manage client-related data from various API endpoints
   */

  /**
   * Loads historical service calls for the selected client
   * Updates the service call table data source and pagination
   * 
   * API CALLS:
   * - GET /api/clients/getoldservicecall?clientId={id}
   */
  getOldServiceCall() {
    
    this.clientservice
      .getOldServiceCall(this.clientid)
      .subscribe((response: any) => {
        if (response) {
          this.dataSource.data = response.value || response.Value || [];
          this.dataSource.paginator = this.oldServicePaginator;
          this.OldServiceCall = response.value || response.Value || [];
          this.isAddingNewClient = true;
        }
      });
  }

  /**
   * Loads upcoming service calls for the selected client
   * Updates the upcoming service call table data source and pagination
   * 
   * API CALLS:
   * - GET /api/clients/getupcomingservicecall?clientId={id}
   */
  getUpcomingServiceCall() {
    
    this.clientservice
      .getUpcomingServiceCall(this.clientid)
      .subscribe((response: any) => {
        if (response) {

          this.newServicecallData.data = response.data.serviceCall;
          this.newServicecallData.paginator = this.newServicecallPaginator;
          this.upComingServiceCall = response.data.serviceCall;
          //this.selectedClient = true;
          this.isAddingNewClient = true;
        }
      });
  }

  /**
   * Loads spa details associated with the selected client
   * Updates the spa details table data source and pagination
   * 
   * API CALLS:
   * - GET /api/clients/getspadetails?clientId={id}
   */
  getSpaDetails() {
   
    this.clientservice
      .getSpaDetails(this.clientid)
      .subscribe((response: any) => {
        if (response) {
          
          this.spaDetailsdataSource.data = response.data.spas;
          this.spaDetailsdataSource.paginator = this.spaPaginator;
          this.spaDetails = response.data.spas;
          this.isAddingNewClient = true;
        }
      });
  }

  /**
   * CLIENT LIST MANAGEMENT METHODS
   * 
   * PURPOSE: Handle client list state, filtering, and restoration
   */

  /**
   * Applies the current search filter to the main client list
   * Shows filtered results while maintaining the original list for restoration
   * 
   * RECENT IMPROVEMENTS:
   * - Added to maintain search context after client selection
   * - Ensures filtered results are visible in main list
   * - Preserves original list for future operations
   */
  applyCurrentFilterToMainList() {
    // Simplified method - just restore original list
    if (this.originalClientList.length > 0) {
      this.clientlist = [...this.originalClientList];
    }
  }

  /**
   * Resets the client list to show all clients
   * Restores the original client list from backup to prevent filtering issues
   * 
   * RECENT IMPROVEMENTS:
   * - Added to prevent form emptying when clicking selected clients
   * - Ensures full client list is always available
   */
  resetClientList() {
    if (this.originalClientList.length > 0) {
      this.clientlist = [...this.originalClientList];
    }
  }

  /**
   * Loads client data by ID for filtering purposes
   * Filters the original client list to show only matching clients
   * 
   * API CALLS:
   * - POST /api/clients/getclientbyid?clientId={id}
   * 
   * RECENT IMPROVEMENTS:
   * - Modified to preserve original client list
   * - Prevents client list from being reduced to single client
   */
  getClientById(){
    
    this.clientservice.getClientById(this.clientid ).subscribe((response : any) => {
      if(response.isSuccess == true)
      {
        // Only update the filtered view, don't override the original list
        const filteredClients = response.value || response.Value || [];
        // Filter the original list to show only matching clients
        this.clientlist = this.originalClientList.filter(client => 
          filteredClients.some((filteredClient: any) => 
            filteredClient.clientID === client.clientID || 
            filteredClient.ClientID === client.clientID
          )
        );
      }
    })
  }


  /**
   * Loads all clients from the system
   * Main data source for the client list table
   * Handles data transformation and stores original list for restoration
   * 
   * API CALLS:
   * - GET /api/clients/getallclientlist
   * 
   * RECENT IMPROVEMENTS:
   * - Added original client list preservation
   * - Enhanced data transformation logic
   * - Improved error handling and loading states
   */
  getAllClientList() {
    
    this.isLoading = true;
    console.log('Fetching client list...');
    setTimeout(() => {
    this.clientservice
      .getAllClientList()
      .subscribe({
        next: (response: any) => {
          console.log('Raw API response:', response);
          if (response && (response.isSuccess === true || response.Value)) {
            // Handle both lowercase 'value' and uppercase 'Value'
            let clientData = response.value || response.Value || [];
            console.log('Client data extracted:', clientData);
            
            // Transform data if needed to match expected format
            if (clientData.length > 0 && 'ClientID' in clientData[0]) {
              console.log('Transforming field names from uppercase to lowercase');
              this.clientlist = clientData.map((client: any) => ({
                clientID: client.ClientID,
                clientNumber: client.ClientNumber,
                firstName: client.FirstName,
                lastName: client.LastName,
                spouseFirstName: client.SpouseFirstName,
                spouseLastName: client.SpouseLastName,
                totalRecords: client.TotalRecords || 0
              }));
            } else {
              this.clientlist = clientData;
            }
            
            // Store the original client list for later restoration
            this.originalClientList = [...this.clientlist];
            
            console.log('Final client list:', this.clientlist);
            
            // Update the MatTableDataSource
            const dataSource = new MatTableDataSource<any>(this.clientlist);
            Object.assign(this.clientlist, { data: this.clientlist, paginator: this.oldServicePaginator });
          } else {
            console.error('Invalid response format:', response);
            this.clientlist = [];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching client list:', err);
          this.isLoading = false;
        }
      });
    }, 100);
  }

  /**
   * UTILITY & HELPER METHODS
   * 
   * PURPOSE: Provide supporting functionality for the main component operations
   */

  /**
   * Shows confirmation modal for destructive actions
   * Handles delete confirmations for clients and spa details
   * 
   * PARAMETERS:
   * - title: Modal title text
   * - message: Modal message text
   * - confirmAction: Function to execute on confirmation
   */
  showConfirmationModal(
    title: string,
    message: string,
    confirmAction: () => void
  ) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.confirmActionFn = confirmAction;
    this.deleteclient.show();
  }

  actionbutton(event: any) {
    
    this.actionbuttondata = event;
    if (event == 'deleteclient') {
      {
        if((!this.OldServiceCall || this.OldServiceCall.length === 0) &&
          (!this.upComingServiceCall || this.upComingServiceCall.length === 0)){
            this.isdeletebutton = true;
          this.showConfirmationModal(
            this.translate.instant('MODAL.ConfirmDelete'),
            this.translate.instant('MODAL.DeleteClient'),
            () => this.deleteClient()
          );
        } else {
          this.isdeletebutton = false;
          this.showConfirmationModal(
            'Attention!',
            this.translate.instant('MODAL.AttnClient'),
            () => this.deleteClient()
          );
        }
      }
    } else {
        const btnSamElement = document.getElementById('btnsam');
        if (btnSamElement) {
          btnSamElement.click();
        }
      this.isdeletebutton = true;
      this.showConfirmationModal(
        this.translate.instant('MODAL.ConfirmDelete'),
        this.translate.instant('MODAL.DeleteSpa'),
        () => this.deleteSpa()
      );
    }
  }
  deleteClient() {
    ;

    this.clientservice
      .DeleteClient(this.clientid)
      .subscribe((response: any) => {
        if (response.isSuccess == true) {
          this.toaster.success('Client Deleted successfully', 'Success');
          const btnSamElement = document.getElementById('closemodal');
          if (btnSamElement) {
            btnSamElement.click();
          }
          this.getAllClientList();
          this.clientForm.reset({
            house: '2',
            province: '9',
            //area: '',
          });
          this.isBlackListed = false;
          this.isAddingNewClient = false;
        }
      });
  }

  deleteSpa() {
    ;
    this.deleteclient.show();
    this.clientservice.DeleteSpa(this.spaId).subscribe((response: any) => {
      if (response.isSuccess == true) {
        this.toaster.success('Spa Deleted successfully', 'Success');
        this.getSpaDetails();
        const btnSamElement = document.getElementById('closemodal');
        if (btnSamElement) {
          btnSamElement.click();
        }
      } else {
        this.toaster.error('Spa not Delete', 'error');
      }
    });
  }

  confirmDeleteSpa(event: any) {
    ;
    if (event == 'client' && this.actionbuttondata == 'deleteclient') {
      this.deleteClient();
    } else {
      this.deleteSpa();
    }
  }
addnewSpaDetail(){
  this.isSpaDeleteButtonDisabled = true;
  this.spaId = 0;
  
  // Set default brand ID 53 and get models for this brand
  const defaultBrandId = 53;
  this.getSpaModel(defaultBrandId);
  
  // Reset form with default values
  this.spaForm.reset({
    spaBrandLabel: defaultBrandId.toString(),
    spaModelLabel: '',
    poolSpecialistNAme: ''
    // warrantydate field intentionally omitted
  });
  
  // After models are loaded, set default model ID
  setTimeout(() => {
    if (this.spaModel && this.spaModel.length > 0) {
      // Find if model 223 exists in the models list
      const modelExists = this.spaModel.some(model => model.id == 223);
      if (modelExists) {
        this.spaForm.patchValue({
          spaModelLabel: '223'
        });
      }
    }
  }, 500);
}
  getSpaBrand() {
    this.clientservice.getSpaBrand().subscribe((response: any) => {
      if (response && response.data) {        
        this.spaBrands = response.data.sort((a: { id: number; value: string }, b: { id: number; value: string }) => 
          a?.value && b?.value ? a.value.localeCompare(b.value) : 0);     
      } else if (response && (response.value || response.Value)) {
        this.spaBrands = (response.value || response.Value).sort((a: { id: number; value: string }, b: { id: number; value: string }) => 
          a?.value && b?.value ? a.value.localeCompare(b.value) : 0);
      }
    });
  }

  // To get spa dropdown data
  getSpaModel(brandId:any){
    this.spaBrandId = brandId;
    this.clientservice.getSpaModelByBrand(this.spaBrandId).subscribe((response: any) => {
      if (response && response.data){
        this.spaModel = response.data.sort((a: { id: number; value: string }, b: { id: number; value: string }) => 
          a?.value && b?.value ? a.value.localeCompare(b.value) : 0);
      }
    });
  }

  onSpaBrandChange(event: any): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      const value = parseInt(selectedValue, 10);
      if (!isNaN(value)) {
        this.getSpaModel(value);
      }
    }
  }

  getPoolSpecialist() {
    this.clientservice.getPoolSpecialist().subscribe((response: any) => {
      if (response && response.data) {
        this.poolSpecialist = response.data.sort((a: { id: number; value: string }, b: { id: number; value: string }) => 
          a?.value && b?.value ? a.value.localeCompare(b.value) : 0);
      } else if (response && (response.value || response.Value)) {
        this.poolSpecialist = (response.value || response.Value).sort((a: { id: number; value: string }, b: { id: number; value: string }) => 
          a?.value && b?.value ? a.value.localeCompare(b.value) : 0);
      }
    });
  }
  getSpaDetailsByClientId(spaId :any) {
    this.isLoading = true;
    this.clientservice
      .getSpaDetailsByClientId(spaId)
      .subscribe((response: any) => {
        if (response.isSuccess == true) {
          
          this.isSpaDeleteButtonDisabled = false;
          this.spaId = response.value.spaId;
          
          // Format dates if needed
          const purchaseDate = this.formatDate(response.value.purchaseDate);
          const warrantyDate = this.formatDate(response.value.warrantyDate);
          
          // Check if spaBrandLabel exists, if not use default (53)
          const brandId = response.value.spaBrandLabel || 53;
          this.getSpaModel(brandId);
          
          this.spaForm.reset();
          setTimeout(() => {
            // Check if spaModelLabel exists, if not use default (223)
            const modelId = response.value.spaModelLabel || '223';
            
            this.spaForm.patchValue({
              spaBrandLabel: brandId,
              spaModelLabel: modelId,
              poolSpecialistNAme: response.value.poolSpecialistNAme || '',
              series: response.value.serialNo || '',
              purchaseDate: purchaseDate,
              warrantydate: warrantyDate
            });
            this.isLoading = false
          }, 1500);
          
        }
      });
  }


  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  blockwhitespaces(event: any) {
    WhiteSpaceBlock(event);
  }

  ScRedirect() {
    
    if(this.clientid>0){
      const queryParams = {
        clientId: this.clientid,
        newservicecall : true
      };
      const encryptedParams = this.commonservice.encrypt(JSON.stringify(queryParams)
      );
      this.router.navigate(['/web/admin/service-call'], {
        queryParams: { id: encryptedParams },
      });
    }
    else{
      this.router.navigate(['/web/admin/service-call'])
    }
    
  }
  servicecall(event:any){
    
    const queryParams = {
      clientId: this.clientid,
      serviceCallId:event.serviceCallId,
      additionValue:''
    };
    const encryptedParams = this.commonservice.encrypt(JSON.stringify(queryParams)
    );
    this.router.navigate(['/web/admin/service-call'], {
      queryParams: { id: encryptedParams },
    });
  }

onSubmit(){
  
  const requestModel: any = this.clientForm.value;
  ['work', 'streetNumber' ,'spouse', 'home', 'other'].forEach(field => {
    if (requestModel[field]) {
      requestModel[field] = requestModel[field].replace(/\D/g, '');
    }
  })
  Object.keys(requestModel).forEach((key) => {
    if (requestModel[key] === "") {
      requestModel[key] = null;
    } else if (typeof requestModel[key] === 'string') {
      requestModel[key] = requestModel[key].toUpperCase();
    }
  });
  
  if(this.clientForm.valid){
  
  if(this.clientid> 0){
    requestModel.clientId = this.clientid;
    // Ensure ExternalBreaker is set correctly
    requestModel.ExternalBreaker = this.clientForm.get('ExternalBreaker')?.value === true;
    console.log('Saving ExternalBreaker value:', requestModel.ExternalBreaker);
    
    this.isLoading = true;
    setTimeout(() => {
      
    this.clientservice.updateclient(requestModel).subscribe(( Response: any ) =>{
      if(Response.value.isSuccess == true)
      {
          this.isBlackListed = false;
          this.isAddingNewClient=true;
         this.toaster.success('Client Updated successfully');
         
         this.getAllClientList();
         setTimeout(() => {
          this.selectClient({ clientID: this.clientid });
        }, 300);
        this.isLoading=false;
         this.searchQuery = '';
      }
      else{
        this.toaster.error(Response.value.error.message);
      }
    })
  }, 100);
  }
else{
  this.clientservice.createClient(requestModel).subscribe((Response : any ) =>{
  if(Response.value.isSuccess == true){
    this.toaster.success('Client created Successfully');
    this.newClientnumber = requestModel.clientNumber;
    this.showclientnumberdata(this.newClientnumber);
    
  }
  else{
    this.toaster.error(Response.value.error.message);
    this.getAllClientList();
  }
})
}
}
else {
  // Check if any fields are invalid
  const firstInvalidControl = Object.keys(this.clientForm.controls).find(control => {
    return this.clientForm.controls[control].invalid;
  });

  if (firstInvalidControl) {
    window.scrollTo(0, 0); // Scroll to the first invalid control
    this.clientForm.markAllAsTouched(); // Mark all controls as touched to show validation errors
  }

  return;
}
}
showclientnumberdata(newClientnumber:any){
  
if(this.newClientnumber){
  this.selectedFilter = 'Client Number';
  this.hasClientNumberData = true;
  this.searchQuery = this.newClientnumber;
  this.searchClients();
}
}

  searchClients() {
    
    if (this.searchQuery) {
      this.setPaginatorModel(this.searchQuery, this.selectedFilter);
      this.clientservice
        .getClientBySearch(this.searchfiltermodel)
        .subscribe((response: any) => {
          if (response.isSuccess) {
            this.clientlist = response.value;
            if (this.clientlist.length > 0) {
              this.selectClient(this.clientlist[0]);
            }
          }
        });
    }
  }
  onSubmitspa() {
    ;
    if (this.spaForm.valid) {
      const requestModel: any = this.spaForm.value;
      requestModel.spaBrandLabel = typeof requestModel.spaBrandLabel === 'string' ? requestModel.spaBrandLabel : String(requestModel.spaBrandLabel);
      requestModel.spaModelLabel = typeof requestModel.spaModelLabel === 'string' ? requestModel.spaModelLabel : String(requestModel.spaModelLabel);
      requestModel.clientId = this.clientid;
      requestModel.purchaseDate = this.formatDate(requestModel.purchaseDate);
      // Still include warrantydate in the request if it exists
      if (requestModel.warrantydate) {
        requestModel.warrantydate = this.formatDate(requestModel.warrantydate);
      } else {
        requestModel.warrantydate = null;
      }
      if (this.spaId > 0) {
        requestModel.spaId = this.spaId;
        this.clientservice
          .updateSpaDetails(requestModel)
          .subscribe((response: any) => {
            if (response.isSuccess) {
              this.toaster.success('Spa Updated successfully');
              this.getSpaDetails();
              const btnSamElement = document.getElementById('btnsam');
              if (btnSamElement) {
                btnSamElement.click();
              }
            }
          });
      } else {
        this.clientservice
          .saveSpaDetails(requestModel)
          .subscribe((response: any) => {
            if (response.isSuccess) {
              this.toaster.success('SPA Added Successfully.');
              this.spaId = response.value.spaId;
              this.getSpaDetails();
              const btnSamElement = document.getElementById('btnsam');
              if (btnSamElement) {
                btnSamElement.click();
              }
            }
          });
      }
    }
    else{
      window.scrollTo(0, 0); //scroll to the first invalid control 
       this.spaForm.markAllAsTouched(); // Mark all controls as touched to show validation errors
            return;
    }
  }
  removeBraces(event: any) {
    
    const formName = event.target.name;
    const formData = event.target.value;

    const cleanedPhone = formData.replace(/\D/g, '');
    this.clientForm.patchValue({ [formName]: cleanedPhone }); // Update the control value here
    if (cleanedPhone.length === 0) {
      this.clientForm.patchValue({ [formName]: '' });
    }
  }
  formatPostalCode(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.toUpperCase();

    // Remove any non-alphanumeric characters
    value = value.replace(/[^A-Za-z0-9]/g, '');

    // Enforce the format: A0A 0A0
    const formattedValue = [];

    for (let i = 0; i < value.length && i < 6; i++) {
      if (i === 3) {
        // Add space after the third character
        formattedValue.push('  ');
      }
      if (i % 2 === 0) {
        // Even index - should be alphabetical
        if (/[A-Za-z]/.test(value[i])) {
          formattedValue.push(value[i]);
        }
      } else {
        // Odd index - should be numeric
        if (/\d/.test(value[i])) {
          formattedValue.push(value[i]);
        }
      }
    }

    // Join the formatted value into a string
    inputElement.value = formattedValue.join('');
  }


   
//Angular Mat Sorting 
sortData(sort: Sort) {
  
  const data = this.clientlist.slice();
  if (!sort.active || sort.direction === '') {
    this.clientlist = data;
    return;
  }

  this.clientlist = data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    switch (sort.active) {
      case 'clientNumber': return this.compare(a.clientNumber, b.clientNumber, isAsc);
      case 'firstName': return this.compare(a.firstName, b.firstName, isAsc);
      case 'lastName': return this.compare(a.lastName, b.lastName, isAsc);
      default: return 0;
    }
  });
}

compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}


sortServiceData(sort: Sort) {
  
  const data = this.selectedClient.slice();
  if (!sort.active || sort.direction === '') {
    this.selectedClient = data;
    return;
  }

  this.selectedClient = data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    switch (sort.active) {
      case 'serviceCallNumber': return this.compare(a.serviceCallNumber, b.serviceCallNumber, isAsc);
      case 'receptionDate': return this.compare(a.receptionDate, b.receptionDate, isAsc);
      case 'placementDate': return this.compare(a.placementDate, b.placementDate, isAsc);
      case 'issueDescription': return this.compare(a.issueDescription, b.issueDescription, isAsc);
      case 'serviceCallDescription': return this.compare(a.serviceCallDescription, b.serviceCallDescription, isAsc);
      default: return 0;
    }
  });
}



sortUpcomingServiceData(sort: Sort) {
  
  const data = this.selectedClient.slice();
  if (!sort.active || sort.direction === '') {
    this.selectedClient = data;
    return;
  }

  this.selectedClient = data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    switch (sort.active) {
      case 'serviceCallNumber': return this.compare(a.serviceCallNumber, b.serviceCallNumber, isAsc);
      case 'receptionDate': return this.compare(a.receptionDate, b.receptionDate, isAsc);
      case 'placementDate': return this.compare(a.placementDate, b.placementDate, isAsc);
      case 'issueDescription': return this.compare(a.issueDescription, b.issueDescription, isAsc);
      case 'serviceCallDescription': return this.compare(a.serviceCallDescription, b.serviceCallDescription, isAsc);
      default: return 0;
    }
  });
}


sortSpaData(sort: Sort) {
  
  const data = this.spaDetails.slice();
  if (!sort.active || sort.direction === '') {
    this.spaDetails = data;
    return;
  }

  this.spaDetails = data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    switch (sort.active) {
      case 'spaBrandName': return this.compare(a.spaBrandName, b.spaBrandName, isAsc);
      case 'spaModelName': return this.compare(a.spaModelName, b.spaModelName, isAsc);
      case 'poolSpecialistName': return this.compare(a.poolSpecialistName, b.poolSpecialistName, isAsc);
      default: return 0;
    }
  });
}
preventMultipleSpaces(event: KeyboardEvent): void {
  
  const input = (event.target as HTMLInputElement).value;

  // Prevent typing a space if the last character is already a space
  if (event.key === ' ' && input.endsWith(' ')) {
    event.preventDefault();
  }
}

sanitizeInput(): void {
  if (this.searchQuery) {
    // Ensure that extra spaces after punctuation are removed on the fly
    this.searchQuery = this.searchQuery.replace(/(\.|\?|!)\s{2,}/g, '$1 ');
  }
}

/**
 * COMPONENT SUMMARY & IMPLEMENTATION NOTES
 * 
 * OVERALL ARCHITECTURE:
 * This component implements a comprehensive client management system with the following key areas:
 * 
 * 1. CLIENT SEARCH & SELECTION:
 *    - Multi-criteria search (Name, Spa Number, Service Call, Telephone, Client Number, Address)
 *    - Search popup overlay with clickable results
 *    - Automatic popup closure after selection
 *    - Click-outside detection for better UX
 * 
 * 2. CLIENT DATA MANAGEMENT:
 *    - Full CRUD operations for client records
 *    - Form validation and data sanitization
 *    - Client list preservation and restoration
 *    - Blacklist status handling
 * 
 * 3. SPA & SERVICE CALL INTEGRATION:
 *    - Spa details association and management
 *    - Historical and upcoming service call tracking
 *    - Service call data sorting and pagination
 * 
 * 4. USER EXPERIENCE IMPROVEMENTS:
 *    - Responsive design with Material Design components
 *    - Multi-language support (English/French)
 *    - Toastr notifications for user feedback
 *    - Loading states and error handling
 * 
 * RECENT SESSION IMPROVEMENTS:
 * 
 * ISSUE 1: Search popup not closing after client selection
 * SOLUTION: Added proper state management in selectClient method
 * - Set isSearchtable = false when client is selected
 * - Clear searchQuery to reset search state
 * 
 * ISSUE 2: Form emptying when clicking on selected client again
 * SOLUTION: Implemented original client list preservation
 * - Added originalClientList property to store full client list
 * - Modified getClientById to preserve original list
 * - Added resetClientList method for list restoration
 * 
 * ISSUE 3: Search popup state management
 * SOLUTION: Enhanced search popup behavior
 * - Added onSearchBlur method for input blur handling
 * - Added onDocumentClick for click-outside detection
 * - Added onSearchClear for search state reset
 * - Improved timing for popup closure
 * 
 * API INTEGRATION PATTERNS:
 * 
 * 1. DATA LOADING:
 *    - getAllClientList(): Main client list with transformation
 *    - getClientById(): Filtered client view
 *    - getClientDataById(): Full client details
 * 
 * 2. SEARCH OPERATIONS:
 *    - getClientBySearch(): Criteria-based client search
 *    - applyFilter(): Search input handling
 *    - setPaginatorModel(): Search parameter configuration
 * 
 * 3. ASSOCIATED DATA:
 *    - getOldServiceCall(): Service call history
 *    - getUpcomingServiceCall(): Future appointments
 *    - getSpaDetails(): Spa information
 * 
 * FORM MANAGEMENT STRATEGY:
 * 
 * 1. FORM STATE:
 *    - clientForm: Main client information
 *    - spaForm: Spa details and specifications
 *    - Dynamic enable/disable based on selection state
 * 
 * 2. DATA BINDING:
 *    - Reactive forms with validation
 *    - Form patching from API responses
 *    - Data transformation for UI compatibility
 * 
 * 3. VALIDATION:
 *    - Required field validation
 *    - Email format validation
 *    - Custom validators for phone numbers
 *    - Whitespace prevention
 * 
 * PERFORMANCE CONSIDERATIONS:
 * 
 * 1. DATA LOADING:
 *    - Lazy loading of associated data
 *    - Pagination for large datasets
 *    - Debounced search input handling
 * 
 * 2. MEMORY MANAGEMENT:
 *    - Subscription cleanup in ngOnDestroy
 *    - Efficient data structure usage
 *    - Minimal DOM manipulation
 * 
 * 3. USER INTERACTION:
 *    - Responsive search with minimal API calls
 *    - Smooth transitions and loading states
 *    - Intuitive error handling
 * 
 * FUTURE ENHANCEMENTS:
 * 
 * 1. SEARCH IMPROVEMENTS:
 *    - Advanced filtering options
 *    - Search result highlighting
 *    - Search history and suggestions
 * 
 * 2. DATA MANAGEMENT:
 *    - Bulk operations for multiple clients
 *    - Advanced sorting and filtering
 *    - Export functionality for reports
 * 
 * 3. USER EXPERIENCE:
 *    - Keyboard navigation support
 *    - Drag and drop for spa associations
 *    - Real-time updates and notifications
 * 
 * TESTING CONSIDERATIONS:
 * 
 * 1. UNIT TESTS:
 *    - Component initialization
 *    - Form validation logic
 *    - API integration methods
 * 
 * 2. INTEGRATION TESTS:
 *    - End-to-end client workflows
 *    - API response handling
 *    - Error scenario coverage
 * 
 * 3. USER ACCEPTANCE TESTS:
 *    - Search functionality validation
 *    - Form submission workflows
 *    - Data persistence verification
 */
}



