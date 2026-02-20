package com.banquet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VenueRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Capacity is required")
    private Integer capacity;

    private Integer minBookingDurationHours;

    @NotNull(message = "Base price per hour is required")
    private BigDecimal basePricePerHour;

    private String imageUrls;
}
