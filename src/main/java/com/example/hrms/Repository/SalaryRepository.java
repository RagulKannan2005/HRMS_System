package com.example.hrms.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hrms.Entity.EmployeeSalary;

public interface SalaryRepository extends JpaRepository<EmployeeSalary,Long> {

    List<EmployeeSalary> findByEmployee_Id(Long employeeId);
     
    
}
