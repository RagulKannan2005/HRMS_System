package com.example.hrms.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.hrms.Entity.Payroll;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);

    // List<Payroll> findByEmployee_Id(Long employeeId);

    List<Payroll> findByEmployee_Id(Long employeeId);
    List<Payroll> findByEmployee_IdOrderByYearDescMonthDesc(Long employeeId);

}
