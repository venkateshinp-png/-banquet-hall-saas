package com.banquet.dto;

import com.banquet.enums.UserRole;

public record UserDTO(
        Long id,
        String phone,
        String email,
        String fullName,
        UserRole role,
        boolean phoneVerified
) {
}
