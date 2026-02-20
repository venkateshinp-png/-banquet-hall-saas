package com.banquet.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HallRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String state;

    @NotBlank(message = "Zipcode is required")
    private String zipcode;

    private Double latitude;

    private Double longitude;

    private String phone;

    private String email;

    private String termsConditions;

    private String bankAccountName;

    private String bankAccountNumber;

    private String bankRoutingNumber;
}
