export interface EmployeeModel {
  id?: number;
  employeeCode: string;
  employeeName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  joiningDate: string;
  employeeStatus?: string;
  bankAccountNumber: string;
  ifsc?: string;
  departmentId?: number;
  departmentName?: string;
  designationId?: number;
  designationName?: string;
  managerId?: number | null;
  managerName?: string | null;
  role?: string;
  basicSalary?: number;
  hra?: number;
  otherAllowance?: number;
  taxPercent?: number;
  pfPercent?: number;
  salaryEffectiveFrom?: string;
}

export interface EmployeeCreatePayload {
  employeeCode: string;
  employeeName: string;
  email: string;
  password?: string;
  phone: string;
  gender: string;
  dateOfBirth: string | null;
  joiningDate: string | null;
  bankAccountNumber: string;
  ifsc?: string;
  departmentId: number;
  designationId: number;
  managerId?: number | null;
  basicSalary: number;
  hra: number;
  otherAllowance: number;
  taxPercent: number;
  pfPercent: number;
  salaryEffectiveFrom: string | null;
}

