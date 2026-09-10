package com.example.hrms.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.example.hrms.Entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.hrms.Dto.PayrollResponseDto;
import com.example.hrms.Entity.Attendance;
import com.example.hrms.Entity.EmployeeSalary;
import com.example.hrms.Entity.Payroll;
import com.example.hrms.Enums.AttendanceStatus;
import com.example.hrms.Exception.ResourceNotFoundException;
import com.example.hrms.Repository.AttendanceRepository;
import com.example.hrms.Repository.PayrollRepository;
import com.example.hrms.Repository.SalaryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollrepo;
    private final SalaryRepository salaryrepo;
    private final AttendanceRepository attendancerepo;

    public PayrollResponseDto generatePayroll(Long employeeId, Integer year, Integer month) {
        payrollrepo.findByEmployeeIdAndMonthAndYear(employeeId, month, year).ifPresent(payroll -> {
            throw new IllegalArgumentException("Payroll already generated for this month");
        });
        List<EmployeeSalary> salary = salaryrepo.findByEmployee_Id(employeeId);
        if (salary.isEmpty()) {
            throw new ResourceNotFoundException("Salary details not found for employee ID: " + employeeId);
        }
        EmployeeSalary salary1 = salary.get(0);

        BigDecimal grossSalary = salary1.getBasicSalary().add(salary1.getHra().add(salary1.getOtherAllowance()));

        List<Attendance> attendance = attendancerepo.findByEmployee_IdAndYearAndMonth(employeeId, year, month);
        long presentDays = attendance.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long onLeaveDays = attendance.stream().filter(a -> a.getStatus() == AttendanceStatus.ON_LEAVE).count();

        int totaldaysInMonth = YearMonth.of(year, month).lengthOfMonth();
        
        // Absent days = days in month where employee was neither PRESENT nor ON_LEAVE
        long absentDays = Math.max(0, totaldaysInMonth - (presentDays + onLeaveDays));

        BigDecimal dailyrate = grossSalary.divide(BigDecimal.valueOf(totaldaysInMonth), 2, RoundingMode.HALF_UP);
        BigDecimal leaveDeduction = dailyrate.multiply(BigDecimal.valueOf(absentDays));

        BigDecimal pfPercent = salary1.getPfPercent() != null ? salary1.getPfPercent() : BigDecimal.ZERO;
        BigDecimal taxPercent = salary1.getTaxPercent() != null ? salary1.getTaxPercent() : BigDecimal.ZERO;

        BigDecimal pf = salary1.getBasicSalary()
                .multiply(pfPercent)
        
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal tax = grossSalary.multiply(taxPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal totalDeduction = pf.add(tax).add(leaveDeduction);
        BigDecimal netSalary = grossSalary.subtract(totalDeduction);


        Payroll payroll=new Payroll();
        
        payroll.setEmployee(salary1.getEmployee());
        payroll.setMonth(month);
        payroll.setYear(year);
        payroll.setGrossSalary(grossSalary);
        payroll.setDeductions(totalDeduction);
        payroll.setPf(pf);
        payroll.setTax(tax);
        payroll.setLeaveDeduction(leaveDeduction);
        payroll.setTotalDeduction(totalDeduction);
        payroll.setNetSalary(netSalary);

        Payroll savedPayroll = payrollrepo.save(payroll);

        return PayrollResponseDto.builder()
                .id(savedPayroll.getId())
                .employeeName(salary1.getEmployee() != null ? salary1.getEmployee().getEmployeeName() : null)
                .month(month)
                .year(year)
                .grossSalary(grossSalary)
                .pf(pf)
                .tax(tax)
                .leaveDeduction(leaveDeduction)
                .deductions(totalDeduction)
                .totalDeduction(totalDeduction)
                .netSalary(netSalary)
                .processedAt(savedPayroll.getCreatedAt())
                .build();
        
    }

    public List<PayrollResponseDto> getPayrollByEmployeeId(Long employeeId){
        List<Payroll> payroll=payrollrepo.findByEmployee_Id(employeeId);
        if(payroll.isEmpty()){
            throw new ResourceNotFoundException("Payroll details not found for employee ID: " + employeeId);
        }
        return payroll.stream().map(payroll1 ->{
            return PayrollResponseDto.builder()
                    .id(payroll1.getId())
                    .employeeName(payroll1.getEmployee() != null ? payroll1.getEmployee().getEmployeeName() : null)
                    .month(payroll1.getMonth())
                    .year(payroll1.getYear())
                    .grossSalary(payroll1.getGrossSalary())
                    .pf(payroll1.getPf())
                    .tax(payroll1.getTax())
                    .leaveDeduction(payroll1.getLeaveDeduction())
                    .deductions(payroll1.getTotalDeduction())
                    .totalDeduction(payroll1.getTotalDeduction())
                    .netSalary(payroll1.getNetSalary())
                    .processedAt(payroll1.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

    }
    public List<PayrollResponseDto> getpayrollbyEmployeeId_Year_Month(Long employeeid,Integer month,Integer year){
        Optional<Payroll> payroll=payrollrepo.findByEmployeeIdAndMonthAndYear(employeeid, month, year);
        if(payroll.isEmpty()){
            throw new RuntimeException("There is no payroll is found with the is and the year and month");
        }
        return payroll.stream().map(payroll1->{
            return PayrollResponseDto.builder()
                    .id(payroll1.getId())
                    .employeeName(payroll1.getEmployee() != null ? payroll1.getEmployee().getEmployeeName() : null)
                    .month(payroll1.getMonth())
                    .year(payroll1.getYear())
                    .grossSalary(payroll1.getGrossSalary())
                    .pf(payroll1.getPf())
                    .tax(payroll1.getTax())
                    .leaveDeduction(payroll1.getLeaveDeduction())
                    .deductions(payroll1.getTotalDeduction())
                    .totalDeduction(payroll1.getTotalDeduction())
                    .netSalary(payroll1.getNetSalary())
                    .processedAt(payroll1.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    public List<PayrollResponseDto> getMyPayRoll(){
        Authentication authentication=SecurityContextHolder.getContext().getAuthentication();
        User user=(User)authentication.getPrincipal();

        Long employeeId=user.getEmployeeId();
        if (employeeId==null) {
            throw new RuntimeException("Employee profile not found");
            
        }
        List<Payroll> payrolls =
            payrollrepo.findByEmployee_IdOrderByYearDescMonthDesc(employeeId);

            return payrolls.stream().map(this::buildPayrollResponseDto)
            .collect(Collectors.toList());
    }

    private PayrollResponseDto buildPayrollResponseDto(Payroll payroll) {
        return PayrollResponseDto.builder()
                .id(payroll.getId())
                .employeeName(payroll.getEmployee() != null ? payroll.getEmployee().getEmployeeName() : null)
                .month(payroll.getMonth())
                .year(payroll.getYear())
                .grossSalary(payroll.getGrossSalary())
                .pf(payroll.getPf())
                .tax(payroll.getTax())
                .leaveDeduction(payroll.getLeaveDeduction())
                .deductions(payroll.getTotalDeduction())
                .totalDeduction(payroll.getTotalDeduction())
                .netSalary(payroll.getNetSalary())
                .processedAt(payroll.getCreatedAt())
                .build();
    }

}
