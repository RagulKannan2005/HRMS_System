import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../service/admin.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  employeesList: any[] = [];
  filteredEmployeesList: any[] = [];
  departmentsList: any[] = [];
  designationsList: any[] = [];

  searchTerm: string = '';
  selectedDepartment: string = '';
  selectedStatus: string = '';

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  isModalOpen: boolean = false;
  isSubmitting: boolean = false;
  modalErrorMessage: string = '';

  newEmployee: any = {
    roleType: 'MANAGER', // MANAGER or EMPLOYEE
    employeeCode: '',
    employeeName: '',
    email: '',
    password: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',
    joiningDate: '',
    departmentId: null,
    designationId: null,
    bankAccountNumber: '',
    ifsc: '',
    basicSalary: 0,
    hra: 0,
    otherAllowance: 0,
    taxPercent: 0,
    pfPercent: 0,
    salaryEffectiveFrom: '',
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
    this.loadDesignations();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminService.getAllEmployees().subscribe({
      next: (data) => {
        this.employeesList = data || [];
        this.filterEmployees();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        this.errorMessage = 'Failed to load employees. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadDepartments(): void {
    this.adminService.getDepartments().subscribe({
      next: (data) => {
        this.departmentsList = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
      },
    });
  }

  loadDesignations(): void {
    this.adminService.getDesignations().subscribe({
      next: (data) => {
        this.designationsList = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching designations:', err);
      },
    });
  }

  filterEmployees(): void {
    let result = [...this.employeesList];

    // Search filter (Code, Name, Email, Department, Designation)
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(
        (emp) =>
          (emp.employeeCode && emp.employeeCode.toLowerCase().includes(term)) ||
          (emp.employeeName && emp.employeeName.toLowerCase().includes(term)) ||
          (emp.email && emp.email.toLowerCase().includes(term)) ||
          (emp.departmentName && emp.departmentName.toLowerCase().includes(term)) ||
          (emp.designationName && emp.designationName.toLowerCase().includes(term)),
      );
    }

    // Department filter
    if (this.selectedDepartment) {
      result = result.filter((emp) => emp.departmentName === this.selectedDepartment);
    }

    // Status filter
    if (this.selectedStatus) {
      result = result.filter(
        (emp) => emp.employeeStatus === this.selectedStatus || emp.role === this.selectedStatus,
      );
    }

    this.filteredEmployeesList = result;
    this.cdr.detectChanges();
  }

  openModal(): void {
    this.modalErrorMessage = '';
    const today = new Date().toISOString().split('T')[0];
    this.newEmployee = {
      roleType: 'MANAGER',
      employeeCode: 'EMP' + Math.floor(1000 + Math.random() * 9000),
      employeeName: '',
      email: '',
      password: '',
      phone: '',
      gender: 'MALE',
      dateOfBirth: '',
      joiningDate: today,
      departmentId: this.departmentsList.length > 0 ? this.departmentsList[0].id : null,
      designationId: this.designationsList.length > 0 ? this.designationsList[0].id : null,
      bankAccountNumber: '',
      ifsc: '',
      basicSalary: 30000,
      hra: 5000,
      otherAllowance: 2000,
      taxPercent: 5,
      pfPercent: 12,
      salaryEffectiveFrom: today,
    };
    this.isModalOpen = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.cdr.detectChanges();
  }

  submitEmployee(): void {
    this.modalErrorMessage = '';

    if (
      !this.newEmployee.employeeCode ||
      !this.newEmployee.employeeName ||
      !this.newEmployee.email ||
      !this.newEmployee.password
    ) {
      this.modalErrorMessage = 'Please fill in all mandatory fields (Code, Name, Email, Password).';
      return;
    }

    if (!this.newEmployee.departmentId || !this.newEmployee.designationId) {
      this.modalErrorMessage = 'Please select a valid Department and Designation.';
      return;
    }

    this.isSubmitting = true;

    // Convert string IDs to numbers if needed
    const payload = {
      ...this.newEmployee,
      departmentId: Number(this.newEmployee.departmentId),
      designationId: Number(this.newEmployee.designationId),
    };

    delete payload.roleType;

    const request$ =
      this.newEmployee.roleType === 'MANAGER'
        ? this.adminService.registerManager(payload)
        : this.adminService.createEmployee(payload);

    request$.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.closeModal();
        this.successMessage = `Successfully added ${res.employeeName || 'employee'}!`;
        setTimeout(() => (this.successMessage = ''), 4000);
        this.loadEmployees();
      },
      error: (err) => {
        console.error('Error creating employee:', err);
        this.isSubmitting = false;
        this.modalErrorMessage =
          err.error?.message || err.error || 'Failed to create employee. Please check inputs.';
        this.cdr.detectChanges();
      },
    });
  }
}
