package com.example.hrms.Controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

import com.example.hrms.Dto.PayrollResponseDto;
import com.example.hrms.Service.PayrollService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payroll/employee")
public class PayrollController {
    private final PayrollService payrollService;

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/generate")
    public ResponseEntity<PayrollResponseDto> generatePayroll(
            @RequestParam Long employeeId,
            @RequestParam Integer year,
            @RequestParam Integer month) {

        PayrollResponseDto response = payrollService.generatePayroll(employeeId, year, month);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/id")
    public ResponseEntity<List<PayrollResponseDto>> getPayrollById(@RequestParam Long employeeId) {
        List<PayrollResponseDto> response = payrollService.getPayrollByEmployeeId(employeeId);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/id/month/year")
    public ResponseEntity<List<PayrollResponseDto>> getpayrollbyEmployeeId_Year_Month(@RequestParam Long employeeid,
            Integer month, Integer year) {
        List<PayrollResponseDto> response = payrollService.getpayrollbyEmployeeId_Year_Month(employeeid, month, year);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER')")
    @GetMapping("/my-payroll")
    public ResponseEntity<List<PayrollResponseDto>> getMyPayroll() {

        return ResponseEntity.ok(
                payrollService.getMyPayRoll());
    }

}
