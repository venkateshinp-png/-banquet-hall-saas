package com.banquet.dto;

import java.time.LocalDateTime;

public record HallDocumentDTO(
        Long id,
        String documentType,
        String filePath,
        LocalDateTime uploadedAt
) {
}
