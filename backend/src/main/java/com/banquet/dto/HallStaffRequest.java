package com.banquet.dto;

import com.banquet.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record HallStaffRequest(
        @NotBlank(message = "Phone is required")
        String phone,

        @NotNull(message = "Role is required")
        UserRole role
) {
}
