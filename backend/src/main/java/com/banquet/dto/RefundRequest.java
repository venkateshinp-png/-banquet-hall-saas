package com.banquet.dto;

import java.math.BigDecimal;

public record RefundRequest(
        BigDecimal amount
) {
}
