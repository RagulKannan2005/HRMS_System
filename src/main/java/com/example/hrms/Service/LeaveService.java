package com.example.hrms.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.hrms.Dto.LeaveRequestDto;
import com.example.hrms.Dto.LeaveResponseDto;
import com.example.hrms.Entity.Employee;
import com.example.hrms.Entity.LeaveBalance;
import com.example.hrms.Entity.LeaveRequest;
import com.example.hrms.Entity.User;
import com.example.hrms.Enums.LeaveStatus;
import com.example.hrms.Repository.EmployeeRepository;
import com.example.hrms.Repository.LeaveBalanceRepository;
import com.example.hrms.Repository.LeaveRequestRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeaveService {
    private final LeaveBalanceRepository leaveBalancerepo;
    private final LeaveRequestRepository leaveRequestrepo;
    private final EmployeeRepository employeeRepo;

    @Transactional
    public LeaveResponseDto applyLeave(LeaveRequestDto dto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User)) {
            throw new RuntimeException("Invalid user session");
        }

        User user = (User) authentication.getPrincipal();

        Long employeeId = user.getEmployeeId();

        if (employeeId == null) {
            throw new RuntimeException("Invalid user session");

        }
        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (dto.getFromDate().isAfter(dto.getToDate())) {
            throw new RuntimeException("From date cannnot be after To date");
        }
        int numberOfDays = (int) ChronoUnit.DAYS.between(dto.getFromDate(), dto.getToDate()) + 1;
        int year = dto.getFromDate().getYear();

        LeaveBalance balance = leaveBalancerepo.findByEmployeeId_AndLeaveTypeAndYear(
                employeeId,
                dto.getLeaveType(),
                year)
                .orElseThrow(
                        () -> new RuntimeException("No leave balance found for employeeId: "
                                + employeeId
                                + ", leaveType: "
                                + dto.getLeaveType()
                                + ", year: "
                                + year));

        int remainingDays = balance.getTotalDays() - balance.getUsedDays();

        if (numberOfDays > remainingDays) {
            throw new RuntimeException("Insufficient leave balance. Available days:" + remainingDays);

        }
        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(dto.getLeaveType())
                .fromDate(dto.getFromDate())
                .toDate(dto.getToDate())
                .numberOfDays(numberOfDays)
                .reason(dto.getReason())
                .status(LeaveStatus.PENDING)
                .appliedOn(LocalDateTime.now())
                .build();

        LeaveRequest savedRequest = leaveRequestrepo.save(leaveRequest);
        return mapLeaveRequestToResponseDto(savedRequest);

    }

    @Transactional
    public LeaveResponseDto leavecancelByEmployee(Long leaveRequestId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User)) {
            throw new RuntimeException("Invalid user session");
        }

        User user = (User) authentication.getPrincipal();
        Long employeeId = user.getEmployeeId();

        LeaveRequest leaveRequest = leaveRequestrepo.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (employeeId == null || !leaveRequest.getEmployee().getId().equals(employeeId)) {
            throw new RuntimeException("You can only cancel your own leave request");
        }

        if (leaveRequest.getStatus() == LeaveStatus.CANCELLED) {
            throw new RuntimeException("Leave request is already cancelled");
        }

        if (leaveRequest.getStatus() == LeaveStatus.REJECTED) {
            throw new RuntimeException("Cannot cancel a rejected leave request");
        }

        
        if (leaveRequest.getStatus() == LeaveStatus.APPROVED) {
            int year = leaveRequest.getFromDate().getYear();
            LeaveBalance balance = leaveBalancerepo
                    .findByEmployeeId_AndLeaveTypeAndYear(employeeId, leaveRequest.getLeaveType(), year)
                    .orElse(null);

            if (balance != null) {
                int newUsedDays = Math.max(0, balance.getUsedDays() - leaveRequest.getNumberOfDays());
                balance.setUsedDays(newUsedDays);
                leaveBalancerepo.save(balance);
            }
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        LeaveRequest savedRequest = leaveRequestrepo.save(leaveRequest);

        return mapLeaveRequestToResponseDto(savedRequest);
    }

    public List<LeaveResponseDto> getMyLeaves() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User)) {
            throw new RuntimeException("Invalid user session");
        }

        User user = (User) authentication.getPrincipal();
        Long employeeId = user.getEmployeeId();

        if (employeeId == null) {
            throw new RuntimeException("No employee profile associated with current user");
        }

        List<LeaveRequest> leaveRequests = leaveRequestrepo.findByEmployee_Id(employeeId);
        return leaveRequests.stream()
                .map(this::mapLeaveRequestToResponseDto)
                .collect(Collectors.toList());
    }

    public List<LeaveResponseDto> getLeavesByEmployeeId(Long id) {
        List<LeaveRequest> leaveRequests = leaveRequestrepo.findByEmployee_Id(id);
        return leaveRequests.stream()
                .map(this::mapLeaveRequestToResponseDto)
                .collect(Collectors.toList());
    }

    public List<LeaveResponseDto> getLeavesBystatusandEmplyeeId(Long id, String status) {
        LeaveStatus leaveStatus = LeaveStatus.valueOf(status.toUpperCase());
        List<LeaveRequest> leaveRequests = leaveRequestrepo.findByEmployee_IdAndStatus(id, leaveStatus);
        return leaveRequests.stream()
                .map(this::mapLeaveRequestToResponseDto)
                .collect(Collectors.toList());

    }

    public List<LeaveResponseDto> getLeavesByStatus(String Status){
        LeaveStatus leaveStatus=LeaveStatus.valueOf(Status.toUpperCase());
        List<LeaveRequest> leaveRequest=leaveRequestrepo.findByStatus(leaveStatus);
        return leaveRequest.stream()
        .map(this::mapLeaveRequestToResponseDto)
        .collect(Collectors.toList()); 
    }

    LeaveResponseDto mapLeaveRequestToResponseDto(LeaveRequest leaveRequest) {
        return LeaveResponseDto.builder()
                .id(leaveRequest.getId())
                .employeeId(leaveRequest.getEmployee() != null ? leaveRequest.getEmployee().getId() : null)
                .employeeName(leaveRequest.getEmployee() != null ? leaveRequest.getEmployee().getEmployeeName() : null)
                .leaveType(leaveRequest.getLeaveType())
                .fromDate(leaveRequest.getFromDate())
                .toDate(leaveRequest.getToDate())
                .numberOfDays(leaveRequest.getNumberOfDays())
                .reason(leaveRequest.getReason())
                .status(leaveRequest.getStatus())
                .approvedBy(leaveRequest.getApprovedBy())
                .appliedOn(leaveRequest.getAppliedOn())
                .build();
    }

}
