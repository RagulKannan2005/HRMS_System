package com.example.hrms.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.hrms.Dto.EmployeeSalaryResponse;
import com.example.hrms.Entity.EmployeeSalary;
import com.example.hrms.Repository.EmployeeRepository;
import com.example.hrms.Repository.SalaryRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeSalaryService {

    private final SalaryRepository salaryrepo;
    private final EmployeeRepository employeerepo;

    public List<EmployeeSalaryResponse> getallemployeesalary() {
        List<EmployeeSalary> employeesalary = salaryrepo.findAll();
        return employeesalary.stream()
                .map(this::toSalaryReponseDto)
                .collect(Collectors.toList());
    }

    public List<EmployeeSalaryResponse> getSalaryByEmployeeId(Long employeeId) {
        List<EmployeeSalary> salaries = salaryrepo.findByEmployee_Id(employeeId);
        return salaries.stream().map(this::toSalaryReponseDto).collect(Collectors.toList());
    }

    public EmployeeSalaryResponse getSalaryById(Long id) {
        EmployeeSalary salary = salaryrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Salary record not found with id: " + id));
        return toSalaryReponseDto(salary);
    }

    @Transactional
    public EmployeeSalaryResponse updateSalary(Long id, EmployeeSalary updatedsalary) {

        EmployeeSalary existingSalary = salaryrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Salary Record is not found with this ID" + id));

        existingSalary.setBasicSalary(updatedsalary.getBasicSalary());
        existingSalary.setHra(updatedsalary.getHra());
        existingSalary.setOtherAllowance(updatedsalary.getOtherAllowance());
        existingSalary.setTaxPercent(updatedsalary.getTaxPercent());
        existingSalary.setPfPercent(updatedsalary.getPfPercent());
        existingSalary.setEffectiveFrom(updatedsalary.getEffectiveFrom());

        EmployeeSalary save = salaryrepo.save(existingSalary);
        return toSalaryReponseDto(save);

    }

    EmployeeSalaryResponse toSalaryReponseDto(EmployeeSalary salary) {
        return EmployeeSalaryResponse.builder()
                .id(salary.getId())
                .employeeId(salary.getEmployee() != null ? String.valueOf(salary.getEmployee().getId()) : null)
                .employeeName(salary.getEmployee() != null ? salary.getEmployee().getEmployeeName() : null)
                .basicSalary(salary.getBasicSalary())
                .hra(salary.getHra())
                .otherAllowance(salary.getOtherAllowance())
                .taxPercent(salary.getTaxPercent())
                .pfPercent(salary.getPfPercent())
                .salaryEffectiveFrom(salary.getEffectiveFrom())
                .build();
    }

}
