    package com.example.hrms.Dto;

    import java.time.LocalDate;
    import com.example.hrms.Enums.LeaveType;

    import jakarta.validation.constraints.NotNull;
    import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class LeaveRequestDto {

        @NotNull(message = "Leave type is required")
        private LeaveType leaveType;

        @NotNull(message = "From date is required")
        private LocalDate fromDate;

        @NotNull(message = "To date is required")
        private LocalDate toDate;

        @NotNull(message = "Reason is required")
        private String reason;

        
        
        

    }
