package com.example.hrms.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hrms.Dto.EmployeeRequestDto;
import com.example.hrms.Dto.EmployeeResponseDto;
import com.example.hrms.Service.ManagerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/manager")
public class ManagerController {

    private final ManagerService managerservice;


    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping("/create-employee")
    public ResponseEntity<EmployeeResponseDto> createemployee(@RequestBody @Valid EmployeeRequestDto emp){
        EmployeeResponseDto res=managerservice.createEmployee(emp);
        return ResponseEntity.ok(res);
    }
    
}
