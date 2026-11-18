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
  managersList: any[] = [];

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
    roleType: 'EMPLOYEE', // EMPLOYEE or MANAGER
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
    managerId: null,
    bankAccountNumber: '',
    ifsc: '',
    basicSalary: 30000,
    hra: 5000,
    otherAllowance: 2000,
    taxPercent: 5,
    pfPercent: 12,
    salaryEffectiveFrom: '',
  };

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
    this.loadDesignations();
    this.loadManagers();
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

  loadManagers(): void {
    this.adminService.getManagers().subscribe({
      next: (data) => {
        this.managersList = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching managers:', err);
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
      roleType: 'EMPLOYEE',
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
      managerId: null,
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

    // Field validations
    if (!this.newEmployee.employeeCode || this.newEmployee.employeeCode.trim() === '') {
      this.modalErrorMessage = 'Employee code cannot be empty.';
      return;
    }
    if (!this.newEmployee.employeeName || this.newEmployee.employeeName.trim() === '') {
      this.modalErrorMessage = 'Employee name cannot be empty.';
      return;
    }
    if (!this.newEmployee.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newEmployee.email.trim())) {
      this.modalErrorMessage = 'Please enter a valid email address.';
      return;
    }
    if (!this.newEmployee.password || this.newEmployee.password.length < 8) {
      this.modalErrorMessage = 'Password must be at least 8 characters long.';
      return;
    }
    if (!this.newEmployee.phone || this.newEmployee.phone.trim() === '') {
      this.modalErrorMessage = 'Phone number cannot be empty.';
      return;
    }
    if (!this.newEmployee.gender) {
      this.modalErrorMessage = 'Please select a gender.';
      return;
    }
    if (!this.newEmployee.dateOfBirth) {
      this.modalErrorMessage = 'Date of birth cannot be empty.';
      return;
    }
    if (!this.newEmployee.joiningDate) {
      this.modalErrorMessage = 'Joining date cannot be empty.';
      return;
    }
    if (!this.newEmployee.departmentId) {
      this.modalErrorMessage = 'Please select a valid Department.';
      return;
    }
    if (!this.newEmployee.designationId) {
      this.modalErrorMessage = 'Please select a valid Designation.';
      return;
    }
    if (!this.newEmployee.bankAccountNumber || this.newEmployee.bankAccountNumber.trim() === '') {
      this.modalErrorMessage = 'Bank account number cannot be empty.';
      return;
    }
    if (this.newEmployee.basicSalary == null || Number(this.newEmployee.basicSalary) < 0) {
      this.modalErrorMessage = 'Basic salary must be a valid non-negative number.';
      return;
    }
    if (this.newEmployee.hra == null || Number(this.newEmployee.hra) < 0) {
      this.modalErrorMessage = 'HRA must be a valid non-negative number.';
      return;
    }
    if (this.newEmployee.otherAllowance == null || Number(this.newEmployee.otherAllowance) < 0) {
      this.modalErrorMessage = 'Other allowance must be a valid non-negative number.';
      return;
    }
    if (this.newEmployee.taxPercent == null || Number(this.newEmployee.taxPercent) < 0) {
      this.modalErrorMessage = 'Tax percent must be a valid non-negative number.';
      return;
    }
    if (this.newEmployee.pfPercent == null || Number(this.newEmployee.pfPercent) < 0) {
      this.modalErrorMessage = 'PF percent must be a valid non-negative number.';
      return;
    }

    this.isSubmitting = true;
    const today = new Date().toISOString().split('T')[0];

    // Payload construction with appropriate types and no empty string dates
    const payload: any = {
      employeeCode: this.newEmployee.employeeCode.trim(),
      employeeName: this.newEmployee.employeeName.trim(),
      email: this.newEmployee.email.trim(),
      password: this.newEmployee.password,
      phone: this.newEmployee.phone.trim(),
      gender: this.newEmployee.gender,
      dateOfBirth: this.newEmployee.dateOfBirth,
      joiningDate: this.newEmployee.joiningDate,
      bankAccountNumber: this.newEmployee.bankAccountNumber.trim(),
      ifsc: this.newEmployee.ifsc && this.newEmployee.ifsc.trim() !== '' ? this.newEmployee.ifsc.trim() : null,
      departmentId: Number(this.newEmployee.departmentId),
      designationId: Number(this.newEmployee.designationId),
      managerId: this.newEmployee.managerId ? Number(this.newEmployee.managerId) : null,
      basicSalary: Number(this.newEmployee.basicSalary),
      hra: Number(this.newEmployee.hra),
      otherAllowance: Number(this.newEmployee.otherAllowance),
      taxPercent: Number(this.newEmployee.taxPercent),
      pfPercent: Number(this.newEmployee.pfPercent),
      salaryEffectiveFrom: this.newEmployee.salaryEffectiveFrom || this.newEmployee.joiningDate || today,
    };

    const request$ =
      this.newEmployee.roleType === 'MANAGER'
        ? this.adminService.registerManager(payload)
        : this.adminService.createEmployee(payload);

    request$.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.closeModal();
        this.successMessage = `Successfully added ${res.employeeName || 'record'}!`;
        setTimeout(() => (this.successMessage = ''), 4000);
        this.loadEmployees();
        this.loadManagers();
      },
      error: (err) => {
        console.error('Error creating record:', err);
        this.isSubmitting = false;
        if (err.error && typeof err.error === 'object') {
          if (err.error.error) {
            this.modalErrorMessage = err.error.error;
          } else if (err.error.message) {
            this.modalErrorMessage = err.error.message;
          } else {
            // Spring Boot validation error map: { fieldName: errorMessage }
            const entries = Object.entries(err.error);
            if (entries.length > 0) {
              this.modalErrorMessage = entries
                .map(([field, msg]) => `${field}: ${msg}`)
                .join(' | ');
            } else {
              this.modalErrorMessage = 'Server validation failed. Please check inputs.';
            }
          }
        } else if (typeof err.error === 'string') {
          this.modalErrorMessage = err.error;
        } else {
          this.modalErrorMessage = 'Failed to create record. Please check inputs.';
        }
        this.cdr.detectChanges();
      },
    });
  }
}
