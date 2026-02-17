package com.banquet.dto;

import com.banquet.enums.HallStatus;

import java.time.LocalDateTime;
import java.util.List;

public record HallResponse(
        Long id,
        String name,
        String description,
        String address,
        String city,
        String state,
        String zipcode,
        Double latitude,
        Double longitude,
        String phone,
        String email,
        HallStatus status,
        String termsConditions,
        String adminNotes,
        LocalDateTime createdAt,
        UserDTO owner,
        List<HallDocumentDTO> documents
) {
}
