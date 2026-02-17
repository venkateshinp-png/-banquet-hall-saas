package com.banquet.dto;

import com.banquet.enums.HallStatus;
import jakarta.validation.constraints.NotNull;

public record HallStatusUpdateRequest(
        @NotNull(message = "Status is required")
        HallStatus status,

        String notes
) {
}
