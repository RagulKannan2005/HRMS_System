import { Routes } from '@angular/router';
import { Login } from '../Authentication/login/login';
import { AdminDashboard } from '../Dashboards/admin-dashboard/admin-dashboard';
import { AdminHome } from '../Components/Admin/admin-home/admin-home';
import { Employees } from '../Components/Admin/employees/employees';
import { Departments } from '../Components/Admin/departments/departments';
import { Designation } from '../Components/Admin/designation/designation';
import { AdminAttendance } from '../Components/Admin/admin-attendance/admin-attendance';
import { AdminLeave } from '../Components/Admin/admin-leave/admin-leave';
import { Payroll } from '../Components/Admin/payroll/payroll';
import { EmployeeDashboard } from '../Dashboards/employee-dashboard/employee-dashboard';
import { EmployeeHome } from '../Components/Employee/employee-home/employee-home';
import { EmployeeAttendance } from '../Components/Employee/employee-attendance/employee-attendance';
import { EmployeeLeaves } from '../Components/Employee/employee-leaves/employee-leaves';
import { EmployeePayroll } from '../Components/Employee/employee-payroll/employee-payroll';
import { ManagerDashboard } from '../Dashboards/manager-dashboard/manager-dashboard';
import { ManagerHome } from '../Components/Manager/manager-home/manager-home';
import { ManagerTeam } from '../Components/Manager/manager-team/manager-team';
import { ManagerLeaveApprovals } from '../Components/Manager/manager-leave-approvals/manager-leave-approvals';
import { ManagerAttendance } from '../Components/Manager/manager-attendance/manager-attendance';
import { ManagerPayroll } from '../Components/Manager/manager-payroll/manager-payroll';
import { ManagerMyPortal } from '../Components/Manager/manager-my-portal/manager-my-portal';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  // {path:'register',component:Register}
  {
    path: 'admin',
    component: AdminDashboard,
    children: [
      { path: '', redirectTo: 'admin-home', pathMatch: 'full' },
      { path: 'admin-home', component: AdminHome },
      { path: 'employees', component: Employees },
      { path: 'department', component: Departments },
      { path: 'designation', component: Designation },
      { path: 'attendance', component: AdminAttendance },
      { path: 'admin-leave', component: AdminLeave },
      { path: 'admin-payroll', component: Payroll }
    ],
  },
  {
    path: 'employee',
    component: EmployeeDashboard,
    children: [
      { path: '', redirectTo: 'employee-home', pathMatch: 'full' },
      { path: 'employee-home', component: EmployeeHome },
      { path: 'attendance', component: EmployeeAttendance },
      { path: 'leaves', component: EmployeeLeaves },
      { path: 'payroll', component: EmployeePayroll },
    ],
  },
  { path: 'EmployeeDashboard', redirectTo: 'employee', pathMatch: 'full' },
  { path: 'ManagerDashboard', redirectTo: 'manager', pathMatch: 'full' },
  {
    path: 'manager',
    component: ManagerDashboard,
    children: [
      { path: '', redirectTo: 'manager-home', pathMatch: 'full' },
      { path: 'manager-home', component: ManagerHome },
      { path: 'team', component: ManagerTeam },
      { path: 'leave-approvals', component: ManagerLeaveApprovals },
      { path: 'attendance', component: ManagerAttendance },
      { path: 'payroll', component: ManagerPayroll },
      { path: 'my-portal', component: ManagerMyPortal },
    ],
  },
];
