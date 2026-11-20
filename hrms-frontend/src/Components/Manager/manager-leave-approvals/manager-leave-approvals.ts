import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../service/manager.service';

@Component({
  selector: 'app-manager-leave-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-leave-approvals.html',
  styleUrl: './manager-leave-approvals.css',
})
export class ManagerLeaveApprovals implements OnInit {
  private managerService = inject(ManagerService);
  private cdr = inject(ChangeDetectorRef);

  selectedTab: string = 'PENDING'; // PENDING, APPROVED, REJECTED, ALL
  leaves: any[] = [];
  filteredLeaves: any[] = [];
  searchQuery: string = '';

  selectedLeave: any = null;
  selectedMemberBalances: any[] = [];
  isLoadingBalances: boolean = false;

  isLoading: boolean = false;
  isProcessing: boolean = false;
  feedbackMessage: string | null = null;
  feedbackError: boolean = false;

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves(): void {
    this.isLoading = true;
    const fetch$ =
      this.selectedTab === 'ALL'
        ? this.managerService.getLeavesByStatus('PENDING') // Fallback or aggregate
        : this.managerService.getLeavesByStatus(this.selectedTab);

    fetch$.subscribe({
      next: (data) => {
        this.isLoading = false;
        this.leaves = data || [];
        this.applyFilter();
        if (this.filteredLeaves.length > 0) {
          this.selectLeave(this.filteredLeaves[0]);
        } else {
          this.selectedLeave = null;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching leaves:', err);
        this.cdr.markForCheck();
      },
    });
  }

  onTabChange(tab: string): void {
    this.selectedTab = tab;
    this.loadLeaves();
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredLeaves = [...this.leaves];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredLeaves = this.leaves.filter(
        (l) =>
          (l.employeeName || '').toLowerCase().includes(q) ||
          (l.leaveType || '').toLowerCase().includes(q) ||
          (l.reason || '').toLowerCase().includes(q),
      );
    }
    this.cdr.markForCheck();
  }

  selectLeave(leave: any): void {
    this.selectedLeave = leave;
    this.selectedMemberBalances = [];
    this.cdr.markForCheck();

    if (leave?.employeeId) {
      this.isLoadingBalances = true;
      this.cdr.markForCheck();
      this.managerService.getEmployeeLeaveBalance(leave.employeeId).subscribe({
        next: (balances) => {
          this.isLoadingBalances = false;
          this.selectedMemberBalances = balances || [];
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoadingBalances = false;
          this.cdr.markForCheck();
        },
      });
    }
  }

  getRelevantBalance(leaveType: string): any {
    return this.selectedMemberBalances.find((b) => b.leaveType === leaveType);
  }

  onApprove(leave: any): void {
    if (!leave) return;
    this.isProcessing = true;
    this.feedbackMessage = null;
    this.cdr.markForCheck();

    this.managerService.approveLeave(leave.id).subscribe({
      next: () => {
        this.isProcessing = false;
        this.showToast(`Leave request #${leave.id} approved successfully!`, false);
        this.loadLeaves();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isProcessing = false;
        const msg = err?.error?.message || err?.error?.error || 'Approval failed';
        this.showToast(typeof msg === 'string' ? msg : 'Approval failed', true);
        this.cdr.markForCheck();
      },
    });
  }

  onReject(leave: any): void {
    if (!leave) return;
    this.isProcessing = true;
    this.feedbackMessage = null;
    this.cdr.markForCheck();

    this.managerService.rejectLeave(leave.id).subscribe({
      next: () => {
        this.isProcessing = false;
        this.showToast(`Leave request #${leave.id} rejected.`, false);
        this.loadLeaves();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isProcessing = false;
        const msg = err?.error?.message || err?.error?.error || 'Rejection failed';
        this.showToast(typeof msg === 'string' ? msg : 'Rejection failed', true);
        this.cdr.markForCheck();
      },
    });
  }

  private showToast(msg: string, isError: boolean): void {
    this.feedbackMessage = msg;
    this.feedbackError = isError;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.feedbackMessage = null;
      this.cdr.markForCheck();
    }, 4500);
  }
}
