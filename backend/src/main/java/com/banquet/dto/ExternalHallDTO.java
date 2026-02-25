package com.banquet.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExternalHallDTO {
    private String placeId;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private Integer userRatingsTotal;
    private String phoneNumber;
    private String website;
    private String[] types;
    private Boolean openNow;
    private String source;
    private Boolean canBook;
    private String googleMapsUrl;
}
