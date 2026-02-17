package com.banquet.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SearchRequest {

    private String name;
    private String city;
    private String zipcode;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer minCapacity;
    private BigDecimal maxBudget;
    private String sortBy;
    private int page = 0;
    private int size = 20;
}
