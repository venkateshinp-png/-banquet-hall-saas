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
        List<HallDocumentDTO> documents,
        Double distance
) {
    public HallResponse withDistance(Double distance) {
        return new HallResponse(
                id, name, description, address, city, state, zipcode,
                latitude, longitude, phone, email, status, termsConditions,
                adminNotes, createdAt, owner, documents, distance
        );
    }
}
