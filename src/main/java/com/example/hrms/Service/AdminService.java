package com.example.hrms.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

import com.example.hrms.Dto.DepartmentRequestDto;
import com.example.hrms.Dto.DepartmentResponseDto;
import com.example.hrms.Dto.DesignationRequestDto;
import com.example.hrms.Dto.DesignationResponseDto;
import com.example.hrms.Dto.ManagerRequestDto;
import com.example.hrms.Dto.ManagerResponseDto;
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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final EmployeeRepository employeerepo;
    private final UserRepository userrepo;
    private final DepartmentRepository deptrepo;
    private final DesignationRepository designationrepo;
    private final PasswordEncoder passwordencoder;

    @Transactional
    public ManagerResponseDto createManager(ManagerRequestDto request) {
        if (employeerepo.existsByEmployeeCode(
                request.getEmployeeCode())) {
            throw new RuntimeException("Employee code already exists");
        }

        if (employeerepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Employee with this email already exists");
        }
        if (userrepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User email already exists");
        }

        Department department = deptrepo.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Departmet not found with id" + request.getDepartmentId()));

        Designation designation = designationrepo.findById(request.getDesignationId())
                .orElseThrow(() -> new RuntimeException("Designation not found with id " + request.getDesignationId()));

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
                .manager(null)
                .build();

        Employee savedemployee = employeerepo.save(employee);

        User user = User.builder()
                .email(request.getEmail())
                .username(request.getEmail())
                .password(passwordencoder.encode(request.getPassword()))
                .role(Role.MANAGER)
                .enabled(true)
                .employeeId(savedemployee.getId())
                .build();

        userrepo.save(user);

        return ManagerResponseDto.builder()
                .id(savedemployee.getId())
                .employeeCode(savedemployee.getEmployeeCode())
                .employeeName(savedemployee.getEmployeeName())
                .email(savedemployee.getEmail())
                .phone(savedemployee.getPhone())
                .gender(savedemployee.getGender())
                .dateOfBirth(savedemployee.getDateOfBirth())
                .joiningDate(savedemployee.getJoiningDate())
                .bankAccountNumber(savedemployee.getBankAccountNumber())
                .ifsc(savedemployee.getIfsc())
                .departmentId(department.getId())
                .designationId(designation.getId())
                .role(user.getRole())
                .build();

    }

    public DesignationResponseDto createDesignation(DesignationRequestDto request) {

        if (designationrepo.existsByTitle(request.getTitle())) {
            throw new RuntimeException("Designation already exists");
        }

        Designation designation = Designation.builder()
                .title(request.getTitle())
                .build();

        Designation saveddesignation = designationrepo.save(designation);

        return DesignationResponseDto.builder()
                .id(saveddesignation.getId())
                .title(saveddesignation.getTitle())
                .build();
    }

    public List<DesignationResponseDto> getAllDesignations() {
        List<Designation> designations = designationrepo.findAll();
        return designations.stream().map(this::toDesignationResponseDto).collect(Collectors.toList());
    }

    public List<DepartmentResponseDto> getAllDepartments() {
        List<Department> departments = deptrepo.findAll();
        return departments.stream().map(this::toDepartmentResponseDto).collect(Collectors.toList());
    }

    public DepartmentResponseDto updateDepartment(Long id, DepartmentRequestDto dept) {
        Department department = deptrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Department is not found"));
        department.setName(dept.getName());
        return toDepartmentResponseDto(deptrepo.save(department));
    }

    public DesignationResponseDto updateDesignation(Long id, DesignationRequestDto designation) {
        Designation designation1 = designationrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Designation is not found"));
        designation1.setTitle(designation.getTitle());
        return toDesignationResponseDto(designationrepo.save(designation1));
    }

    public DepartmentResponseDto createDepartment(DepartmentRequestDto request) {

        if (deptrepo.existsByName(request.getName())) {
            throw new RuntimeException("Department already exists");
        }
        Department department = Department.builder()
                .name(request.getName())
                .build();

        Department saveddepartment = deptrepo.save(department);

        return DepartmentResponseDto.builder()
                .id(saveddepartment.getId())
                .name(saveddepartment.getName())
                .build();
    }

    private DesignationResponseDto toDesignationResponseDto(Designation designation) {
        return DesignationResponseDto.builder()
                .id(designation.getId())
                .title(designation.getTitle())
                .build();
    }

    private DepartmentResponseDto toDepartmentResponseDto(Department department) {
        return DepartmentResponseDto.builder()
                .id(department.getId())
                .name(department.getName())
                .build();
    }

}
