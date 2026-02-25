package com.banquet.controller;

import com.banquet.dto.ApiResponse;
import com.banquet.dto.ExternalHallDTO;
import com.banquet.service.GooglePlacesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class PlacesController {

    private final GooglePlacesService googlePlacesService;

    @GetMapping("/external-halls")
    public ResponseEntity<ApiResponse<List<ExternalHallDTO>>> searchExternalHalls(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5000") Integer radius) {
        
        List<ExternalHallDTO> halls = googlePlacesService.searchNearbyBanquetHalls(lat, lng, radius);
        return ResponseEntity.ok(ApiResponse.success(halls));
    }

    @GetMapping("/external-halls/{placeId}")
    public ResponseEntity<ApiResponse<ExternalHallDTO>> getExternalHallDetails(
            @PathVariable String placeId) {
        
        ExternalHallDTO hall = googlePlacesService.getPlaceDetails(placeId);
        if (hall == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(hall));
    }
}
