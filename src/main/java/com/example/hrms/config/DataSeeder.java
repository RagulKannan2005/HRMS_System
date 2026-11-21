package com.example.hrms.config;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.hrms.Entity.*;
import com.example.hrms.Enums.*;
import com.example.hrms.Repository.*;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepo;
    private final DesignationRepository designationRepo;
    private final EmployeeRepository employeeRepo;
    private final UserRepository userRepo;
    private final SalaryRepository salaryRepo;
    private final LeaveBalanceRepository leaveBalanceRepo;
    private final LeaveRequestRepository leaveRequestRepo;
    private final AttendanceRepository attendanceRepo;
    private final PayrollRepository payrollRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Only seed if not already seeded with corporate dataset
        if (employeeRepo.count() >= 12) {
            log.info("HRMS Database already contains corporate sample data ({} employees).", employeeRepo.count());
            return;
        }

        log.info("===========================================================");
        log.info("STARTING CORPORATE SAMPLE DATA SEEDING FOR HRMS SYSTEM");
        log.info("===========================================================");

        String defaultHashedPassword = passwordEncoder.encode("Password@123");

        // 1. SEED DEPARTMENTS
        Department engDept = getOrCreateDepartment("Engineering & Technology");
        Department hrDept = getOrCreateDepartment("Human Resources");
        Department finDept = getOrCreateDepartment("Finance & Accounting");
        Department prdDept = getOrCreateDepartment("Product & Design");
        Department mktDept = getOrCreateDepartment("Sales & Marketing");
        Department opsDept = getOrCreateDepartment("Customer Operations");

        // 2. SEED DESIGNATIONS
        Designation desEngDir = getOrCreateDesignation("Engineering Director");
        Designation desSrFullStack = getOrCreateDesignation("Senior Full Stack Engineer");
        Designation desSrBackend = getOrCreateDesignation("Senior Backend Engineer");
        Designation desFrontend = getOrCreateDesignation("Frontend Specialist");
        Designation desDevOps = getOrCreateDesignation("DevOps & Cloud Engineer");
        Designation desQaLead = getOrCreateDesignation("QA Automation Lead");

        Designation desHrDir = getOrCreateDesignation("HR Director");
        Designation desTalentSpec = getOrCreateDesignation("Senior Talent Acquisition Specialist");
        Designation desHrOps = getOrCreateDesignation("HR Operations Executive");

        Designation desFinDir = getOrCreateDesignation("Finance Director");
        Designation desSrAnalyst = getOrCreateDesignation("Senior Financial Analyst");
        Designation desPayrollSpec = getOrCreateDesignation("Payroll & Compliance Specialist");

        Designation desVpSales = getOrCreateDesignation("VP of Sales & Marketing");
        Designation desAcctExec = getOrCreateDesignation("Enterprise Account Executive");

        Designation desLeadPm = getOrCreateDesignation("Lead Product Manager");
        Designation desSrUiUx = getOrCreateDesignation("Senior UI/UX Designer");

        // 3. SEED OR UPDATE ADMIN USER
        User admin = userRepo.findByEmail("admin@hrms.com").orElse(null);
        if (admin == null) {
            admin = User.builder()
                    .email("admin@hrms.com")
                    .username("admin@hrms.com")
                    .password(defaultHashedPassword)
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepo.save(admin);
        } else {
            admin.setPassword(defaultHashedPassword);
            userRepo.save(admin);
        }

        // 4. SEED MANAGERS
        Employee mgrSarah = seedEmployee("MGR-ENG-01", "Sarah Jenkins", "sarah.jenkins@hrms.com",
                "+91 98765 43210", "FEMALE", LocalDate.of(1985, 4, 12), LocalDate.of(2021, 3, 15),
                "HDFC0001234", "987654321012", engDept, desEngDir, null,
                Role.MANAGER, defaultHashedPassword,
                BigDecimal.valueOf(120000), BigDecimal.valueOf(30000), BigDecimal.valueOf(20000));

        Employee mgrPriya = seedEmployee("MGR-HR-01", "Priya Sharma", "priya.sharma@hrms.com",
                "+91 98765 43211", "FEMALE", LocalDate.of(1988, 8, 20), LocalDate.of(2021, 6, 1),
                "ICIC0002345", "987654321013", hrDept, desHrDir, null,
                Role.MANAGER, defaultHashedPassword,
                BigDecimal.valueOf(100000), BigDecimal.valueOf(25000), BigDecimal.valueOf(15000));

        Employee mgrDavid = seedEmployee("MGR-FIN-01", "David Ross", "david.ross@hrms.com",
                "+91 98765 43212", "MALE", LocalDate.of(1982, 11, 5), LocalDate.of(2020, 1, 10),
                "SBIN0003456", "987654321014", finDept, desFinDir, null,
                Role.MANAGER, defaultHashedPassword,
                BigDecimal.valueOf(110000), BigDecimal.valueOf(28000), BigDecimal.valueOf(18000));

        Employee mgrMarcus = seedEmployee("MGR-MKT-01", "Marcus Vance", "marcus.vance@hrms.com",
                "+91 98765 43213", "MALE", LocalDate.of(1986, 2, 18), LocalDate.of(2021, 9, 1),
                "AXIS0004567", "987654321015", mktDept, desVpSales, null,
                Role.MANAGER, defaultHashedPassword,
                BigDecimal.valueOf(115000), BigDecimal.valueOf(28000), BigDecimal.valueOf(17000));

        // 5. SEED EMPLOYEES (TEAM REPORTS)
        // Engineering Team under Sarah
        Employee empAarav = seedEmployee("EMP-ENG-101", "Aarav Patel", "aarav.patel@hrms.com",
                "+91 91234 56701", "MALE", LocalDate.of(1994, 5, 14), LocalDate.of(2022, 2, 1),
                "HDFC0001234", "912345670101", engDept, desSrBackend, mgrSarah,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(65000), BigDecimal.valueOf(15000), BigDecimal.valueOf(8000));

        Employee empElena = seedEmployee("EMP-ENG-102", "Elena Rostova", "elena.rostova@hrms.com",
                "+91 91234 56702", "FEMALE", LocalDate.of(1993, 9, 22), LocalDate.of(2022, 4, 15),
                "HDFC0001234", "912345670102", engDept, desSrFullStack, mgrSarah,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(70000), BigDecimal.valueOf(16000), BigDecimal.valueOf(9000));

        Employee empKavita = seedEmployee("EMP-ENG-103", "Kavita Nair", "kavita.nair@hrms.com",
                "+91 91234 56703", "FEMALE", LocalDate.of(1996, 12, 8), LocalDate.of(2023, 1, 10),
                "ICIC0002345", "912345670103", engDept, desFrontend, mgrSarah,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(55000), BigDecimal.valueOf(12000), BigDecimal.valueOf(6000));

        Employee empLiam = seedEmployee("EMP-ENG-104", "Liam O'Connor", "liam.oconnor@hrms.com",
                "+91 91234 56704", "MALE", LocalDate.of(1992, 7, 30), LocalDate.of(2022, 8, 1),
                "SBIN0003456", "912345670104", engDept, desDevOps, mgrSarah,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(60000), BigDecimal.valueOf(14000), BigDecimal.valueOf(7000));

        Employee empNeha = seedEmployee("EMP-ENG-105", "Neha Gupta", "neha.gupta@hrms.com",
                "+91 91234 56705", "FEMALE", LocalDate.of(1995, 3, 18), LocalDate.of(2023, 5, 2),
                "AXIS0004567", "912345670105", engDept, desQaLead, mgrSarah,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(50000), BigDecimal.valueOf(11000), BigDecimal.valueOf(5000));

        // HR Team under Priya
        Employee empRahul = seedEmployee("EMP-HR-201", "Rahul Verma", "rahul.verma@hrms.com",
                "+91 91234 56706", "MALE", LocalDate.of(1994, 10, 10), LocalDate.of(2022, 11, 15),
                "HDFC0001234", "912345670106", hrDept, desTalentSpec, mgrPriya,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(45000), BigDecimal.valueOf(10000), BigDecimal.valueOf(5000));

        Employee empAnanya = seedEmployee("EMP-HR-202", "Ananya Sen", "ananya.sen@hrms.com",
                "+91 91234 56707", "FEMALE", LocalDate.of(1997, 6, 25), LocalDate.of(2023, 8, 1),
                "ICIC0002345", "912345670107", hrDept, desHrOps, mgrPriya,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(38000), BigDecimal.valueOf(8000), BigDecimal.valueOf(4000));

        // Finance Team under David
        Employee empVikram = seedEmployee("EMP-FIN-301", "Vikram Malhotra", "vikram.malhotra@hrms.com",
                "+91 91234 56708", "MALE", LocalDate.of(1991, 1, 19), LocalDate.of(2021, 12, 1),
                "SBIN0003456", "912345670108", finDept, desSrAnalyst, mgrDavid,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(58000), BigDecimal.valueOf(13000), BigDecimal.valueOf(6000));

        Employee empPooja = seedEmployee("EMP-FIN-302", "Pooja Reddy", "pooja.reddy@hrms.com",
                "+91 91234 56709", "FEMALE", LocalDate.of(1996, 11, 12), LocalDate.of(2023, 3, 20),
                "HDFC0001234", "912345670109", finDept, desPayrollSpec, mgrDavid,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(42000), BigDecimal.valueOf(9000), BigDecimal.valueOf(4000));

        // Sales & Product Team under Marcus
        Employee empSophia = seedEmployee("EMP-MKT-401", "Sophia Martinez", "sophia.martinez@hrms.com",
                "+91 91234 56710", "FEMALE", LocalDate.of(1993, 4, 3), LocalDate.of(2022, 7, 1),
                "AXIS0004567", "912345670110", mktDept, desAcctExec, mgrMarcus,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(52000), BigDecimal.valueOf(12000), BigDecimal.valueOf(10000));

        Employee empDaniel = seedEmployee("EMP-PRD-501", "Daniel Kim", "daniel.kim@hrms.com",
                "+91 91234 56711", "MALE", LocalDate.of(1990, 8, 16), LocalDate.of(2022, 1, 15),
                "ICIC0002345", "912345670111", prdDept, desLeadPm, mgrMarcus,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(68000), BigDecimal.valueOf(15000), BigDecimal.valueOf(8000));

        Employee empZara = seedEmployee("EMP-PRD-502", "Zara Al-Mansoor", "zara.mansoor@hrms.com",
                "+91 91234 56712", "FEMALE", LocalDate.of(1995, 2, 28), LocalDate.of(2023, 4, 10),
                "HDFC0001234", "912345670112", prdDept, desSrUiUx, mgrMarcus,
                Role.EMPLOYEE, defaultHashedPassword,
                BigDecimal.valueOf(50000), BigDecimal.valueOf(11000), BigDecimal.valueOf(6000));

        // Also update existing accounts if any to ensure uniform password
        userRepo.findAll().forEach(u -> {
            u.setPassword(defaultHashedPassword);
            userRepo.save(u);
        });

        // 6. SEED REALISTIC LEAVE REQUESTS
        seedLeave(empAarav, LeaveType.CASUAL, LocalDate.of(2026, 11, 25), LocalDate.of(2026, 11, 27),
                3, "Attending family wedding ceremony in hometown", LeaveStatus.PENDING);
        seedLeave(empElena, LeaveType.SICK, LocalDate.of(2026, 11, 4), LocalDate.of(2026, 11, 5),
                2, "Recovering from acute viral fever and seasonal flu", LeaveStatus.APPROVED);
        seedLeave(empKavita, LeaveType.EARNED, LocalDate.of(2026, 12, 22), LocalDate.of(2026, 12, 26),
                5, "Year-end annual holiday with family", LeaveStatus.PENDING);
        seedLeave(empLiam, LeaveType.CASUAL, LocalDate.of(2026, 11, 10), LocalDate.of(2026, 11, 10),
                1, "Personal bank documentation and property registration", LeaveStatus.APPROVED);
        seedLeave(empNeha, LeaveType.EARNED, LocalDate.of(2026, 11, 14), LocalDate.of(2026, 11, 18),
                5, "Personal holiday during critical release freeze period", LeaveStatus.REJECTED);

        seedLeave(empRahul, LeaveType.CASUAL, LocalDate.of(2026, 11, 27), LocalDate.of(2026, 11, 28),
                2, "Attending HR Tech national conference in Bangalore", LeaveStatus.PENDING);
        seedLeave(empVikram, LeaveType.CASUAL, LocalDate.of(2026, 10, 14), LocalDate.of(2026, 10, 15),
                2, "Attending family engagement ceremony", LeaveStatus.APPROVED);
        seedLeave(empSophia, LeaveType.SICK, LocalDate.of(2026, 11, 24), LocalDate.of(2026, 11, 24),
                1, "Root canal dental surgery and clinical follow-up", LeaveStatus.PENDING);
        seedLeave(empDaniel, LeaveType.EARNED, LocalDate.of(2026, 10, 20), LocalDate.of(2026, 10, 24),
                5, "Annual vacation with spouse and kids", LeaveStatus.APPROVED);
        seedLeave(empZara, LeaveType.CASUAL, LocalDate.of(2026, 11, 26), LocalDate.of(2026, 11, 27),
                2, "Apartment relocation and moving formalities", LeaveStatus.PENDING);

        // Manager leaves to Admin
        seedLeave(mgrSarah, LeaveType.EARNED, LocalDate.of(2026, 12, 15), LocalDate.of(2026, 12, 19),
                5, "Annual engineering leadership retreat & vacation", LeaveStatus.PENDING);
        seedLeave(mgrPriya, LeaveType.CASUAL, LocalDate.of(2026, 10, 5), LocalDate.of(2026, 10, 6),
                2, "Attending sister's graduation ceremony", LeaveStatus.APPROVED);

        // 7. SEED ATTENDANCE RECORDS (Past few days of November 2026)
        List<Employee> allEmployees = employeeRepo.findAll();
        LocalDate[] workingDates = {
                LocalDate.of(2026, 11, 17),
                LocalDate.of(2026, 11, 18),
                LocalDate.of(2026, 11, 19),
                LocalDate.of(2026, 11, 20),
                LocalDate.of(2026, 11, 21)
        };

        for (LocalDate d : workingDates) {
            for (Employee e : allEmployees) {
                if (attendanceRepo.existsByEmployee_IdAndDate(e.getId(), d)) {
                    continue;
                }
                // Random variation for realism: 85% on time, 10% late, 5% on leave
                int hash = (e.getId().intValue() * 31 + d.getDayOfMonth()) % 100;
                if (hash < 10) {
                    // Late arrival
                    seedAttendance(e, d, LocalTime.of(9, 18), LocalTime.of(18, 20), AttendanceStatus.PRESENT,
                            482, 60, 0, 18, 0);
                } else if (hash < 18) {
                    // Overtime day
                    seedAttendance(e, d, LocalTime.of(8, 50), LocalTime.of(19, 25), AttendanceStatus.PRESENT,
                            575, 60, 95, 0, 0);
                } else {
                    // Punctual day
                    seedAttendance(e, d, LocalTime.of(8, 55), LocalTime.of(18, 05), AttendanceStatus.PRESENT,
                            490, 60, 10, 0, 0);
                }
            }
        }

        // 8. SEED HISTORICAL PAYROLLS (Sept, Oct, Nov 2026)
        for (Employee e : allEmployees) {
            List<EmployeeSalary> salaries = salaryRepo.findByEmployee_Id(e.getId());
            if (salaries.isEmpty()) continue;
            EmployeeSalary sal = salaries.get(0);
            BigDecimal gross = sal.getBasicSalary().add(sal.getHra()).add(sal.getOtherAllowance());
            BigDecimal pf = sal.getBasicSalary().multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal tax = gross.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalDeduction = pf.add(tax);
            BigDecimal net = gross.subtract(totalDeduction);

            seedPayroll(e, 9, 2026, gross, totalDeduction, BigDecimal.ZERO, tax, pf, totalDeduction, net);
            seedPayroll(e, 10, 2026, gross, totalDeduction, BigDecimal.ZERO, tax, pf, totalDeduction, net);
            seedPayroll(e, 11, 2026, gross, totalDeduction, BigDecimal.ZERO, tax, pf, totalDeduction, net);
        }

        log.info("===========================================================");
        log.info("CORPORATE SAMPLE DATA SUCCESSFULLY SEEDED!");
        log.info("All user passwords set to: Password@123");
        log.info("Admin Account:   admin@hrms.com / Password@123");
        log.info("Manager (Eng):   sarah.jenkins@hrms.com / Password@123");
        log.info("Manager (HR):    priya.sharma@hrms.com / Password@123");
        log.info("Manager (Fin):   david.ross@hrms.com / Password@123");
        log.info("Manager (Sales): marcus.vance@hrms.com / Password@123");
        log.info("Employee (Eng):  aarav.patel@hrms.com / Password@123");
        log.info("===========================================================");
    }

    private Department getOrCreateDepartment(String name) {
        return departmentRepo.findByName(name).orElseGet(() ->
                departmentRepo.save(Department.builder().name(name).build())
        );
    }

    private Designation getOrCreateDesignation(String title) {
        return designationRepo.findByTitle(title).orElseGet(() ->
                designationRepo.save(Designation.builder().title(title).build())
        );
    }

    private Employee seedEmployee(String code, String name, String email, String phone,
                                 String gender, LocalDate dob, LocalDate joiningDate,
                                 String ifsc, String bankAccount, Department dept, Designation desig,
                                 Employee manager, Role role, String passwordHash,
                                 BigDecimal basic, BigDecimal hra, BigDecimal otherAllowance) {
        Employee emp = employeeRepo.findByEmail(email).orElse(null);
        if (emp == null) {
            emp = Employee.builder()
                    .employeeCode(code)
                    .employeeName(name)
                    .email(email)
                    .phone(phone)
                    .gender(gender)
                    .dateOfBirth(dob)
                    .joiningDate(joiningDate)
                    .employeeStatus(EmployeeStatus.ACTIVE)
                    .ifsc(ifsc)
                    .bankAccountNumber(bankAccount)
                    .department(dept)
                    .designation(desig)
                    .manager(manager)
                    .build();
            emp = employeeRepo.save(emp);
        }

        // Seed / Update User Login
        Employee finalEmp = emp;
        User user = userRepo.findByEmail(email).orElseGet(() ->
                User.builder()
                        .email(email)
                        .username(email)
                        .password(passwordHash)
                        .role(role)
                        .enabled(true)
                        .employeeId(finalEmp.getId())
                        .build()
        );
        user.setPassword(passwordHash);
        user.setRole(role);
        user.setEnabled(true);
        user.setEmployeeId(emp.getId());
        userRepo.save(user);

        // Seed Salary
        List<EmployeeSalary> existingSal = salaryRepo.findByEmployee_Id(emp.getId());
        if (existingSal.isEmpty()) {
            EmployeeSalary salary = EmployeeSalary.builder()
                    .employee(emp)
                    .basicSalary(basic)
                    .hra(hra)
                    .otherAllowance(otherAllowance)
                    .pfPercent(BigDecimal.valueOf(12.00))
                    .taxPercent(BigDecimal.valueOf(5.00))
                    .effectiveFrom(joiningDate)
                    .createdAt(LocalDateTime.now())
                    .build();
            salaryRepo.save(salary);
        }

        // Seed 2026 Leave Balances
        seedLeaveBalance(emp, LeaveType.CASUAL, 12, 2, 2026);
        seedLeaveBalance(emp, LeaveType.SICK, 12, 1, 2026);
        seedLeaveBalance(emp, LeaveType.EARNED, 18, 0, 2026);
        seedLeaveBalance(emp, LeaveType.MATERNITY, 182, 0, 2026);

        return emp;
    }

    private void seedLeaveBalance(Employee emp, LeaveType type, int totalDays, int usedDays, int year) {
        if (!leaveBalanceRepo.findByEmployeeId_AndLeaveTypeAndYear(emp.getId(), type, year).isPresent()) {
            leaveBalanceRepo.save(LeaveBalance.builder()
                    .employee(emp)
                    .leaveType(type)
                    .totalDays(totalDays)
                    .usedDays(usedDays)
                    .year(year)
                    .build());
        }
    }

    private void seedLeave(Employee emp, LeaveType type, LocalDate from, LocalDate to,
                           int days, String reason, LeaveStatus status) {
        if (leaveRequestRepo.existsOverlappingLeave(emp.getId(), from, to,
                List.of(LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED))) {
            return;
        }
        leaveRequestRepo.save(LeaveRequest.builder()
                .employee(emp)
                .leaveType(type)
                .fromDate(from)
                .toDate(to)
                .numberOfDays(days)
                .reason(reason)
                .status(status)
                .build());
    }

    private void seedAttendance(Employee emp, LocalDate date, LocalTime checkin, LocalTime checkout,
                                AttendanceStatus status, int workMin, int breakMin, int otMin,
                                int lateMin, int earlyMin) {
        attendanceRepo.save(Attendance.builder()
                .employee(emp)
                .date(date)
                .checkin(checkin)
                .checkout(checkout)
                .status(status)
                .workMinutes(workMin)
                .breakMinutes(breakMin)
                .overtimeMinutes(otMin)
                .lateMinutes(lateMin)
                .earlyMinutes(earlyMin)
                .build());
    }

    private void seedPayroll(Employee emp, int month, int year, BigDecimal gross,
                             BigDecimal deductions, BigDecimal leaveDed, BigDecimal tax,
                             BigDecimal pf, BigDecimal totalDed, BigDecimal net) {
        if (payrollRepo.findByEmployeeIdAndMonthAndYear(emp.getId(), month, year).isPresent()) {
            return;
        }
        Payroll p = new Payroll();
        p.setEmployee(emp);
        p.setMonth(month);
        p.setYear(year);
        p.setGrossSalary(gross);
        p.setDeductions(deductions);
        p.setLeaveDeduction(leaveDed);
        p.setTax(tax);
        p.setPf(pf);
        p.setTotalDeduction(totalDed);
        p.setNetSalary(net);
        payrollRepo.save(p);
    }
}
