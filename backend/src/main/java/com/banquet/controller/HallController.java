package com.banquet.controller;

import com.banquet.dto.ApiResponse;
import com.banquet.dto.HallRequest;
import com.banquet.dto.HallResponse;
import com.banquet.dto.HallStatusUpdateRequest;
import com.banquet.security.CustomUserDetails;
import com.banquet.service.HallService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/halls")
@RequiredArgsConstructor
public class HallController {

    private final HallService hallService;

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<HallResponse>> createHall(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody HallRequest request) {
        return ResponseEntity.ok(ApiResponse.success(hallService.createHall(userDetails.getId(), request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<HallResponse>> updateHall(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody HallRequest request) {
        return ResponseEntity.ok(ApiResponse.success(hallService.updateHall(userDetails.getId(), id, request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HallResponse>> getHall(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(hallService.getHall(id)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<HallResponse>>> getOwnerHalls(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(hallService.getOwnerHalls(userDetails.getId())));
    }

    @PostMapping("/{id}/documents")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Void>> uploadDocuments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("types") List<String> types) {
        hallService.uploadDocuments(userDetails.getId(), id, files, types);
        return ResponseEntity.ok(ApiResponse.success("Documents uploaded successfully", null));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<HallResponse>>> getPendingHalls() {
        return ResponseEntity.ok(ApiResponse.success(hallService.getPendingHalls()));
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HallResponse>> updateHallStatus(
            @PathVariable Long id,
            @Valid @RequestBody HallStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(hallService.updateHallStatus(id, request)));
    }
}
