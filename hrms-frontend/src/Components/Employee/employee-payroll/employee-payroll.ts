import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeePortalService } from '../../../service/employee-portal';
import { Auth } from '../../../service/auth';

export interface PayslipItem {
  id: number;
  employeeName: string;
  employeeCode?: string;
  departmentName?: string;
  designationTitle?: string;
  month: number;
  year: number;
  grossSalary: number;
  pf: number;
  tax: number;
  leaveDeduction: number;
  deductions: number;
  totalDeduction: number;
  netSalary: number;
  processedAt: string;
}

@Component({
  selector: 'app-employee-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-payroll.html',
  styleUrl: './employee-payroll.css',
})
export class EmployeePayroll implements OnInit {
  private portalService = inject(EmployeePortalService);
  private authService = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  username: string = this.authService.getUsername() || 'Employee';
  payrolls: PayslipItem[] = [];
  selectedPayslip: PayslipItem | null = null;
  isLoading = false;
  errorMessage = '';

  selectedYear: string = 'ALL';
  searchQuery: string = '';

  ngOnInit(): void {
    this.loadPayroll();
  }

  loadPayroll(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.portalService.getMyPayroll().subscribe({
      next: (data: PayslipItem[]) => {
        this.isLoading = false;
        this.payrolls = Array.isArray(data) ? data : [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load payroll records. Please try again.';
        console.error('Failed to load payroll', err);
        this.cdr.markForCheck();
      },
    });
  }

  get availableYears(): number[] {
    const years = new Set<number>();
    this.payrolls.forEach((p) => {
      if (p.year) years.add(p.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }

  get filteredPayrolls(): PayslipItem[] {
    return this.payrolls.filter((p) => {
      const matchesYear =
        this.selectedYear === 'ALL' || p.year.toString() === this.selectedYear;
      const monthName = this.getMonthName(p.month).toLowerCase();
      const q = this.searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        monthName.includes(q) ||
        p.year.toString().includes(q) ||
        (p.netSalary && p.netSalary.toString().includes(q));
      return matchesYear && matchesSearch;
    });
  }

  get latestPayroll(): PayslipItem | null {
    return this.payrolls.length > 0 ? this.payrolls[0] : null;
  }

  get ytdNetTotal(): number {
    const currentYear = new Date().getFullYear();
    return this.payrolls
      .filter((p) => p.year === currentYear)
      .reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);
  }

  get totalGrossRecent(): number {
    return this.latestPayroll ? Number(this.latestPayroll.grossSalary) || 0 : 0;
  }

  get totalDeductionRecent(): number {
    if (!this.latestPayroll) return 0;
    return (
      Number(this.latestPayroll.totalDeduction) ||
      Number(this.latestPayroll.deductions) ||
      0
    );
  }

  openPayslip(slip: PayslipItem): void {
    this.selectedPayslip = slip;
    this.cdr.markForCheck();
  }

  closePayslip(): void {
    this.selectedPayslip = null;
    this.cdr.markForCheck();
  }

  printPayslip(): void {
    window.print();
  }

  getMonthName(monthNum: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[monthNum - 1] || `Month ${monthNum}`;
  }
}
