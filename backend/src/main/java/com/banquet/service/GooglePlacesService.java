package com.banquet.service;

import com.banquet.dto.ExternalHallDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class GooglePlacesService {

    @Value("${app.google.places-api-key:}")
    private String apiKey;

    private static final String PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    private static final String PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ExternalHallDTO> searchNearbyBanquetHalls(Double latitude, Double longitude, Integer radiusMeters) {
        List<ExternalHallDTO> halls = new ArrayList<>();
        
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("your-google-places-api-key")) {
            log.warn("Google Places API key not configured. Returning empty results.");
            return halls;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl(PLACES_NEARBY_URL)
                    .queryParam("location", latitude + "," + longitude)
                    .queryParam("radius", radiusMeters != null ? radiusMeters : 5000)
                    .queryParam("type", "banquet_hall")
                    .queryParam("keyword", "banquet hall function hall wedding venue")
                    .queryParam("key", apiKey)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            String status = root.path("status").asText();
            if (!"OK".equals(status) && !"ZERO_RESULTS".equals(status)) {
                log.error("Google Places API error: {}", status);
                return halls;
            }

            JsonNode results = root.path("results");
            for (JsonNode place : results) {
                ExternalHallDTO hall = mapToExternalHall(place);
                if (hall != null) {
                    halls.add(hall);
                }
            }
        } catch (Exception e) {
            log.error("Error fetching places from Google API", e);
        }

        return halls;
    }

    public ExternalHallDTO getPlaceDetails(String placeId) {
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("your-google-places-api-key")) {
            return null;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl(PLACE_DETAILS_URL)
                    .queryParam("place_id", placeId)
                    .queryParam("fields", "place_id,name,formatted_address,geometry,rating,user_ratings_total,formatted_phone_number,website,types,opening_hours,url")
                    .queryParam("key", apiKey)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            if (!"OK".equals(root.path("status").asText())) {
                return null;
            }

            return mapToExternalHallDetail(root.path("result"));
        } catch (Exception e) {
            log.error("Error fetching place details from Google API", e);
            return null;
        }
    }

    private ExternalHallDTO mapToExternalHall(JsonNode place) {
        try {
            JsonNode location = place.path("geometry").path("location");
            
            return ExternalHallDTO.builder()
                    .placeId(place.path("place_id").asText())
                    .name(place.path("name").asText())
                    .address(place.path("vicinity").asText())
                    .latitude(location.path("lat").asDouble())
                    .longitude(location.path("lng").asDouble())
                    .rating(place.has("rating") ? place.path("rating").asDouble() : null)
                    .userRatingsTotal(place.has("user_ratings_total") ? place.path("user_ratings_total").asInt() : null)
                    .openNow(place.path("opening_hours").has("open_now") ? 
                            place.path("opening_hours").path("open_now").asBoolean() : null)
                    .source("google_places")
                    .canBook(false)
                    .googleMapsUrl("https://www.google.com/maps/place/?q=place_id:" + place.path("place_id").asText())
                    .build();
        } catch (Exception e) {
            log.error("Error mapping place to DTO", e);
            return null;
        }
    }

    private ExternalHallDTO mapToExternalHallDetail(JsonNode place) {
        try {
            JsonNode location = place.path("geometry").path("location");
            
            List<String> types = new ArrayList<>();
            place.path("types").forEach(t -> types.add(t.asText()));

            return ExternalHallDTO.builder()
                    .placeId(place.path("place_id").asText())
                    .name(place.path("name").asText())
                    .address(place.path("formatted_address").asText())
                    .latitude(location.path("lat").asDouble())
                    .longitude(location.path("lng").asDouble())
                    .rating(place.has("rating") ? place.path("rating").asDouble() : null)
                    .userRatingsTotal(place.has("user_ratings_total") ? place.path("user_ratings_total").asInt() : null)
                    .phoneNumber(place.has("formatted_phone_number") ? place.path("formatted_phone_number").asText() : null)
                    .website(place.has("website") ? place.path("website").asText() : null)
                    .types(types.toArray(new String[0]))
                    .openNow(place.path("opening_hours").has("open_now") ? 
                            place.path("opening_hours").path("open_now").asBoolean() : null)
                    .source("google_places")
                    .canBook(false)
                    .googleMapsUrl(place.has("url") ? place.path("url").asText() : null)
                    .build();
        } catch (Exception e) {
            log.error("Error mapping place details to DTO", e);
            return null;
        }
    }
}
