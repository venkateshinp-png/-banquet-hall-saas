package com.banquet.dto;

import com.banquet.enums.PaymentStatus;
import com.banquet.enums.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long bookingId,
        BigDecimal amount,
        PaymentType paymentType,
        PaymentStatus status,
        String stripePaymentIntentId,
        LocalDateTime createdAt
) {
}
