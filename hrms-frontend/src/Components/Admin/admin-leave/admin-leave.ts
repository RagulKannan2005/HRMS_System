import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../../service/admin.service';

@Component({
  selector: 'app-admin-leave',
  imports: [CommonModule],
  templateUrl: './admin-leave.html',
  styleUrl: './admin-leave.css',
})
export class AdminLeave implements OnInit {

  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);


  ngOnInit(): void {
    this.loadLeaveDetails();
  }

  showLeaveForm: boolean = false;
  pendingLeaveList: any[] = []


  loadLeaveDetails(): void {
    this.loadpendingLeaves();
  }
  loadpendingLeaves(): void {
    this.adminService.getPendingLeaves().subscribe({
      next: (leaves) => {
        console.log("Fetch leaves :", leaves);
        this.pendingLeaveList = leaves || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching pending leaves', err),

    });
  }

  onApproveLeave(id: number): void {
    this.adminService.approveLeave(id).subscribe({
      next: () => this.loadpendingLeaves(),
      error: (err) => console.error('Error approving leave:', err),
    });
  }

  onRejectLeave(id: number): void {
    this.adminService.rejectLeave(id).subscribe({
      next: () => this.loadpendingLeaves(),
      error: (err) => console.error('Error rejecting leave', err),
    });
  }

  leaveList:any[]=[];

  filteredLeves(event:Event){
    const status=(event.target as HTMLSelectElement).value;

    this.adminService.getLeaveBystatus(status).subscribe({
      next:(response)=>{
        this.leaveList=response;
        console.log('Filtered Leaves: ',response);
        this.cdr.detectChanges()
      },
      error:(error)=>{
        console.error('Error fetching leaves : ',error);
      }

    })
  }
  

}
