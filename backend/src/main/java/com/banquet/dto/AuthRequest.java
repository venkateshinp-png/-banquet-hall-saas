package com.banquet.dto;

public record AuthRequest(
        String phone,
        String password,
        String otp
) {
}
