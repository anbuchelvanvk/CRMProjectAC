export type Department = 'Engineering' | 'Design' | 'Marketing' | 'HR' | 'Finance' | 'Sales';
export type EmploymentStatus = 'Active' | 'On Leave' | 'Terminated';
export type Role = 'Admin' | 'Manager' | 'Employee';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: Department;
  position: string;
  status: EmploymentStatus;
  role: Role;
  joinDate: string;
  salary: number;
  avatarUrl: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departmentsCount: number;
  averageSalary: number;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Half-Day';
  checkIn?: string;
  checkOut?: string;
  employee?: Employee;
}

export interface Permission {
  id: string;
  employeeId: string;
  date: string;
  durationHours: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  employee?: Employee;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basic: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Paid' | 'Unpaid';
  employee?: Employee;
}
