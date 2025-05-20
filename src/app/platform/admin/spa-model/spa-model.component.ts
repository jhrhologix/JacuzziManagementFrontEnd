import {
  AfterViewChecked,
  Component,
  OnInit,
  ViewChild,
  Injectable,
  ChangeDetectorRef,
} from '@angular/core';
import { SpaService } from './spa.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
declare var window: any;

export interface ClientData {
  clientNumber: number;
  firstName: string;
  lastName: string;
}


// const CLIENT_DATA: ClientData[] = [
//   { clientNumber: 1, firstName: 'John', lastName: 'Doe' },
//   { clientNumber: 2, firstName: 'Jane', lastName: 'Smith' },
//   { clientNumber: 3, firstName: 'John', lastName: 'Doe' },
//   { clientNumber: 4, firstName: 'Jane', lastName: 'Smith' },
//   { clientNumber: 5, firstName: 'John', lastName: 'Doe' },
//   { clientNumber: 6, firstName: 'Jane', lastName: 'Smith' },
//   { clientNumber: 7, firstName: 'John', lastName: 'Doe' },
//   { clientNumber: 8, firstName: 'Jane', lastName: 'Smith' },
//   { clientNumber: 9, firstName: 'John', lastName: 'Doe' },
//   { clientNumber: 10, firstName: 'Jane', lastName: 'Smith' },
//   { clientNumber: 11, firstName: 'John', lastName: 'Doe' },
//   { clientNumber: 12, firstName: 'Jane', lastName: 'Smith' },
//   { clientNumber: 13, firstName: 'Jane', lastName: 'Smith' },
//   { clientNumber: 14, firstName: 'John', lastName: 'Doe' },
//   { clientNumber: 15, firstName: 'Jane', lastName: 'Smith' },
//   { clientNumber: 16, firstName: 'John', lastName: 'Doe' },
//   { clientNumber: 17, firstName: 'Jane', lastName: 'Smith' },
//   { clientNumber: 18, firstName: 'John', lastName: 'Doe' },
//   { clientNumber: 19, firstName: 'Jane', lastName: 'Smith' },
//   { clientNumber: 20, firstName: 'John', lastName: 'Doe' },
//   { clientNumber: 21, firstName: 'Jane', lastName: 'Smith' },

//   // Add more client data here
// ];

@Component({
  selector: 'app-spa-model',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule,TranslateModule],
  templateUrl: './spa-model.component.html',
  styleUrl: './spa-model.component.scss',
})
export class SpaModelComponent implements AfterViewChecked {
  brandsData: any[] = [];
  filteredBrands: any[] = [];
  modelsData: any[] = [];
  filteredModels: any[] = [];
  contractorsData: any[] = [];
  filteredContractors: any[] = [];
  selectedBrandId: number | null = null;
  selectedContractorId: number | null = null;
  spaModelSpaBrandId: number | null = null;
  selectedBrandName: string = '';
  selectedSpaModelValue: string = '';
  spaId: number | null = null;
  getspaByBrandIds: any[] = [];

  searchBrand: string = '';
  searchModel: string = '';
  searchContractor: string = '';
  contractorAbbreviation: string = '';
  newBrandLabel: string = '';
  newContractorName: string = '';
  newSpaModelLabel: string = '';

  modalTitle: string = '';
  modalMessage: string = '';
  isdeletebutton = true;
  private confirmActionFn: () => void = () => {};
  spabrandModel: any;
  actionbuttondata: any;
  selectedModelId: number | null = null;
  shouldScrollToNewBrand = false;
  isLoading = false;

  constructor(private spaService: SpaService, private toastr: ToastrService,private translate: TranslateService,
    private cdr: ChangeDetectorRef ) {}

  ngAfterViewChecked(): void {
    // Check if we need to scroll to the new brand
    if (this.shouldScrollToNewBrand && this.selectedBrandId !== null) {
      this.scrollToNewBrand(this.selectedBrandId);
      this.shouldScrollToNewBrand = false; // Reset the flag
    }
  }

  ngOnInit(): void {
    this.loadDataBrand();
    this.loadDataContractor();
    this.spabrandModel = new window.bootstrap.Modal(
      document.getElementById('spabrandModel')
    );
  }


  onPageChange(): void {
    this.isLoading = true;

    // Simulate loading data or call adminDetails() here if needed.
    setTimeout(() => {
      this.loadDataBrand();  // Fetch new data as per the paginator page
      this.isLoading = false;  // Hide loader after data is loaded
    }, 300); // Adjust delay as needed
  }

  loadDataBrand(): void {
    this.isLoading = true;
    this.spaService.GetSpaBrand().subscribe(
      (response) => {
        this.brandsData = Array.isArray(response)
          ? response
          : response.data || [];
        this.filteredBrands = [...this.brandsData];
        this.isLoading = false;
      },
      
      (error) => {
        console.error('Error fetching brand data', error);
      }
    );
  }

  loadDataContractor(): void {
    this.spaService.SwimmingPoolContractor().subscribe(
      (response) => {
        this.contractorsData = Array.isArray(response)
          ? response
          : response.data || [];
        this.filteredContractors = [...this.contractorsData];
      },
      (error) => {
        console.error('Error fetching contractor data', error);
      }
    );
  }

  loadModelsByBrand(brandId: number): void {
    ;

    this.spaService.GetSpaModel(brandId).subscribe(
      (response) => {
        this.modelsData = Array.isArray(response)
          ? response
          : response.data || [];
        this.filteredModels = [...this.modelsData];
        this.getspaByBrandidFn(brandId);
      },
      (error) => {
        console.error('Error fetching model data', error);
      }
    );
  }

  // filterBrands($event:any): void {
  //   const value = event?.target.value
  //   const searchValue = this.searchBrand.toLowerCase();
  //   this.filteredBrands = this.brandsData.filter((brand) =>
  //     brand.name?.toLowerCase().includes(searchValue) ||
  //     brand.id.toString().includes(searchValue) ||
  //     brand.value?.toLowerCase().includes(searchValue)
  //   );
  // }
  getBrandInputValue(event: any): void {
    const searchValue = event?.target.value.toLowerCase(); // Get the search value directly from the event
    this.searchBrand = searchValue;
    this.filterBrand(this.searchBrand);
    // this.filteredBrands = this.brandsData.filter((brand) =>
    //   brand.name?.toLowerCase().includes(searchValue) ||
    //   brand.id.toString().includes(searchValue) ||
    //   brand.value?.toLowerCase().includes(searchValue)
    // );
  }

  filterBrand(searchValue: any) {
    ;
    this.filteredBrands = this.brandsData.filter(
      (brand) =>
        brand.name?.toLowerCase().includes(searchValue) ||
        brand.id.toString().includes(searchValue) ||
        brand.value?.toLowerCase().includes(searchValue)
    );
  }

  // filterModels(): void {
  //   const searchValue = this.searchModel.toLowerCase();
  //   this.filteredModels = this.modelsData.filter((model) =>
  //     model.name?.toLowerCase().includes(searchValue) ||
  //     model.id.toString().includes(searchValue) ||
  //     model.value?.toLowerCase().includes(searchValue)
  //   );
  // }

  filterContractors(): void {
    const searchValue = this.searchContractor.toLowerCase();
    this.filteredContractors = this.contractorsData.filter(
      (contractor) =>
        contractor.name?.toLowerCase().includes(searchValue) ||
        contractor.id.toString().includes(searchValue) ||
        contractor.value?.toLowerCase().includes(searchValue)
    );
  }

  onBrandRowClick(brand: any): void {
    this.searchModel = '';
    this.selectBrand(brand);
    this.selectedBrandId = brand.id;
    this.loadModelsByBrand(brand.id);

    this.selectedBrandId = brand.id;
  }
  selectBrand(brand: any): void {
    this.searchBrand = brand.value;
    this.selectedBrandId = brand.id;
  }

  onContractorRowClick(contractor: any): void {
    this.searchContractor = contractor.name;
    this.selectedContractorId = contractor.id;

    this.contractorAbbreviation = contractor.value;
    this.selectedContractorId = contractor.id;
  }

  // Method to store selected contractor ID
  selectContractor(contractorId: number): void {
    this.selectedContractorId = contractorId;
  }

  selectModel(model: any): void {
    this.spaModelSpaBrandId = model.id;
    this.searchModel = model.value;
    this.selectedModelId = model.id;
  }

  clearInputField(): void {
    this.searchBrand = ''; // Clear the input field
    this.filteredModels = [];
    this.loadDataBrand();
  }
  clearModelInputField() {
    this.searchModel = '';
    this.filteredModels = [];
    // this.loadModelsByBrand(0);
  }

  clearPoolSpecialistField() {
    this.searchContractor = '';
    this.contractorAbbreviation = '';
    this.filteredContractors = [];
    this.loadDataContractor();
  }

  // methods for add and delete actions
  AddSpaBrand(): void {
    
    this.isLoading = true;
    this.newBrandLabel = this.searchBrand.trim().toUpperCase();
    //this.searchBrand='';
    if (this.newBrandLabel) {
      this.spaService.AddSpaBrand(this.newBrandLabel).subscribe(
        (response) => {
          ;
          if (response.statusCode == 200) {
            this.isLoading = false;
            this.toastr.success('Brand added successfully.', 'Success');
            this.loadDataBrand();
            this.selectedBrandId = response.data.spaBrandId;
            
            // Once the brand data is loaded, filter and select the new brand
            this.loadModelsByBrand(
              this.selectedBrandId ? this.selectedBrandId : 0
            );
            this.filterBrand(this.newBrandLabel);
            this.shouldScrollToNewBrand = true;
            setTimeout(() => {
              this.scrollToNewBrand(this.selectedBrandId as number);
            }, 300);
          } else {
            this.isLoading = false;
            response.statusCode == 409
            this.toastr.warning('Brand name already exist.', 'Warning');
          }
        },
      );
    } else {
      this.isLoading = false;
      this.toastr.warning('Brand name cannot be empty.', 'Warning');
    }
    // this.loadDataBrand();
  }

  // Method to scroll to the newly added brand
  scrollToNewBrand(brandId: number): void {
    const element = document.getElementById('brand-' + brandId);
    if (element) {
      this.cdr.detectChanges(); 
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 800); // 500 milliseconds delay
    }
  }
  

  DeleteSpaBrand(): void {
    ;
    this.isLoading = true;
    if (this.selectedBrandId !== null) {
      this.spaService.DeleteSpaBrand(this.selectedBrandId).subscribe(
        (response) => {
          if (response.statusCode == 200) {
            this.isLoading = false;
            this.toastr.success('Brand deleted successfully!', 'Success');
            this.loadDataBrand();
            this.selectedBrandId = null;
            const btnSamElement = document.getElementById('closemodal');
            if (btnSamElement) {
              btnSamElement.click();
            }
            this.searchBrand = '';
            this.newSpaModelLabel = '';
            this.clearModelInputField();
          } else {
            this.isLoading = false;
            this.toastr.warning('Failed to delete brand' , 'Warning');
          }
        },
        (error) => {
          this.isLoading = false;
          this.toastr.warning('Failed to delete brand' , 'Warning');
        }
      );
    } else {
      this.isLoading = false;
      this.toastr.warning('Failed to delete brand' , 'Warning');
    }
  }

  AddSpaModel(): void {
    ;
    this.isLoading = true;
    if (this.searchModel.trim().toUpperCase() && this.selectedBrandId !== null) {
      // Call the service to add the spa model
      this.spaService
        .AddSpaModel(
          this.searchModel.trim().toUpperCase(),
          this.selectedBrandId
        )
        .subscribe(
          (response) => {
            if (response.statusCode == 200) {
              this.isLoading = false;
              this.toastr.success('Model added successfully.', 'Success');
              this.newSpaModelLabel = '';
              this.searchModel = '';
  
              // Refresh the models for the selected brand
              this.loadModelsByBrand(this.selectedBrandId ? this.selectedBrandId : 0);
            } else if (response.statusCode == 409) {
              this.isLoading = false;
              this.toastr.warning('Model name already exists.', 'Warning');
            } else {
              this.isLoading = false;
            this.toastr.warning('Model name already exists.', 'Warning');
            }
          },
        );
    } else {
      this.isLoading = false;
      this.toastr.warning('Model name is required.', 'Warning');
    }
  }
  

  DeleteSpaModel(): void {
    
    this.isLoading = true;
    // Check if a valid model ID is selected for deletion
    if (
      this.spaModelSpaBrandId !== null &&
      typeof this.spaModelSpaBrandId == 'number'
    ) {
      
      this.spaService.DeleteSpaModel(this.spaModelSpaBrandId).subscribe(
        (response) => {
          if (response.statusCode == 200) {
            this.isLoading = false;
            this.toastr.success('Model deleted successfully!', 'Success');
            this.loadModelsByBrand(this.selectedBrandId as number);
            this.spaModelSpaBrandId = null;
            this.searchModel = '';
            const btnSamElement = document.getElementById('closemodal');
            if (btnSamElement) {
              btnSamElement.click();
            }
          } else {
            this.isLoading = false;
            this.toastr.warning('Failed to delete Model' , 'Warning');
          }
        },
      );
    } else {
      this.isLoading = false;
      this.toastr.warning('Failed to delete Model' , 'Warning');
    }
  }

  AddNewContractor(): void {
    this.isLoading = true;
    // Check if the new contractor name is valid
    if (this.searchContractor) {
      const poolSpecialistObject = {
        poolSpecialistName: this.searchContractor.trim().toUpperCase(),
        poolSpecialistAbbreviation: this.contractorAbbreviation
          .trim()
          .toUpperCase(),
      };
  
      this.spaService.AddNewContractor(poolSpecialistObject).subscribe(
        (response) => {
          if (response.statusCode == 200) {
            this.isLoading = false;
            this.toastr.success('Contractor added successfully!', 'Success');
            this.loadDataContractor();
            this.newContractorName = '';
            this.clearPoolSpecialistField();
          } else {
            response.statusCode == 409
            this.isLoading = false;
            this.toastr.warning('Failed to add Pool Specialist: ' + response.message, 'Warning');
          }
        },
      );
    } else {
      this.isLoading = false;
      this.toastr.warning('Pool Specialist name cannot be empty.', 'Warning');
    }
  }
  

  DeleteContractor(): void {
    ;
    this.isLoading = true;
    if (
      this.selectedContractorId !== null &&
      typeof this.selectedContractorId === 'number'
    ) {
      

      this.spaService.DeleteContractor(this.selectedContractorId).subscribe(
        (response) => {

          if (response && response.statusCode === 200) {
            this.isLoading = false;
            this.toastr.success('Pool Specialist deleted successfully!', 'Success');
            this.loadDataContractor();
            this.selectedContractorId = null;
            (this.searchContractor = ''), (this.contractorAbbreviation = '');
            const btnSamElement = document.getElementById('closemodal');
            if (btnSamElement) {
              btnSamElement.click();
            }
          } else {
            false
            this.toastr.warning('Failed to delete Pool Specialist' , 'Warning');
          }
        },
      );
    } else {
      this.isLoading = false;
      this.toastr.warning('Failed to delete Pool Specialist' , 'Warning');
    }
  }

  actionbutton(event: any) {
    ;
    this.actionbuttondata = event;
    if (event == 'deletebrand') {
      {
        if (this.getspaByBrandIds.length > 0) {
          this.isdeletebutton = false;
          this.showConfirmationModal(
            'Attention!',
            this.translate.instant('MODAL.AttnBrand'), 
            () => this.DeleteSpaBrand()
          );
        } else {
          this.isdeletebutton = true;
          this.showConfirmationModal(
            this.translate.instant('MODAL.ConfirmDelete'),
            this.translate.instant('MODAL.DeleteBrand'),
            () => this.DeleteSpaBrand()
          );
        }
      }
    } else if (event == 'deletespamodels') {
      const btnSamElement = document.getElementById('btnsam');
      if (btnSamElement) {
        btnSamElement.click();
      }
      this.isdeletebutton = true;
      this.showConfirmationModal(
        this.translate.instant('MODAL.ConfirmDelete'),
        this.translate.instant('MODAL.DeleteModel'),
        () => this.DeleteSpaModel()
      );
    } else {
      event == 'deletePoolSpecialist';
      const btnSamElement = document.getElementById('btnsam');
      if (btnSamElement) {
        btnSamElement.click();
      }
      this.isdeletebutton = true;
      this.showConfirmationModal(
        this.translate.instant('MODAL.ConfirmDelete'),
        this.translate.instant('MODAL.DeletePoolSpecl'),
        () => this.DeleteContractor()
      );
    }
  }

  showConfirmationModal(
    title: string,
    message: string,
    confirmAction: () => void
  ) {
    ;
    this.modalTitle = title;
    this.modalMessage = message;
    this.confirmActionFn = confirmAction;
    this.spabrandModel.show();
  }
  confirmDelete(event: any) {
    ;
    if (event == 'brand' && this.actionbuttondata == 'deletebrand') {
      this.DeleteSpaBrand();
    } else if (this.actionbuttondata == 'deletespamodels') {
      this.DeleteSpaModel();
    } else {
      this.DeleteContractor();
    }
  }
  getspaByBrandidFn(brandId: number) {
    ;
    this.spaService.GetSpaDetailBySpaId(brandId).subscribe((response: any) => {
      if (response.statusCode == 200) {
        this.getspaByBrandIds = response.data;
      }
    });
  }

  displayedColumns: string[] = ['clientNumber', 'firstName', 'lastName'];
  // dataSource = new MatTableDataSource<ClientData>(CLIENT_DATA);
  
  // pageSizeOptions: number[] = [5, 10, 20];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // ngAfterViewInit() {
    
  //   this.dataSource.paginator = this.paginator;
  // }
}
