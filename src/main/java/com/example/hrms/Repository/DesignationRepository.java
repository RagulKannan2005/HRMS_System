package com.example.hrms.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.hrms.Entity.Designation;

@Repository
public interface DesignationRepository extends JpaRepository<Designation,Long>{
    
    boolean existsByTitle(String title);


    Optional<Designation> findByTitle(String title);

    
}
