package com.example.hrms.Service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.hrms.Dto.EmployeeRequestDto;
import com.example.hrms.Dto.EmployeeResponseDto;
import com.example.hrms.Entity.Department;
import com.example.hrms.Entity.Designation;
import com.example.hrms.Entity.Employee;
import com.example.hrms.Entity.User;
import com.example.hrms.Enums.EmployeeStatus;
import com.example.hrms.Enums.Role;
import com.example.hrms.Repository.DepartmentRepository;
import com.example.hrms.Repository.DesignationRepository;
import com.example.hrms.Repository.EmployeeRepository;
import com.example.hrms.Repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManagerService {
    private final EmployeeRepository employeerepo;
    private final UserRepository userrepo;
    private final DepartmentRepository departmentrepo;
    private final DesignationRepository designationrepo;
    private final PasswordEncoder passwordencoder;

    @Transactional
    public EmployeeResponseDto createEmployee(EmployeeRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User managerUser = (User) authentication.getPrincipal();
        if (managerUser == null) {
            throw new RuntimeException("Manager not found");
        }
        Long managerEmployeeId = managerUser.getEmployeeId();

        Employee managerEmployee = null;
        if (managerEmployeeId != null) {
            managerEmployee = employeerepo.findById(managerEmployeeId)
                    .orElseThrow(() -> new RuntimeException("Manager employee profile not found with id: " + managerEmployeeId));
        }

        if (employeerepo.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new RuntimeException("Employee code already exists");
        }
        if (employeerepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Employee with this email already exists");
        }
        if (userrepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User email already exists");
        }

        Department department = departmentrepo.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        Designation designation = designationrepo.findById(request.getDesignationId())
                .orElseThrow(() -> new RuntimeException("Designation not found"));

        Employee employee = Employee.builder()
                .employeeCode(request.getEmployeeCode())
                .employeeName(request.getEmployeeName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .joiningDate(request.getJoiningDate())
                .employeeStatus(EmployeeStatus.ACTIVE)
                .bankAccountNumber(request.getBankAccountNumber())
                .ifsc(request.getIfsc())
                .department(department)
                .designation(designation)
                .manager(managerEmployee)
                .build();

        Employee savedEmployee = employeerepo.save(employee);

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getEmail())
                .password(passwordencoder.encode(request.getPassword()))
                .role(Role.EMPLOYEE)
                .enabled(true)
                .employeeId(savedEmployee.getId())
                .build();

        userrepo.save(user);

        return EmployeeResponseDto.builder()
                .id(savedEmployee.getId())
                .employeeCode(savedEmployee.getEmployeeCode())
                .employeeName(savedEmployee.getEmployeeName())
                .email(savedEmployee.getEmail())
                .phone(savedEmployee.getPhone())
                .gender(savedEmployee.getGender())
                .dateOfBirth(savedEmployee.getDateOfBirth())
                .joiningDate(savedEmployee.getJoiningDate())
                .bankAccountNumber(savedEmployee.getBankAccountNumber())
                .ifsc(savedEmployee.getIfsc())
                .departmentName(department.getName())
                .designationName(designation.getTitle())
                .managerName(managerEmployee != null ? managerEmployee.getEmployeeName() : null)
                .build();
    }
}

