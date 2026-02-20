package com.banquet.dto;

import com.banquet.enums.PaymentType;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PaymentRequest(
        @NotNull(message = "Booking ID is required")
        Long bookingId,

        @NotNull(message = "Amount is required")
        BigDecimal amount,

        @NotNull(message = "Payment type is required")
        PaymentType paymentType
) {
}
