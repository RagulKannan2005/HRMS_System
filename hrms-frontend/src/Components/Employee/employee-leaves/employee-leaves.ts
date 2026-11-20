import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeePortalService } from '../../../service/employee-portal';

@Component({
  selector: 'app-employee-leaves',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-leaves.html',
  styleUrl: './employee-leaves.css',
})
export class EmployeeLeaves implements OnInit {
  private fb = inject(FormBuilder);
  private portalService = inject(EmployeePortalService);
  private cdr = inject(ChangeDetectorRef);

  leaves: any[] = [];
  leaveTypes = ['CASUAL', 'SICK', 'EARNED', 'MATERNITY'];

  showApplyModal = false;
  isSubmitting = false;
  banner: { message: string; isError: boolean } | null = null;

  leaveForm: FormGroup = this.fb.group({
    leaveType: ['CASUAL', Validators.required],
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    this.loadMyLeaves();
  }

  loadMyLeaves(): void {
    this.portalService.getMyLeaves().subscribe({
      next: (data: any[]) => {
        this.leaves = Array.isArray(data) ? data : [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load leaves', err);
        this.cdr.markForCheck();
      },
    });
  }

  toggleApplyModal(show: boolean): void {
    this.showApplyModal = show;
    if (!show) {
      this.leaveForm.reset({ leaveType: 'CASUAL' });
    }
    this.cdr.markForCheck();
  }

  onSubmitLeave(): void {
    if (this.leaveForm.invalid) {
      this.showBanner('Please fill in all required fields.', true);
      return;
    }

    const { leaveType, fromDate, toDate, reason } = this.leaveForm.value;

    if (new Date(fromDate) > new Date(toDate)) {
      this.showBanner('From Date cannot be after To Date.', true);
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.portalService
      .applyLeave({ leaveType, fromDate, toDate, reason })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.showApplyModal = false;
          this.leaveForm.reset({ leaveType: 'CASUAL' });
          this.showBanner('Leave application submitted successfully!', false);
          this.loadMyLeaves();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Apply leave error body:', JSON.stringify(err?.error));
          let msg = 'Failed to submit leave.';
          if (typeof err?.error === 'string') {
            msg = err.error;
          } else if (err?.error?.message) {
            msg = err.error.message;
          } else if (err?.error?.error) {
            msg = err.error.error;
          } else if (err?.error && typeof err.error === 'object') {
            const values = Object.entries(err.error)
              .map(([key, val]) => `${key}: ${val}`)
              .join(' | ');
            msg = values || 'Bad request error';
          }
          this.showBanner(msg, true);
          this.cdr.markForCheck();
        },
      });
  }

  onCancelLeave(leaveId: number): void {
    if (!confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    this.portalService.cancelLeave(leaveId).subscribe({
      next: () => {
        this.showBanner('Leave cancelled successfully!', false);
        this.loadMyLeaves();
        this.cdr.markForCheck();
      },
      error: (err) => {
        const msg =
          err?.error?.message || err?.error || 'Failed to cancel leave.';
        this.showBanner(
          typeof msg === 'string' ? msg : 'Failed to cancel leave',
          true
        );
        this.cdr.markForCheck();
      },
    });
  }

  private showBanner(message: string, isError: boolean): void {
    this.banner = { message, isError };
    this.cdr.markForCheck();
    setTimeout(() => {
      this.banner = null;
      this.cdr.markForCheck();
    }, 4000);
  }
}
