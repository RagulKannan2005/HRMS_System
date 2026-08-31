package com.example.hrms.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hrms.Dto.DepartmentRequestDto;
import com.example.hrms.Dto.DepartmentResponseDto;
import com.example.hrms.Dto.DesignationRequestDto;
import com.example.hrms.Dto.DesignationResponseDto;
import com.example.hrms.Dto.ManagerRequestDto;
import com.example.hrms.Dto.ManagerResponseDto;
// import com.example.hrms.Entity.Department;
import com.example.hrms.Service.AdminService;
import com.example.hrms.Service.ManagerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminContoller {
    private final AdminService adminService;
    private final ManagerService managerService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register-manager")
    public ResponseEntity<ManagerResponseDto> createManager(@RequestBody @Valid ManagerRequestDto request) {
        ManagerResponseDto manager = adminService.createManager(request);
        return ResponseEntity.ok(manager);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add-designation")
    public ResponseEntity<DesignationResponseDto> createDesignation(@RequestBody @Valid DesignationRequestDto request) {
        DesignationResponseDto designation = adminService.createDesignation(request);
        return ResponseEntity.ok(designation);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add-department")
    public ResponseEntity<DepartmentResponseDto> createDepartment(@RequestBody @Valid DepartmentRequestDto request) {
        DepartmentResponseDto department = adminService.createDepartment(request);
        return ResponseEntity.ok(department);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/updatedepartment/{id}")
    public ResponseEntity<DepartmentResponseDto> updateDepartment(@PathVariable Long id,
            @RequestBody @Valid DepartmentRequestDto dto) {
        return ResponseEntity.ok(adminService.updateDepartment(id, dto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/updatedesignation/{id}")
    public ResponseEntity<DesignationResponseDto> updateDesignation(@PathVariable Long id,
            @RequestBody @Valid DesignationRequestDto dto) {
        return ResponseEntity.ok(adminService.updateDesignation(id, dto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/managers")
    public ResponseEntity<List<ManagerResponseDto>> getManagers() {
        return ResponseEntity.ok(managerService.getAllManagers());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/designations")
    public ResponseEntity<List<DesignationResponseDto>> getDesignations() {
        return ResponseEntity.ok(adminService.getAllDesignations());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentResponseDto>> getDepartments() {
        return ResponseEntity.ok(adminService.getAllDepartments());
    }

}
