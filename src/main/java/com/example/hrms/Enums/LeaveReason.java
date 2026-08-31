package com.example.hrms.Enums;

public enum LeaveReason {
    CASUAL(12),
    SICK(12),
    EARNED(18),
    MATERNITY(182);

    private final int annualLimit;
    LeaveReason(int annualLimit){
        this.annualLimit=annualLimit;
    }
    public int getAnnualLimit(){
        return annualLimit;
    }
}
