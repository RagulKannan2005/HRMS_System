import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  ngOnInit(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    this.leaveForm.fromDate = todayStr;
    this.leaveForm.toDate = todayStr;

    this.loadTodayAttendance();
    this.loadMyLeaves();
    this.loadMyPayroll();
  }

  loadTodayAttendance(): void {
    const today = new Date();
    const todayStr = today.toISOString().substring(0, 10);
    this.managerService.getTodayAttendance(todayStr).subscribe({
      next: (res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          this.todayAttendance = res[0];
        } else if (res && !Array.isArray(res)) {
          this.todayAttendance = res;
        } else {
          this.todayAttendance = null;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.todayAttendance = null;
      },
    });
  }

  onCheckIn(): void {
    this.isClocking = true;
    this.shiftMessage = null;
    this.managerService.checkIn().subscribe({
      next: (res) => {
        this.isClocking = false;
        this.todayAttendance = res;
        this.showShiftToast('Shift clocked in successfully!', false);
      },
      error: (err) => {
        this.isClocking = false;
        const msg = err?.error?.message || err?.error?.error || 'Check-in failed';
        this.showShiftToast(typeof msg === 'string' ? msg : 'Check-in failed', true);
      },
    });
  }

  onCheckOut(): void {
    this.isClocking = true;
    this.shiftMessage = null;
    this.managerService.checkOut().subscribe({
      next: (res) => {
        this.isClocking = false;
        this.todayAttendance = res;
        this.showShiftToast('Shift clocked out successfully!', false);
      },
      error: (err) => {
        this.isClocking = false;
        const msg = err?.error?.message || err?.error?.error || 'Check-out failed';
        this.showShiftToast(typeof msg === 'string' ? msg : 'Check-out failed', true);
      },
    });
  }

  loadMyLeaves(): void {
    this.managerService.getMyLeaves().subscribe({
      next: (data) => {
        this.myLeaves = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching personal leaves:', err),
    });
  }

  openApplyModal(): void {
    this.leaveError = null;
    this.leaveSuccess = null;
    this.showApplyModal = true;
  }

  closeApplyModal(): void {
    this.showApplyModal = false;
  }

  onSubmitLeave(): void {
    if (!this.leaveForm.fromDate || !this.leaveForm.toDate || !this.leaveForm.reason.trim()) {
      this.leaveError = 'Please fill out all fields.';
      return;
    }

    this.isApplying = true;
    this.leaveError = null;
    this.leaveSuccess = null;

    this.managerService.applyLeave(this.leaveForm).subscribe({
      next: () => {
        this.isApplying = false;
        this.leaveSuccess = 'Leave request submitted successfully for Admin review!';
        this.loadMyLeaves();
        setTimeout(() => {
          this.closeApplyModal();
        }, 1200);
      },
      error: (err) => {
        this.isApplying = false;
        this.leaveError = err?.error?.message || err?.error?.error || 'Failed to submit leave';
      },
    });
  }

  loadMyPayroll(): void {
    this.managerService.getMyPayroll().subscribe({
      next: (data) => {
        this.myPayrolls = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching personal payroll:', err),
    });
  }

  openPayslip(p: any): void {
    this.selectedPayslip = p;
    this.showPayslipModal = true;
  }

  closePayslip(): void {
    this.showPayslipModal = false;
    this.selectedPayslip = null;
  }

  printPayslip(): void {
    window.print();
  }

  private showShiftToast(msg: string, isError: boolean): void {
    this.shiftMessage = msg;
    this.shiftError = isError;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.shiftMessage = null;
      this.cdr.detectChanges();
    }, 4500);
  }
}
