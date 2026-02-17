package com.banquet.service;

import com.banquet.dto.VenuePricingRequest;
import com.banquet.dto.VenueRequest;
import com.banquet.dto.VenueResponse;
import com.banquet.entity.BanquetHall;
import com.banquet.entity.Venue;
import com.banquet.entity.VenuePricing;
import com.banquet.repository.BanquetHallRepository;
import com.banquet.repository.HallStaffRepository;
import com.banquet.repository.VenuePricingRepository;
import com.banquet.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;
    private final BanquetHallRepository hallRepository;
    private final HallStaffRepository hallStaffRepository;
    private final VenuePricingRepository venuePricingRepository;

    @Transactional
    public VenueResponse createVenue(Long hallId, VenueRequest request, Long userId) {
        BanquetHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new RuntimeException("Hall not found"));

        verifyHallAccess(hall, userId);

        Venue venue = Venue.builder()
                .hall(hall)
                .name(request.getName())
                .description(request.getDescription())
                .capacity(request.getCapacity())
                .minBookingDurationHours(
                        request.getMinBookingDurationHours() != null
                                ? request.getMinBookingDurationHours()
                                : 2
                )
                .basePricePerHour(request.getBasePricePerHour())
                .imageUrls(request.getImageUrls())
                .active(true)
                .build();

        venue = venueRepository.save(venue);
        return toVenueResponse(venue);
    }

    @Transactional
    public VenueResponse updateVenue(Long hallId, Long venueId, VenueRequest request, Long userId) {
        BanquetHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new RuntimeException("Hall not found"));

        verifyHallAccess(hall, userId);

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        if (!venue.getHall().getId().equals(hallId)) {
            throw new RuntimeException("Venue does not belong to this hall");
        }

        venue.setName(request.getName());
        venue.setDescription(request.getDescription());
        venue.setCapacity(request.getCapacity());
        if (request.getMinBookingDurationHours() != null) {
            venue.setMinBookingDurationHours(request.getMinBookingDurationHours());
        }
        venue.setBasePricePerHour(request.getBasePricePerHour());
        venue.setImageUrls(request.getImageUrls());

        venue = venueRepository.save(venue);
        return toVenueResponse(venue);
    }

    public List<VenueResponse> getVenuesByHall(Long hallId) {
        return venueRepository.findByHallIdAndActiveTrue(hallId).stream()
                .map(this::toVenueResponse)
                .collect(Collectors.toList());
    }

    public VenueResponse getVenue(Long hallId, Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        if (!venue.getHall().getId().equals(hallId)) {
            throw new RuntimeException("Venue does not belong to this hall");
        }

        return toVenueResponse(venue);
    }

    @Transactional
    public void updatePricing(Long hallId, Long venueId, List<VenuePricingRequest> pricingList, Long userId) {
        BanquetHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new RuntimeException("Hall not found"));

        verifyHallAccess(hall, userId);

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        if (!venue.getHall().getId().equals(hallId)) {
            throw new RuntimeException("Venue does not belong to this hall");
        }

        for (VenuePricingRequest pricing : pricingList) {
            venuePricingRepository.deleteByVenueIdAndEffectiveDate(venueId, pricing.effectiveDate());
        }

        for (VenuePricingRequest pricing : pricingList) {
            VenuePricing entity = VenuePricing.builder()
                    .venue(venue)
                    .effectiveDate(pricing.effectiveDate())
                    .slotStart(pricing.slotStart())
                    .slotEnd(pricing.slotEnd())
                    .price(pricing.price())
                    .build();
            venuePricingRepository.save(entity);
        }
    }

    public List<VenuePricingRequest> getPricing(Long venueId, LocalDate date) {
        return venuePricingRepository.findByVenueIdAndEffectiveDate(venueId, date).stream()
                .map(vp -> new VenuePricingRequest(
                        vp.getEffectiveDate(),
                        vp.getSlotStart(),
                        vp.getSlotEnd(),
                        vp.getPrice()
                ))
                .collect(Collectors.toList());
    }

    private void verifyHallAccess(BanquetHall hall, Long userId) {
        boolean isOwner = hall.getOwner().getId().equals(userId);
        boolean isStaff = hallStaffRepository.existsByHallIdAndUserId(hall.getId(), userId);

        if (!isOwner && !isStaff) {
            throw new RuntimeException("Not authorized to manage this hall");
        }
    }

    private VenueResponse toVenueResponse(Venue venue) {
        return new VenueResponse(
                venue.getId(),
                venue.getHall().getId(),
                venue.getName(),
                venue.getDescription(),
                venue.getCapacity(),
                venue.getMinBookingDurationHours(),
                venue.getBasePricePerHour(),
                venue.getImageUrls(),
                venue.isActive()
        );
    }
}
