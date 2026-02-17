package com.banquet.controller;

import com.banquet.dto.ApiResponse;
import com.banquet.dto.PaymentRequest;
import com.banquet.dto.PaymentResponse;
import com.banquet.dto.RefundRequest;
import com.banquet.security.CustomUserDetails;
import com.banquet.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPaymentIntent(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.createPaymentIntent(userDetails.getId(), request)));
    }

    @PostMapping("/confirm")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(
            @RequestBody Map<String, String> body) {
        String paymentIntentId = body.get("paymentIntentId");
        return ResponseEntity.ok(ApiResponse.success(paymentService.confirmPayment(paymentIntentId)));
    }

    @PostMapping("/{bookingId}/refund")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processRefund(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody RefundRequest request) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.processRefund(bookingId, userDetails.getId(), request)));
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getBookingPayments(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getBookingPayments(bookingId)));
    }
}
