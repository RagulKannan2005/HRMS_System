package com.example.hrms.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.hrms.Entity.Designation;

@Repository
public interface DesignationRepository extends JpaRepository<Designation,Long>{
    
    
}
