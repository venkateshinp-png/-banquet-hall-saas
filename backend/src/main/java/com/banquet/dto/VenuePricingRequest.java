package com.banquet.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record VenuePricingRequest(
        @NotNull(message = "Effective date is required")
        LocalDate effectiveDate,

        @NotNull(message = "Slot start time is required")
        LocalTime slotStart,

        @NotNull(message = "Slot end time is required")
        LocalTime slotEnd,

        @NotNull(message = "Price is required")
        BigDecimal price
) {
}
