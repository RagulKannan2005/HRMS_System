import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../../service/admin.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-designation',
  imports: [CommonModule,FormsModule],
  templateUrl: './designation.html',
  styleUrl: './designation.css',
})
export class Designation implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  searchTerm: string = '';
  designations: any[] = [];
  filteredDesignations: any[] = [];

  isModelOpen: boolean = false;
  isSubmitting: boolean = false;
  modelErrorMessage: string = '';

  newDesignation: any = {
    title: '',
  };

  ngOnInit(): void {
    this.loadDesignations();
  }

  loadDesignations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getDesignations().subscribe({
      next: (data) => {
        this.designations = data || [];
        this.filterDesignations();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load designations';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  filterDesignations(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredDesignations = [...this.designations];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredDesignations = this.designations.filter((des) => {
        const titleStr = des.title || des.name || '';
        return titleStr.toLowerCase().includes(term);
      });
    }
  }

  openModel(): void {
    this.openModal();
  }

  openModal(): void {
    this.modelErrorMessage = '';
    this.newDesignation = { title: '' };
    this.isModelOpen = true;
    this.cdr.detectChanges();
  }

  closeModel(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.isModelOpen = false;
    this.cdr.detectChanges();
  }

  submitDesignation(): void {
    this.modelErrorMessage = '';
    const nameVal = this.newDesignation.title || this.newDesignation.name || '';
    if (!nameVal || nameVal.trim() === '') {
      this.modelErrorMessage = 'Please enter a valid designation title';
      return;
    }
    this.isSubmitting = true;
    const payload = {
      title: nameVal.trim(),
    };
    this.adminService.createDesignation(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.closeModal();
        this.successMessage = `Successfully created designation "${res.title || nameVal}"!`;
        setTimeout(() => (this.successMessage = ''), 4000);
        this.loadDesignations();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.modelErrorMessage = err.error?.message || err.message || 'Failed to create designation';
        this.cdr.detectChanges();
      },
    });
  }
}
