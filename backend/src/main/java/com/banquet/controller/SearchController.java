package com.banquet.controller;

import com.banquet.dto.ApiResponse;
import com.banquet.dto.HallResponse;
import com.banquet.dto.SearchRequest;
import com.banquet.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/halls")
    public ResponseEntity<ApiResponse<Page<HallResponse>>> searchHalls(@ModelAttribute SearchRequest request) {
        return ResponseEntity.ok(ApiResponse.success(searchService.searchHalls(request)));
    }
}
