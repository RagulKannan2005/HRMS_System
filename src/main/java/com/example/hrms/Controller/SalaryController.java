package com.example.hrms.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hrms.Dto.EmployeeSalaryResponse;
import com.example.hrms.Entity.EmployeeSalary;
import com.example.hrms.Service.EmployeeSalaryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/employee/employeesalary")
@RequiredArgsConstructor
public class SalaryController {
    private final EmployeeSalaryService employeeSalaryService;

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/getAllEmployeeSalary")
    public ResponseEntity<List<EmployeeSalaryResponse>> getallemployeeSalary() {
        return ResponseEntity.ok(employeeSalaryService.getallemployeesalary());
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/getsalaryByEmployeeId/{id}")
    public ResponseEntity<List<EmployeeSalaryResponse>> getsalaryByEmployeeId(@PathVariable Long id) {
        return ResponseEntity.ok(employeeSalaryService.getSalaryByEmployeeId(id));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @GetMapping("/getBySalaryId/{id}")
    public ResponseEntity<EmployeeSalaryResponse> getsalaryById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeSalaryService.getSalaryById(id));
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @PutMapping("/updateEmployeeSalary/{id}")
    public ResponseEntity<EmployeeSalaryResponse> updateEmployeeSalary(
            @PathVariable Long id,
            @RequestBody @Valid EmployeeSalary updatedSalary) {
        return ResponseEntity.ok(employeeSalaryService.updateSalary(id, updatedSalary));
    }
}
