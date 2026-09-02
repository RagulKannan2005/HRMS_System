package com.example.hrms.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.hrms.Dto.EmployeeRequestDto;
import com.example.hrms.Dto.EmployeeResponseDto;
import com.example.hrms.Dto.LeaveBalanceResponseDto;
import com.example.hrms.Dto.LeaveResponseDto;
import com.example.hrms.Dto.ManagerRequestDto;
import com.example.hrms.Dto.ManagerResponseDto;
import com.example.hrms.Entity.Department;
import com.example.hrms.Entity.Designation;
import com.example.hrms.Entity.Employee;
import com.example.hrms.Entity.LeaveBalance;
import com.example.hrms.Entity.LeaveRequest;
import com.example.hrms.Entity.User;
import com.example.hrms.Enums.EmployeeStatus;
import com.example.hrms.Enums.LeaveStatus;
import com.example.hrms.Enums.LeaveType;
import com.example.hrms.Enums.Role;
import com.example.hrms.Repository.DepartmentRepository;
import com.example.hrms.Repository.DesignationRepository;
import com.example.hrms.Repository.EmployeeRepository;
import com.example.hrms.Repository.LeaveBalanceRepository;
import com.example.hrms.Repository.LeaveRequestRepository;
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
        private final LeaveBalanceRepository leaveBalanceRepo;
        private final LeaveRequestRepository leaveRequestrepo;

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
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Manager employee profile not found with id: "
                                                                        + managerEmployeeId));
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

                for (LeaveType leaveType : LeaveType.values()) {
                        LeaveBalance balance = LeaveBalance.builder()
                                        .employee(savedEmployee)
                                        .leaveType(leaveType)
                                        .totalDays((leaveType.getAnnualLimit()))
                                        .usedDays(0)
                                        .year(LocalDate.now().getYear())
                                        .build();
                        leaveBalanceRepo.save(balance);
                }

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

        public List<ManagerResponseDto> getAllManagers() {
                List<Employee> employees = employeerepo.findByRole(Role.MANAGER);
                return employees.stream().map(this::toManagerResponseDto).collect(Collectors.toList());
        }

        @Transactional
        public ManagerResponseDto updateManager(Long id, ManagerRequestDto request) {
                Employee employee = employeerepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Manager not found"));
                Designation designation = request.getDesignationId() != null
                                ? designationrepo.findById(request.getDesignationId())
                                                .orElseThrow(() -> new RuntimeException("Designation not found"))
                                : employee.getDesignation();
                Department department = request.getDepartmentId() != null
                                ? departmentrepo.findById(request.getDepartmentId())
                                                .orElseThrow(() -> new RuntimeException("Department not found"))
                                : employee.getDepartment();

                employee.setEmployeeName(request.getEmployeeName());
                employee.setPhone(request.getPhone());
                employee.setGender(request.getGender());
                employee.setDateOfBirth(request.getDateOfBirth());
                // employee.setJoiningDate(request.getJoiningDate());
                employee.setBankAccountNumber(request.getBankAccountNumber());
                employee.setIfsc(request.getIfsc());
                employee.setDepartment(department);
                employee.setDesignation(designation);
                employee.setManager(request.getManagerId() != null
                                ? employeerepo.findById(request.getManagerId())
                                                .orElseThrow(() -> new RuntimeException("Manager not found"))
                                : employee.getManager());
                Employee updated = employeerepo.save(employee);
                return toManagerResponseDto(updated);

        }

        public List<ManagerResponseDto> getManagers() {
                List<User> managerUsers = userrepo.findByRole(Role.MANAGER);
                return managerUsers.stream()
                                .map(user -> user.getEmployeeId() != null
                                                ? employeerepo.findById(user.getEmployeeId()).orElse(null)
                                                : null)
                                .filter(Objects::nonNull)
                                .map(this::toManagerResponseDto)
                                .collect(Collectors.toList());
        }

        public List<EmployeeResponseDto> getmanagerTeam(String managername) {
                List<Employee> employees = employeerepo.findByManager_EmployeeName(managername);
                return employees.stream().map(this::toEmployeeResponseDto).collect(Collectors.toList());
        }

        @Transactional
        public LeaveResponseDto approveLeave(Long leaveRequestId) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                User managerUser = (User) authentication.getPrincipal();

                LeaveRequest leaveRequest = leaveRequestrepo.findById(leaveRequestId)
                                .orElseThrow(() -> new RuntimeException("Leave request not found"));
                if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
                        throw new RuntimeException("Only pending leave request can be approved");

                }
                if (managerUser == null) {
                        throw new RuntimeException("Manager not found");
                }
                Long managerEmployeeId = managerUser.getEmployeeId();

                Employee managerEmployee = null;
                if (managerEmployeeId != null) {
                        managerEmployee = employeerepo.findById(managerEmployeeId)
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Manager employee profile not found with id: "
                                                                        + managerEmployeeId));
                }
                Employee employee = leaveRequest.getEmployee();
                if (managerEmployeeId != null && employee.getId().equals(managerEmployeeId)) {
                        throw new RuntimeException("Managers cannot approve their own leave requests. Only Admin can approve a manager's leave request.");
                }

                int year = leaveRequest.getFromDate().getYear();
                LeaveBalance balance = leaveBalanceRepo
                                .findByEmployeeId_AndLeaveTypeAndYear(employee.getId(), leaveRequest.getLeaveType(),
                                                year)
                                .orElseThrow(() -> new RuntimeException("Leave balance not found"));
                int remainingDays = balance.getTotalDays() - balance.getUsedDays();

                if (leaveRequest.getNumberOfDays() > remainingDays) {
                        throw new RuntimeException("Insufficient leave balance");

                }
                balance.setUsedDays(balance.getUsedDays() + leaveRequest.getNumberOfDays());
                leaveBalanceRepo.save(balance);

                leaveRequest.setStatus(LeaveStatus.APPROVED);
                leaveRequest.setApprovedBy(managerEmployeeId);
                leaveRequestrepo.save(leaveRequest);
                return toLeaveResponseDto(leaveRequest);

        }

        @Transactional
        public LeaveResponseDto rejectEmployyeLeave(Long leaverequestId){
                Authentication authenticaiton=SecurityContextHolder.getContext().getAuthentication();
                User user=(User) authenticaiton.getPrincipal();

                LeaveRequest leaveRequest=leaveRequestrepo.findById(leaverequestId).orElseThrow(()->new RuntimeException("Leave Request id is not found"));
                if(leaveRequest.getStatus()!=LeaveStatus.PENDING){
                        throw new RuntimeException("Only Pending Leave Request can be rejected");
                }   
                Employee employee = leaveRequest.getEmployee();
                Long managerEmployeeId = user.getEmployeeId();
                if (managerEmployeeId != null && employee.getId().equals(managerEmployeeId)) {
                        throw new RuntimeException("Managers cannot reject their own leave requests. Only Admin can manage a manager's leave request.");
                }

                leaveRequest.setStatus(LeaveStatus.REJECTED);
                leaveRequest.setApprovedBy(user.getEmployeeId()!=null?user.getEmployeeId():user.getId());
                LeaveRequest saved=leaveRequestrepo.save(leaveRequest);
                return toLeaveResponseDto(saved);
        }

        public List<LeaveBalanceResponseDto> getleavebalance(Long employeeid) {
                if (!employeerepo.existsById(employeeid)) {
                        throw new RuntimeException("Employee is not found");
                }
                List<LeaveBalance> balances = leaveBalanceRepo.findByEmployee_Id(employeeid);
                return balances.stream().map(this::toLeaveBalanceResponseDto).collect(Collectors.toList());
        }

        public LeaveBalanceResponseDto toLeaveBalanceResponseDto(LeaveBalance balance) {
                int remainingDays = (balance.getTotalDays() != null ? balance.getTotalDays() : 0)
                                - (balance.getUsedDays() != null ? balance.getUsedDays() : 0);
                return LeaveBalanceResponseDto.builder()
                                .id(balance.getId())
                                .leaveType(balance.getLeaveType())
                                .totalDays(balance.getTotalDays())
                                .usedDays(balance.getUsedDays())
                                .year(balance.getYear())
                                .remainingDays(remainingDays)
                                .build();
        }

        LeaveResponseDto toLeaveResponseDto(LeaveRequest leaveRequest) {
                return LeaveResponseDto.builder()
                                .id(leaveRequest.getId())
                                .employeeId(leaveRequest.getEmployee() != null ? leaveRequest.getEmployee().getId()
                                                : null)
                                .employeeName(leaveRequest.getEmployee() != null
                                                ? leaveRequest.getEmployee().getEmployeeName()
                                                : null)
                                .leaveType(leaveRequest.getLeaveType())
                                .fromDate(leaveRequest.getFromDate())
                                .toDate(leaveRequest.getToDate())
                                .numberOfDays(leaveRequest.getNumberOfDays())
                                .status(leaveRequest.getStatus())
                                .reason(leaveRequest.getReason())
                                .approvedBy(leaveRequest.getApprovedBy())
                                .appliedOn(leaveRequest.getAppliedOn())
                                .build();
        }

        public EmployeeResponseDto toEmployeeResponseDto(Employee employee) {
                return EmployeeResponseDto.builder()
                                .id(employee.getId())
                                .employeeCode(employee.getEmployeeCode())
                                .employeeName(employee.getEmployeeName())
                                .email(employee.getEmail())
                                .phone(employee.getPhone())
                                .gender(employee.getGender())
                                .dateOfBirth(employee.getDateOfBirth())
                                .joiningDate(employee.getJoiningDate())
                                .employeeStatus(employee.getEmployeeStatus())
                                .bankAccountNumber(employee.getBankAccountNumber())
                                .ifsc(employee.getIfsc())
                                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName()
                                                : null)
                                .designationName(
                                                employee.getDesignation() != null ? employee.getDesignation().getTitle()
                                                                : null)
                                .managerName(employee.getManager() != null ? employee.getManager().getEmployeeName()
                                                : null)
                                .build();
        }

        public ManagerResponseDto toManagerResponseDto(Employee employee) {
                Role role = userrepo.findByEmail(employee.getEmail())
                                .map(User::getRole)
                                .orElse(null);

                return ManagerResponseDto.builder()
                                .id(employee.getId())
                                .employeeCode(employee.getEmployeeCode())
                                .employeeName(employee.getEmployeeName())
                                .email(employee.getEmail())
                                .phone(employee.getPhone())
                                .gender(employee.getGender())
                                .dateOfBirth(employee.getDateOfBirth())
                                .joiningDate(employee.getJoiningDate())
                                .employeeStatus(employee.getEmployeeStatus())
                                .bankAccountNumber(employee.getBankAccountNumber())
                                .ifsc(employee.getIfsc())
                                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getId()
                                                : null)
                                .designationId(employee.getDesignation() != null ? employee.getDesignation().getId()
                                                : null)
                                .managerId(employee.getManager() != null ? employee.getManager().getId() : null)
                                .role(role)
                                .build();
        }
}
