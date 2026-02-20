package com.banquet.controller;

import com.banquet.dto.ApiResponse;
import com.banquet.dto.VenuePricingRequest;
import com.banquet.dto.VenueRequest;
import com.banquet.dto.VenueResponse;
import com.banquet.security.CustomUserDetails;
import com.banquet.service.VenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/halls/{hallId}/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<VenueResponse>> createVenue(
            @PathVariable Long hallId,
            @Valid @RequestBody VenueRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(venueService.createVenue(hallId, request, userDetails.getId())));
    }

    @PutMapping("/{venueId}")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<VenueResponse>> updateVenue(
            @PathVariable Long hallId,
            @PathVariable Long venueId,
            @Valid @RequestBody VenueRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(venueService.updateVenue(hallId, venueId, request, userDetails.getId())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VenueResponse>>> getVenuesByHall(@PathVariable Long hallId) {
        return ResponseEntity.ok(ApiResponse.success(venueService.getVenuesByHall(hallId)));
    }

    @GetMapping("/{venueId}")
    public ResponseEntity<ApiResponse<VenueResponse>> getVenue(
            @PathVariable Long hallId,
            @PathVariable Long venueId) {
        return ResponseEntity.ok(ApiResponse.success(venueService.getVenue(hallId, venueId)));
    }

    @PutMapping("/{venueId}/pricing")
    @PreAuthorize("hasAnyRole('OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> updatePricing(
            @PathVariable Long hallId,
            @PathVariable Long venueId,
            @Valid @RequestBody List<VenuePricingRequest> pricingList,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        venueService.updatePricing(hallId, venueId, pricingList, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Pricing updated successfully", null));
    }

    @GetMapping("/{venueId}/pricing")
    public ResponseEntity<ApiResponse<List<VenuePricingRequest>>> getPricing(
            @PathVariable Long hallId,
            @PathVariable Long venueId,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(venueService.getPricing(venueId, date)));
    }
}
