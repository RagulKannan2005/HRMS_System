package com.example.hrms.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.hrms.Entity.LeaveBalance;
import com.example.hrms.Enums.LeaveType;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance,Long> {
    Optional<LeaveBalance> findByEmployee_Id(Long employeeId);
    
    Optional<LeaveBalance> findByEmployeeIdAndLeaveType(Long employeeId, LeaveType leaveReason);
    
    Optional<LeaveBalance> findByEmployeeId_AndLeaveTypeAndYear(Long employeeId, LeaveType leaveType, int year);
    
    
}
