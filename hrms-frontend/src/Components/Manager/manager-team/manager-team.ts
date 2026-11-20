import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ManagerService } from '../../../service/manager.service';

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
  selectedMember: any = null;
  memberBalances: any[] = [];
  memberSalary: any = null;

  departments: any[] = [];
  designations: any[] = [];

  isLoading: boolean = false;
  searchQuery: string = '';

  // Modal
  showOnboardModal: boolean = false;
  isSubmitting: boolean = false;
  formError: string | null = null;
  formSuccess: string | null = null;

  newEmployee: any = {
    employeeCode: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
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
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      team: this.managerService.getMyTeam().pipe(catchError(() => of([]))),
      depts: this.managerService.getDepartments().pipe(catchError(() => of([]))),
      desigs: this.managerService.getDesignations().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        this.teamMembers = res.team || [];
        this.applyFilter();
        this.departments = res.depts || [];
        if (this.departments.length > 0 && !this.newEmployee.departmentId) {
          this.newEmployee.departmentId = this.departments[0].id;
        }
        this.designations = res.desigs || [];
        if (this.designations.length > 0 && !this.newEmployee.designationId) {
          this.newEmployee.designationId = this.designations[0].id;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading manager team data:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadTeam(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.managerService.getMyTeam().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.teamMembers = data || [];
        this.applyFilter();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching team:', err);
        this.cdr.markForCheck();
      },
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
    this.cdr.markForCheck();
  }

  onSelectMember(member: any): void {
    this.selectedMember = member;
    this.memberBalances = [];
    this.memberSalary = null;
    this.cdr.markForCheck();

    if (member?.id) {
      forkJoin({
        balances: this.managerService
          .getEmployeeLeaveBalance(member.id)
          .pipe(catchError(() => of([]))),
        salary: this.managerService
          .getSalaryByEmployeeId(member.id)
          .pipe(catchError(() => of(null))),
      }).subscribe({
        next: (res) => {
          this.memberBalances = res.balances || [];
          this.memberSalary = Array.isArray(res.salary) ? res.salary[0] : res.salary;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading member details:', err);
          this.cdr.markForCheck();
        },
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
    this.cdr.markForCheck();
  }

  closeOnboardModal(): void {
    this.showOnboardModal = false;
    this.cdr.markForCheck();
  }

  onSubmitOnboard(): void {
    this.formError = null;
    this.formSuccess = null;

    if (!this.newEmployee.employeeName || !this.newEmployee.email || !this.newEmployee.password) {
      this.formError = 'Please fill out all required fields: Name, Email, and Password.';
      this.cdr.markForCheck();
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.managerService.createEmployee(this.newEmployee).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.formSuccess = `Employee ${res.employeeName || ''} onboarded successfully!`;
        this.loadTeam();
        this.cdr.markForCheck();
        setTimeout(() => {
          this.closeOnboardModal();
        }, 1200);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.formError = err?.error?.message || err?.error?.error || 'Failed to onboard employee';
        this.cdr.markForCheck();
      },
    });
  }
}
