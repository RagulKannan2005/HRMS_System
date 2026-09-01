package com.example.hrms.Enums;

public enum LeaveType {
    CASUAL(12),
    SICK(12),
    EARNED(18),
    MATERNITY(182);

    private final int annualLimit;
    LeaveType(int annualLimit){
        this.annualLimit=annualLimit;
    }
    public int getAnnualLimit(){
        return annualLimit;
    }
}
