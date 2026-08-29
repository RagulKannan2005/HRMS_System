package com.example.hrms.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.hrms.Entity.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department,Long> {
    
    
}
