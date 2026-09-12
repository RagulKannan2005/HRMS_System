import { Routes } from '@angular/router';
import { Login } from '../Authentication/login/login';
import { AdminDashboard } from '../Dashboards/admin-dashboard/admin-dashboard';
import { AdminHome } from '../Components/Admin/admin-home/admin-home';
import { Employees } from '../Components/Admin/employees/employees';
import { Departments } from '../Components/Admin/departments/departments';

export const routes: Routes = [
    {path:'',redirectTo:'login',pathMatch:'full'},
    {path:'login',component:Login},
    // {path:'register',component:Register}
    {
      path: 'admin',
      component: AdminDashboard,
      children: [
        { path: '', redirectTo: 'admin-home', pathMatch: 'full' },
        { path: 'admin-home', component: AdminHome },
        {path:'employees',component:Employees},
        {path:'department',component:Departments}
      ]
    }

];
