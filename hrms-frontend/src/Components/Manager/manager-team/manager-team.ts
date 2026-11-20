import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService, EmployeeCreatePayload } from '../../../service/manager.service';

@Component({
  selector: 'app-manager-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-team.html',
  styleUrl: './manager-team.css',
})
export class ManagerTeam implements OnInit {
  private managerService = inject(ManagerService);
  private cdr = inject(ChangeDetectorRef);

  teamMembers: any[] = [];
  filteredMembers: any[] = [];
  searchQuery: string = '';

  departments: any[] = [];
  designations: any[] = [];

  isLoading: boolean = false;
  selectedMember: any = null;
  memberBalances: any[] = [];
  memberSalary: any = null;

  // Onboard Employee Modal
  showOnboardModal: boolean = false;
  isSubmitting: boolean = false;
  formError: string | null = null;
  formSuccess: string | null = null;

  newEmployee: EmployeeCreatePayload = {
    employeeCode: '',
    employeeName: '',
    email: '',
    phone: '',
    gender: 'MALE',
    dateOfBirth: '',
    joiningDate: new Date().toISOString().substring(0, 10),
    bankAccountNumber: '',
    ifsc: '',
    departmentId: 0,
    designationId: 0,
    basicSalary: 30000,
    hra: 5000,
    otherAllowance: 2000,
    pfPercent: 12,
    taxPercent: 5,
    password: '',
  };

  ngOnInit(): void {
    this.loadTeam();
    this.loadMetadata();
  }

  loadTeam(): void {
    this.isLoading = true;
    this.managerService.getMyTeam().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.teamMembers = data || [];
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching team:', err);
      },
    });
  }

  loadMetadata(): void {
    this.managerService.getDepartments().subscribe({
      next: (depts) => {
        this.departments = depts || [];
        if (this.departments.length > 0 && !this.newEmployee.departmentId) {
          this.newEmployee.departmentId = this.departments[0].id;
        }
      },
      error: (err) => console.error('Error fetching departments:', err),
    });

    this.managerService.getDesignations().subscribe({
      next: (desigs) => {
        this.designations = desigs || [];
        if (this.designations.length > 0 && !this.newEmployee.designationId) {
          this.newEmployee.designationId = this.designations[0].id;
        }
      },
      error: (err) => console.error('Error fetching designations:', err),
    });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredMembers = [...this.teamMembers];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredMembers = this.teamMembers.filter(
        (m) =>
          (m.employeeName || '').toLowerCase().includes(q) ||
          (m.employeeCode || '').toLowerCase().includes(q) ||
          (m.email || '').toLowerCase().includes(q) ||
          (m.designationName || '').toLowerCase().includes(q) ||
          (m.departmentName || '').toLowerCase().includes(q),
      );
    }
  }

  onSelectMember(member: any): void {
    this.selectedMember = member;
    this.memberBalances = [];
    this.memberSalary = null;

    if (member?.id) {
      this.managerService.getEmployeeLeaveBalance(member.id).subscribe({
        next: (balances) => {
          this.memberBalances = balances || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading balances:', err),
      });

      this.managerService.getSalaryByEmployeeId(member.id).subscribe({
        next: (salary) => {
          this.memberSalary = Array.isArray(salary) ? salary[0] : salary;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error loading salary:', err),
      });
    }
  }

  openOnboardModal(): void {
    this.formError = null;
    this.formSuccess = null;
    this.newEmployee = {
      employeeCode: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
      employeeName: '',
      email: '',
      phone: '',
      gender: 'MALE',
      dateOfBirth: '2000-01-01',
      joiningDate: new Date().toISOString().substring(0, 10),
      bankAccountNumber: '',
      ifsc: '',
      departmentId: this.departments[0]?.id || 1,
      designationId: this.designations[0]?.id || 1,
      basicSalary: 35000,
      hra: 6000,
      otherAllowance: 2500,
      pfPercent: 12,
      taxPercent: 5,
      password: '',
    };
    this.showOnboardModal = true;
  }

  closeOnboardModal(): void {
    this.showOnboardModal = false;
  }

  onSubmitOnboard(): void {
    this.formError = null;
    this.formSuccess = null;

    if (!this.newEmployee.employeeName || !this.newEmployee.email || !this.newEmployee.password) {
      this.formError = 'Please fill out all required fields: Name, Email, and Password.';
      return;
    }

    this.isSubmitting = true;
    this.managerService.createEmployee(this.newEmployee).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.formSuccess = `Employee ${res.employeeName || ''} onboarded successfully!`;
        this.loadTeam();
        setTimeout(() => {
          this.closeOnboardModal();
        }, 1200);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.formError = err?.error?.message || err?.error?.error || 'Failed to onboard employee';
      },
    });
  }
}
