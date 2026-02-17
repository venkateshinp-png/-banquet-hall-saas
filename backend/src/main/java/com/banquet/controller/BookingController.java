package com.banquet.controller;

import com.banquet.dto.ApiResponse;
import com.banquet.dto.BookingRequest;
import com.banquet.dto.BookingResponse;
import com.banquet.security.CustomUserDetails;
import com.banquet.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.createBooking(userDetails.getId(), request)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getCustomerBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getCustomerBookings(userDetails.getId())));
    }

    @GetMapping("/hall/{hallId}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getHallBookings(
            @PathVariable Long hallId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getHallBookings(hallId, userDetails.getId())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBooking(id, userDetails.getId())));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        return ResponseEntity.ok(ApiResponse.success(bookingService.cancelBooking(id, userDetails.getId(), reason)));
    }
}
