package com.banquet.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserDTO user
) {
}
