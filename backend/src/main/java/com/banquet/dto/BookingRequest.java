package com.banquet.dto;

import com.banquet.enums.PaymentMode;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequest(
        @NotNull(message = "Venue ID is required")
        Long venueId,

        @NotNull(message = "Booking date is required")
        LocalDate bookingDate,

        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @NotNull(message = "End time is required")
        LocalTime endTime,

        @NotNull(message = "Payment mode is required")
        PaymentMode paymentMode
) {
}
