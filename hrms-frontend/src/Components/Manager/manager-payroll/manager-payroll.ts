import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ManagerService } from '../../../service/manager.service';

@Component({
  selector: 'app-manager-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-payroll.html',
  styleUrl: './manager-payroll.css',
})
export class ManagerPayroll implements OnInit {
  private managerService = inject(ManagerService);
  private cdr = inject(ChangeDetectorRef);

  teamMembers: any[] = [];
  salaries: any[] = [];
  selectedMemberId: number | null = null;
  selectedMemberPayrolls: any[] = [];

  // Generate Payroll form
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  isGenerating: boolean = false;
  toastMessage: string | null = null;
  toastError: boolean = false;

  // Payslip Modal
  showPayslipModal: boolean = false;
  selectedPayslip: any = null;

  isLoading: boolean = false;

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
    this.loadTeamAndSalaries();
  }

  loadTeamAndSalaries(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      team: this.managerService.getMyTeam().pipe(catchError(() => of([]))),
      salaries: this.managerService.getAllSalaries().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        this.teamMembers = res.team || [];
        this.salaries = res.salaries || [];
        if (this.teamMembers.length > 0) {
          this.selectedMemberId = this.teamMembers[0].id;
          this.loadPayrollsForSelected();
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching team for payroll:', err);
        this.cdr.markForCheck();
      },
    });
  }

  loadPayrollsForSelected(): void {
    if (!this.selectedMemberId) return;

    this.managerService.getPayrollByEmployeeId(this.selectedMemberId).subscribe({
      next: (data) => {
        this.selectedMemberPayrolls = data || [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.selectedMemberPayrolls = [];
        this.cdr.markForCheck();
      },
    });
  }

  onSelectMember(id: number): void {
    this.selectedMemberId = id;
    this.loadPayrollsForSelected();
  }

  onGeneratePayroll(): void {
    if (!this.selectedMemberId) {
      this.showToast('Please select a team member first', true);
      return;
    }

    this.isGenerating = true;
    this.toastMessage = null;
    this.cdr.markForCheck();

    this.managerService
      .generatePayroll(this.selectedMemberId, this.selectedYear, this.selectedMonth)
      .subscribe({
        next: (res) => {
          this.isGenerating = false;
          this.showToast(
            `Payroll successfully processed for ${res.employeeName || 'employee'}! Net Pay: ₹${res.netSalary}`,
            false,
          );
          this.loadPayrollsForSelected();
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

  openPayslip(payroll: any): void {
    this.selectedPayslip = payroll;
    this.showPayslipModal = true;
    this.cdr.markForCheck();
  }

  closePayslip(): void {
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
