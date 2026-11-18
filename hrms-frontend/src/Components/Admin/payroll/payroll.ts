import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-payroll',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payroll.html',
  styleUrl: './payroll.css',
})
export class Payroll {

  // payrollForm = new FormGroup({
  //   name: new FormControl('', [
  //     Validators.required,
  //     Validators.minLength(5),
  //     Validators.maxLength(20)
  //   ]),
  //   email: new FormControl('', [
  //     Validators.required,
  //     Validators.email
  //   ]),
  //   salary: new FormControl('', [
  //     Validators.required,
  //     // Validators.
  //   ])

  //   // });

  //   employees = [
  //     { id: 1, name: 'Ragul', department: 'IT' },
  //     { id: 2, name: 'Arun', department: 'HR' },
  //     { id: 3, name: 'Kumar', department: 'IT' },
  //     { id: 4, name: 'Vijay', department: 'Finance' }
  //   ];
  //   filterEmployee: any[] = [...this.employees];

  //   searchText=''
  //   searchEmployee() {
  //   this.filterEmployee = this.employees.filter(emp =>
  //     emp.department.toLowerCase().includes(
  //       this.searchText.toLowerCase()
  //     )
  //   );
  // }

  // ngOnInit(): void {
  //   this.loadAllEmployee();
  // }
  // loadAllEmployee(){
  //     const data=this.employees;
  // }

  // submitForm(): void {
  //   if (this.payrollForm.valid) {

  //     const payrolldata = {
  //       id: Date.now(),
  //       ...this.payrollForm.value
  //     };
  //     this.employeeList.push(payrolldata);

  //     localStorage.setItem(
  //       'employee',
  //       JSON.stringify(this.employeeList)
  //     )

  //     this.payrollForm.reset();

  //     console.log("data saved successfully")

  //   }
  //   else {
  //     this.payrollForm.markAllAsTouched();
  //   }
  // }
  // loadEmployee() {
  //   const data = localStorage.getItem('employee')
  //   if (data) {
  //     try {
  //       const parsed = JSON.parse(data);
  //       if (Array.isArray(parsed)) {
  //         this.employeeList = parsed;
  //       } else if (parsed && typeof parsed === 'object') {
  //         this.employeeList = [parsed];
  //       } else {
  //         this.employeeList = []
  //       }
  //     } catch (err) {
  //       console.error('error parsing employee data:', err);
  //       this.employeeList = [];
  //     }
  //   } else {
  //     this.employeeList = []
  //   }
  // }



  // employee: any[] = []

  // employeeform = new FormGroup({
  //   id: new FormControl('', [
  //     Validators.required,
  //     Validators.minLength(1),
  //     // Validators.maxLength(3)
  //   ]),
  //   name: new FormControl('', [
  //     Validators.required,
  //     Validators.minLength(3),
  //   ]),
  //   department: new FormControl('', [
  //     Validators.required,
  //     Validators.minLength(2),
  //   ])

  // })

  // ngOnInit() {
  //   const employeedata = localStorage.getItem('employee')
  //   if (employeedata) {
  //     this.employee = JSON.parse(employeedata)
  //   }
  // }

  // onSubmit() {
  //   if (this.employeeform.valid) {

  //     this.employee.push(this.employeeform.value)
  //     localStorage.setItem('employee', JSON.stringify(this.employee))
  //     console.log(this.employee)
  //     this.employeeform.reset();
  //   }
  //   else {
  //     this.employeeform.markAllAsTouched();
  //   }
  // }

  // onEdit(id: number) {
  //   const data = this.employee.find(emp => emp.id === id)

  //   if (data) {
  //     this.employeeform.patchValue({
  //       id: data.id,
  //       name: data.name,
  //       department: data.department
  //     })
  //   }

  // }
  // editId: number | null = null;

  // OnUpdate() {
  //   if (this.employeeform.valid && this.editId !== null) {
  //     const updatedData = this.employeeform.value;

  //     this.employee = this.employee.map(emp => {
  //       if (emp.id === this.editId) {
  //         return {
  //           ...emp,
  //           ...updatedData
  //         };

  //       }
  //       localStorage.setItem('employee', JSON.stringify(this.employee))
  //       return emp;
  //     })
  //     this.editId = null;
  //     this.employeeform.reset();
  //   }
  //   else {
  //     this.employeeform.markAllAsTouched();
  //   }
  // }

  // onDelete(id: number) {
  //   this.employee = this.employee.filter(emp => emp.id !== id);
  //   localStorage.setItem('employee',JSON.stringify(this.employee))
  // }

  employees = [
    { id: 1, name: 'Ragul', department: 'IT', salary: 25000 },
    { id: 2, name: 'Arun', department: 'HR', salary: 40000 },
    { id: 3, name: 'Kumar', department: 'IT', salary: 55000 },
    { id: 4, name: 'Vijay', department: 'Finance', salary: 30000 }
  ];

  searchtext='';


  filteremployee:any[]=[...this.employees];

  searchname:string=''
  searchdepartment:string=''
  searchminsalary:number|null=null;

  filteremployees(){
    this.filteremployee=this.employees.filter(emp=>{
      const namematch=emp.name.toLowerCase().includes(this.searchname.toLowerCase());
      const departmentmatch=emp.department.toLowerCase().includes(this.searchdepartment.toLowerCase());
      const salarymatch=this.searchminsalary===null||emp.salary>=this.searchminsalary;
      return namematch && departmentmatch && salarymatch;
    })
  }

  // loadallemployees(){

  // }

}
