import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../service/admin.service';

export interface MergedEmployeeSalary {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  email: string;
  departmentName: string;
  designationName: string;
  salaryId?: number;
  basicSalary: number;
  hra: number;
  otherAllowance: number;
  pfPercent: number;
  taxPercent: number;
  grossSalary: number;
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll.html',
  styleUrl: './payroll.css',
})
export class Payroll implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'salaries' | 'ledger' = 'salaries';

  employees: any[] = [];
  salaryRecords: any[] = [];
  combinedSalaries: MergedEmployeeSalary[] = [];
  filteredSalaries: MergedEmployeeSalary[] = [];

  // Search & Filters
  searchName: string = '';
  searchDepartment: string = '';
  searchMinSalary: number | null = null;

  // Metrics
  totalPayrollBudget: number = 0;
  totalEmployeesCount: number = 0;
  avgGrossSalary: number = 0;

  isLoading: boolean = false;
  // Toast Notification
  toastMessage: string | null = null;
  toastError: boolean = false;

  // --- Generate Payroll Modal ---
  showGenerateModal: boolean = false;
  targetEmployeeId: number | null = null;
  targetYear: number = new Date().getFullYear();
  targetMonth: number = new Date().getMonth() + 1;
  isGenerating: boolean = false;

  // --- Edit Salary Modal ---
  showEditModal: boolean = false;
  isUpdatingSalary: boolean = false;
  editSalaryForm: any = {
    salaryId: null,
    employeeId: null,
    employeeName: '',
    basicSalary: 0,
    hra: 0,
    otherAllowance: 0,
    pfPercent: 12,
    taxPercent: 5,
  };

  // --- Historical Ledger ---
  selectedEmployeeHistory: MergedEmployeeSalary | null = null;
  employeePayrolls: any[] = [];
  isLoadingHistory: boolean = false;

  // --- Payslip Modal ---
  showPayslipModal: boolean = false;
  selectedPayslip: any = null;

  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  ngOnInit(): void {
    this.loadAllPayrollData();
  }

  loadAllPayrollData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      employees: this.adminService.getAllEmployees().pipe(catchError(() => of([]))),
      salaries: this.adminService.getAllSalaries().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ employees, salaries }) => {
        this.employees = employees || [];
        this.salaryRecords = salaries || [];
        this.mergeData();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading payroll data:', err);
        this.cdr.markForCheck();
      },
    });
  }

  mergeData(): void {
    const list: MergedEmployeeSalary[] = [];

    for (const emp of this.employees) {
      // Find matching salary by employeeId (numerical or string match)
      const sal = this.salaryRecords.find(
        (s) =>
          String(s.employeeId) === String(emp.id) ||
          (s.employee && String(s.employee.id) === String(emp.id)),
      );

      const basic = sal?.basicSalary ? Number(sal.basicSalary) : 0;
      const hra = sal?.hra ? Number(sal.hra) : 0;
      const other = sal?.otherAllowance ? Number(sal.otherAllowance) : 0;
      const gross = basic + hra + other;

      list.push({
        employeeId: emp.id,
        employeeCode: emp.employeeCode || `EMP-${emp.id}`,
        employeeName: emp.employeeName || 'Unknown',
        email: emp.email || '',
        departmentName: emp.departmentName || emp.department?.name || 'General',
        designationName: emp.designationName || emp.designation?.title || 'Staff',
        salaryId: sal?.id || null,
        basicSalary: basic,
        hra: hra,
        otherAllowance: other,
        pfPercent: sal?.pfPercent != null ? Number(sal.pfPercent) : 12,
        taxPercent: sal?.taxPercent != null ? Number(sal.taxPercent) : 5,
        grossSalary: gross,
      });
    }

    this.combinedSalaries = list;
    this.applyFilter();
    this.calculateMetrics();
    this.cdr.markForCheck();
  }

  applyFilter(): void {
    let result = [...this.combinedSalaries];

    if (this.searchName.trim()) {
      const q = this.searchName.toLowerCase();
      result = result.filter(
        (item) =>
          item.employeeName.toLowerCase().includes(q) ||
          item.employeeCode.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q),
      );
    }

    if (this.searchDepartment.trim()) {
      const q = this.searchDepartment.toLowerCase();
      result = result.filter((item) => item.departmentName.toLowerCase().includes(q));
    }

    if (this.searchMinSalary !== null && this.searchMinSalary > 0) {
      result = result.filter((item) => item.grossSalary >= this.searchMinSalary!);
    }

    this.filteredSalaries = result;
    this.cdr.markForCheck();
  }

  calculateMetrics(): void {
    this.totalEmployeesCount = this.combinedSalaries.length;
    this.totalPayrollBudget = this.combinedSalaries.reduce(
      (acc, curr) => acc + curr.grossSalary,
      0,
    );
    this.avgGrossSalary =
      this.totalEmployeesCount > 0
        ? Math.round(this.totalPayrollBudget / this.totalEmployeesCount)
        : 0;
  }

  // --- Generate Payroll Flow ---
  openGenerateModal(employeeId?: number): void {
    this.targetEmployeeId = employeeId || (this.employees[0]?.id ?? null);
    this.targetYear = new Date().getFullYear();
    this.targetMonth = new Date().getMonth() + 1;
    this.showGenerateModal = true;
    this.cdr.markForCheck();
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
    this.cdr.markForCheck();
  }

  onSubmitGenerate(): void {
    if (!this.targetEmployeeId) {
      this.showToast('Please select an employee', true);
      return;
    }

    this.isGenerating = true;
    this.adminService
      .generatePayroll(this.targetEmployeeId, this.targetYear, this.targetMonth)
      .subscribe({
        next: (res) => {
          this.isGenerating = false;
          this.closeGenerateModal();
          this.showToast(
            `Payroll successfully processed for ${res.employeeName || 'employee'}! Net Pay: ₹${res.netSalary}`,
            false,
          );
          // If viewing ledger for this employee, reload their history
          if (this.selectedEmployeeHistory?.employeeId === this.targetEmployeeId) {
            this.loadEmployeeHistory(this.selectedEmployeeHistory);
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isGenerating = false;
          const msg = err?.error?.message || err?.error?.error || 'Failed to generate payroll';
          this.showToast(typeof msg === 'string' ? msg : 'Payroll generation failed', true);
          this.cdr.markForCheck();
        },
      });
  }

  // --- Edit Salary Structure Flow ---
  openEditModal(item: MergedEmployeeSalary): void {
    this.editSalaryForm = {
      salaryId: item.salaryId,
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      basicSalary: item.basicSalary,
      hra: item.hra,
      otherAllowance: item.otherAllowance,
      pfPercent: item.pfPercent,
      taxPercent: item.taxPercent,
    };
    this.showEditModal = true;
    this.cdr.markForCheck();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.cdr.markForCheck();
  }

  onSubmitEditSalary(): void {
    if (!this.editSalaryForm.salaryId) {
      this.showToast('Salary record not found for this employee to update.', true);
      return;
    }

    this.isUpdatingSalary = true;
    const payload = {
      basicSalary: this.editSalaryForm.basicSalary,
      hra: this.editSalaryForm.hra,
      otherAllowance: this.editSalaryForm.otherAllowance,
      pfPercent: this.editSalaryForm.pfPercent,
      taxPercent: this.editSalaryForm.taxPercent,
    };

    this.adminService.updateEmployeeSalary(this.editSalaryForm.salaryId, payload).subscribe({
      next: () => {
        this.isUpdatingSalary = false;
        this.closeEditModal();
        this.showToast(`Salary structure updated for ${this.editSalaryForm.employeeName}!`, false);
        this.loadAllPayrollData();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isUpdatingSalary = false;
        const msg = err?.error?.message || err?.error?.error || 'Failed to update salary';
        this.showToast(typeof msg === 'string' ? msg : 'Failed to update salary', true);
        this.cdr.markForCheck();
      },
    });
  }

  // --- Historical Ledger Flow ---
  onSelectHistoryEmployee(employeeId: any): void {
    if (!employeeId) {
      this.selectedEmployeeHistory = null;
      this.employeePayrolls = [];
      this.cdr.markForCheck();
      return;
    }
    const found = this.combinedSalaries.find((e) => e.employeeId === Number(employeeId));
    if (found) {
      this.viewEmployeeHistory(found);
    } else {
      this.selectedEmployeeHistory = null;
      this.employeePayrolls = [];
      this.cdr.markForCheck();
    }
  }

  viewEmployeeHistory(item: MergedEmployeeSalary): void {
    this.selectedEmployeeHistory = item;
    this.activeTab = 'ledger';
    this.loadEmployeeHistory(item);
    this.cdr.markForCheck();
  }

  loadEmployeeHistory(item: MergedEmployeeSalary): void {
    this.isLoadingHistory = true;
    this.cdr.markForCheck();

    this.adminService.getPayrollByEmployeeId(item.employeeId).subscribe({
      next: (records) => {
        this.isLoadingHistory = false;
        this.employeePayrolls = records || [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingHistory = false;
        this.employeePayrolls = [];
        this.cdr.markForCheck();
      },
    });
  }

  openPayslipModal(p: any): void {
    this.selectedPayslip = p;
    this.showPayslipModal = true;
    this.cdr.markForCheck();
  }

  closePayslipModal(): void {
    this.showPayslipModal = false;
    this.selectedPayslip = null;
    this.cdr.markForCheck();
  }

  printPayslip(): void {
    window.print();
  }

  getMonthName(m: number): string {
    const found = this.months.find((item) => item.value === m);
    return found ? found.name : String(m);
  }

  private showToast(msg: string, isError: boolean): void {
    this.toastMessage = msg;
    this.toastError = isError;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.markForCheck();
    }, 4500);
  }
}
