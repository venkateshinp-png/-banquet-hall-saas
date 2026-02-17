package com.banquet.dto;

import com.banquet.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
        @NotBlank(message = "Phone is required")
        String phone,

        String email,

        @NotBlank(message = "Password is required")
        String password,

        @NotBlank(message = "Full name is required")
        String fullName,

        @NotNull(message = "Role is required")
        UserRole role
) {
}
