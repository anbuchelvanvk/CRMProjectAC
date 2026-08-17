-- Schema for Employee Management Module

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    role TEXT DEFAULT 'Employee',
    joinDate TIMESTAMP WITH TIME ZONE DEFAULT now(),
    birthDate TIMESTAMP WITH TIME ZONE,
    salary NUMERIC NOT NULL,
    avatarUrl TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employeeId UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    checkIn TIMESTAMP WITH TIME ZONE,
    checkOut TIMESTAMP WITH TIME ZONE
);

-- 3. Permissions (Short Permissions/Time Off)
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employeeId UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    durationHours INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending'
);

-- 4. Salary Slips
CREATE TABLE IF NOT EXISTS public.salary_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employeeId UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    basic NUMERIC NOT NULL,
    allowances NUMERIC NOT NULL,
    deductions NUMERIC NOT NULL,
    netSalary NUMERIC NOT NULL,
    status TEXT DEFAULT 'Unpaid'
);

-- 5. Leave Balances
CREATE TABLE IF NOT EXISTS public.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employeeId UUID UNIQUE REFERENCES public.employees(id) ON DELETE CASCADE,
    annual INTEGER DEFAULT 14,
    sick INTEGER DEFAULT 7,
    casual INTEGER DEFAULT 7
);

-- 6. Leave Requests
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employeeId UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending'
);

-- 7. Documents (Employee specific)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employeeId UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    fileUrl TEXT NOT NULL,
    uploadedAt TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Performance Reviews
CREATE TABLE IF NOT EXISTS public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employeeId UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    reviewerId UUID,
    period TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comments TEXT NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. Assets
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employeeId UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    serialNo TEXT NOT NULL,
    assignedOn TIMESTAMP WITH TIME ZONE DEFAULT now(),
    returnedOn TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Assigned'
);

-- Create a function and trigger to auto-update updatedAt in employees
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updatedAt
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
