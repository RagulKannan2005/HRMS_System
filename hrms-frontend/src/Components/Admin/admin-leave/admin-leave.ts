import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../service/admin.service';

@Component({
  selector: 'app-admin-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-leave.html',
  styleUrl: './admin-leave.css',
})
export class AdminLeave implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  rawLeaves: any[] = [];
  leaveList: any[] = [];
  selectedLeave: any = null;

  searchTerm: string = '';
  selectedLeaveType: string = '';
  selectedStatus: string = '';
  isLoading: boolean = false;

  ngOnInit(): void {
    this.loadLeaveDetails();
  }

  loadLeaveDetails(): void {
    this.fetchLeavesByStatus(this.selectedStatus);
  }

  fetchLeavesByStatus(status: string): void {
    this.isLoading = true;
    this.adminService.getLeaveBystatus(status).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.rawLeaves = Array.isArray(response) ? response : [];
        this.applyFilters();

        // Maintain selection or select first
        if (this.selectedLeave) {
          const match = this.rawLeaves.find((l) => l.id === this.selectedLeave.id);
          this.selectedLeave = match || this.leaveList[0] || null;
        } else {
          this.selectedLeave = this.leaveList[0] || null;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching leaves:', err);
        this.rawLeaves = [];
        this.leaveList = [];
        this.selectedLeave = null;
        this.cdr.detectChanges();
      },
    });
  }

  filteredLeves(event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.selectedStatus = status;
    this.fetchLeavesByStatus(status);
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value || '';
    this.applyFilters();
  }

  onLeaveTypeChange(event: Event): void {
    this.selectedLeaveType = (event.target as HTMLSelectElement).value || '';
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.rawLeaves];

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.trim().toLowerCase();
      result = result.filter(
        (l) =>
          (l.employeeName && l.employeeName.toLowerCase().includes(q)) ||
          (l.managerName && l.managerName.toLowerCase().includes(q)) ||
          (l.employeeId != null && l.employeeId.toString().includes(q)) ||
          (l.id != null && l.id.toString().includes(q)) ||
          (l.reason && l.reason.toLowerCase().includes(q))
      );
    }

    if (this.selectedLeaveType) {
      result = result.filter(
        (l) => l.leaveType && l.leaveType.toLowerCase() === this.selectedLeaveType.toLowerCase()
      );
    }

    this.leaveList = result;

    if (this.selectedLeave && !this.leaveList.some((l) => l.id === this.selectedLeave.id)) {
      this.selectedLeave = this.leaveList[0] || null;
    }
  }

  selectLeave(item: any): void {
    this.selectedLeave = item;
    this.cdr.detectChanges();
  }

  onApproveLeave(id: number): void {
    this.adminService.approveLeave(id).subscribe({
      next: () => {
        this.loadLeaveDetails();
      },
      error: (err) => console.error('Error approving leave:', err),
    });
  }

  onRejectLeave(id: number): void {
    this.adminService.rejectLeave(id).subscribe({
      next: () => {
        this.loadLeaveDetails();
      },
      error: (err) => console.error('Error rejecting leave:', err),
    });
  }

  getInitials(name: string | null | undefined): string {
    if (!name || !name.trim()) return 'EM';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
