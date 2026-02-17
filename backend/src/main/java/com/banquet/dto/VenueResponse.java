package com.banquet.dto;

import java.math.BigDecimal;

public record VenueResponse(
        Long id,
        Long hallId,
        String name,
        String description,
        Integer capacity,
        Integer minBookingDurationHours,
        BigDecimal basePricePerHour,
        String imageUrls,
        boolean active
) {
}
