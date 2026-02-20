package com.banquet.dto;

import com.banquet.enums.BookingStatus;
import com.banquet.enums.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record BookingResponse(
        Long id,
        Long customerId,
        String customerName,
        Long venueId,
        String venueName,
        String hallName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BookingStatus status,
        PaymentMode paymentMode,
        String cancellationReason,
        LocalDateTime createdAt
) {
}
