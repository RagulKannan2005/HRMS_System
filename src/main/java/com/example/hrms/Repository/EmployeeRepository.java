package com.example.hrms.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import com.example.hrms.Entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);
    boolean existsByEmployeeCode(String empcode);

}
