import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ManagerService } from '../../../service/manager.service';

@Component({
  selector: 'app-manager-my-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-my-portal.html',
  styleUrl: './manager-my-portal.css',
})
export class ManagerMyPortal implements OnInit {
  private managerService = inject(ManagerService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: string = 'leaves'; // 'leaves' | 'payroll' | 'attendance'

  // Personal Shift
  todayAttendance: any = null;
  isClocking: boolean = false;
  shiftMessage: string | null = null;
  shiftError: boolean = false;

  // Personal Leaves
  myLeaves: any[] = [];
  showApplyModal: boolean = false;
  isApplying: boolean = false;
  leaveError: string | null = null;
  leaveSuccess: string | null = null;

  leaveForm = {
    leaveType: 'CASUAL',
    fromDate: '',
    toDate: '',
    reason: '',
  };

  // Personal Payroll
  myPayrolls: any[] = [];
  selectedPayslip: any = null;
  showPayslipModal: boolean = false;
  isLoading: boolean = false;

  ngOnInit(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    this.leaveForm.fromDate = todayStr;
    this.leaveForm.toDate = todayStr;

    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    const todayStr = new Date().toISOString().substring(0, 10);

    forkJoin({
      attendance: this.managerService
        .getTodayAttendance(todayStr)
        .pipe(catchError(() => of(null))),
      leaves: this.managerService
        .getMyLeaves()
        .pipe(catchError(() => of([]))),
      payroll: this.managerService
        .getMyPayroll()
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        // Attendance
        const att = res.attendance;
        if (Array.isArray(att) && att.length > 0) {
          this.todayAttendance = att[0];
        } else if (att && !Array.isArray(att)) {
          this.todayAttendance = att;
        } else {
          this.todayAttendance = null;
        }

        // Leaves
        this.myLeaves = res.leaves || [];

        // Payroll
        this.myPayrolls = res.payroll || [];

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading my portal data:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onCheckIn(): void {
    this.isClocking = true;
    this.shiftMessage = null;
    this.cdr.markForCheck();

    this.managerService.checkIn().subscribe({
      next: (res) => {
        this.isClocking = false;
        this.todayAttendance = res;
        this.showShiftToast('Shift clocked in successfully!', false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isClocking = false;
        const msg = err?.error?.message || err?.error?.error || 'Check-in failed';
        this.showShiftToast(typeof msg === 'string' ? msg : 'Check-in failed', true);
        this.cdr.markForCheck();
      },
    });
  }

  onCheckOut(): void {
    this.isClocking = true;
    this.shiftMessage = null;
    this.cdr.markForCheck();

    this.managerService.checkOut().subscribe({
      next: (res) => {
        this.isClocking = false;
        this.todayAttendance = res;
        this.showShiftToast('Shift clocked out successfully!', false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isClocking = false;
        const msg = err?.error?.message || err?.error?.error || 'Check-out failed';
        this.showShiftToast(typeof msg === 'string' ? msg : 'Check-out failed', true);
        this.cdr.markForCheck();
      },
    });
  }

  loadMyLeaves(): void {
    this.managerService.getMyLeaves().subscribe({
      next: (data) => {
        this.myLeaves = data || [];
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error fetching personal leaves:', err),
    });
  }

  openApplyModal(): void {
    this.leaveError = null;
    this.leaveSuccess = null;
    this.showApplyModal = true;
    this.cdr.markForCheck();
  }

  closeApplyModal(): void {
    this.showApplyModal = false;
    this.cdr.markForCheck();
  }

  onSubmitLeave(): void {
    if (!this.leaveForm.fromDate || !this.leaveForm.toDate || !this.leaveForm.reason.trim()) {
      this.leaveError = 'Please fill out all fields.';
      this.cdr.markForCheck();
      return;
    }

    this.isApplying = true;
    this.leaveError = null;
    this.leaveSuccess = null;
    this.cdr.markForCheck();

    this.managerService.applyLeave(this.leaveForm).subscribe({
      next: () => {
        this.isApplying = false;
        this.leaveSuccess = 'Leave request submitted successfully for Admin review!';
        this.loadMyLeaves();
        this.cdr.markForCheck();
        setTimeout(() => {
          this.closeApplyModal();
        }, 1200);
      },
      error: (err) => {
        this.isApplying = false;
        this.leaveError = err?.error?.message || err?.error?.error || 'Failed to submit leave';
        this.cdr.markForCheck();
      },
    });
  }

  openPayslip(p: any): void {
    this.selectedPayslip = p;
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

  private showShiftToast(msg: string, isError: boolean): void {
    this.shiftMessage = msg;
    this.shiftError = isError;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.shiftMessage = null;
      this.cdr.markForCheck();
    }, 4500);
  }
}
