package com.banquet.controller;

import com.banquet.dto.ApiResponse;
import com.banquet.dto.HallStaffRequest;
import com.banquet.dto.UserDTO;
import com.banquet.security.CustomUserDetails;
import com.banquet.service.HallStaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/halls/{hallId}/staff")
@RequiredArgsConstructor
public class HallStaffController {

    private final HallStaffService hallStaffService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Void>> addStaff(
            @PathVariable Long hallId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody HallStaffRequest request) {
        hallStaffService.addStaff(hallId, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Staff added successfully", null));
    }

    @DeleteMapping("/{staffId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Void>> removeStaff(
            @PathVariable Long hallId,
            @PathVariable Long staffId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        hallStaffService.removeStaff(hallId, userDetails.getId(), staffId);
        return ResponseEntity.ok(ApiResponse.success("Staff removed successfully", null));
    }

    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getHallStaff(
            @PathVariable Long hallId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(hallStaffService.getHallStaff(hallId, userDetails.getId())));
    }
}
