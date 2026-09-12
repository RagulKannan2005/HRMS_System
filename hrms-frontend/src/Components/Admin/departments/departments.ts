import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../service/admin.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.html',
  styleUrl: './departments.css',
})
export class Departments implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  searchTerm: string = '';
  departments: any[] = [];
  filteredDepartments: any[] = [];

  isModalOpen: boolean = false;
  isSubmitting: boolean = false;
  modalErrorMessage: string = '';

  newDepartment: any = {
    name: '',
  };

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getDepartments().subscribe({
      next: (data) => {
        this.departments = data || [];
        this.filterDepartments();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load departments';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  filterDepartments(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredDepartments = [...this.departments];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredDepartments = this.departments.filter(
        (dept) => dept.name && dept.name.toLowerCase().includes(term)
      );
    }
  }

  openModal(): void {
    this.modalErrorMessage = '';
    this.newDepartment = { name: '' };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.cdr.detectChanges();
  }

  submitDepartment(): void {
    this.modalErrorMessage = '';
    if (!this.newDepartment.name || this.newDepartment.name.trim() === '') {
      this.modalErrorMessage = 'Please enter a valid department name.';
      return;
    }

    this.isSubmitting = true;
    this.adminService.createDepartment({ name: this.newDepartment.name.trim() }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.closeModal();
        this.successMessage = `Successfully created department "${res.name || this.newDepartment.name}"!`;
        setTimeout(() => (this.successMessage = ''), 4000);
        this.loadDepartments();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.modalErrorMessage = err.error?.message || err.error || 'Failed to create department.';
        this.cdr.detectChanges();
      },
    });
  }
}
