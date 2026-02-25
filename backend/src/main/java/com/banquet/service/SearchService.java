package com.banquet.service;

import com.banquet.dto.HallResponse;
import com.banquet.dto.SearchRequest;
import com.banquet.entity.BanquetHall;
import com.banquet.entity.Booking;
import com.banquet.entity.Venue;
import com.banquet.enums.BookingStatus;
import com.banquet.enums.HallStatus;
import com.banquet.repository.BanquetHallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.*;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final BanquetHallRepository hallRepository;
    private final HallService hallService;

    private static final double DEFAULT_RADIUS_KM = 25.0;

    public Page<HallResponse> searchHalls(SearchRequest request) {
        if (request.getLatitude() != null && request.getLongitude() != null) {
            return searchByLocation(request);
        }

        Specification<BanquetHall> spec = buildSpecification(request);

        Sort sort = buildSort(request.getSortBy());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<BanquetHall> page = hallRepository.findAll(spec, pageable);
        return page.map(hallService::toHallResponse);
    }

    private Page<HallResponse> searchByLocation(SearchRequest request) {
        double radius = request.getRadius() != null ? request.getRadius() : DEFAULT_RADIUS_KM;
        double userLat = request.getLatitude();
        double userLng = request.getLongitude();
        
        List<BanquetHall> nearbyHalls = hallRepository.findNearbyHalls(userLat, userLng, radius);

        List<HallResponse> responses = nearbyHalls.stream()
                .map(hall -> {
                    HallResponse response = hallService.toHallResponse(hall);
                    Double distance = calculateDistance(userLat, userLng, hall.getLatitude(), hall.getLongitude());
                    return response.withDistance(distance);
                })
                .sorted((a, b) -> {
                    if (a.distance() == null) return 1;
                    if (b.distance() == null) return -1;
                    return Double.compare(a.distance(), b.distance());
                })
                .toList();

        int page = request.getPage();
        int size = request.getSize();
        int start = Math.min(page * size, responses.size());
        int end = Math.min(start + size, responses.size());
        
        List<HallResponse> pageContent = responses.subList(start, end);
        Pageable pageable = PageRequest.of(page, size);
        
        return new PageImpl<>(pageContent, pageable, responses.size());
    }

    private Double calculateDistance(double lat1, double lon1, Double lat2, Double lon2) {
        if (lat2 == null || lon2 == null) return null;
        
        final double R = 6371.0;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c;
        return Math.round(distance * 10.0) / 10.0;
    }

    private Specification<BanquetHall> buildSpecification(SearchRequest request) {
        return (root, query, cb) -> {
            Predicate predicate = cb.equal(root.get("status"), HallStatus.APPROVED);

            if (request.getName() != null && !request.getName().isBlank()) {
                predicate = cb.and(predicate,
                        cb.like(cb.lower(root.get("name")),
                                "%" + request.getName().toLowerCase() + "%"));
            }

            if (request.getCity() != null && !request.getCity().isBlank()) {
                predicate = cb.and(predicate,
                        cb.equal(cb.lower(root.get("city")),
                                request.getCity().toLowerCase()));
            }

            String zipcode = request.getZipcode();
            if (zipcode == null || zipcode.isBlank()) {
                zipcode = request.getPincode();
            }
            if (zipcode != null && !zipcode.isBlank()) {
                predicate = cb.and(predicate,
                        cb.equal(root.get("zipcode"), zipcode));
            }

            boolean needsVenueFilter = request.getMinCapacity() != null
                    || request.getMaxBudget() != null
                    || (request.getDate() != null && request.getStartTime() != null && request.getEndTime() != null);

            if (needsVenueFilter) {
                Subquery<Long> venueSubquery = query.subquery(Long.class);
                Root<Venue> venueRoot = venueSubquery.from(Venue.class);
                venueSubquery.select(venueRoot.get("hall").get("id"));

                Predicate venuePredicate = cb.equal(venueRoot.get("hall").get("id"), root.get("id"));
                venuePredicate = cb.and(venuePredicate, cb.isTrue(venueRoot.get("active")));

                if (request.getMinCapacity() != null) {
                    venuePredicate = cb.and(venuePredicate,
                            cb.greaterThanOrEqualTo(venueRoot.get("capacity"), request.getMinCapacity()));
                }

                if (request.getMaxBudget() != null) {
                    venuePredicate = cb.and(venuePredicate,
                            cb.lessThanOrEqualTo(venueRoot.get("basePricePerHour"), request.getMaxBudget()));
                }

                if (request.getDate() != null && request.getStartTime() != null && request.getEndTime() != null) {
                    Subquery<Long> bookingSubquery = query.subquery(Long.class);
                    Root<Booking> bookingRoot = bookingSubquery.from(Booking.class);
                    bookingSubquery.select(cb.count(bookingRoot));
                    bookingSubquery.where(
                            cb.equal(bookingRoot.get("venue").get("id"), venueRoot.get("id")),
                            cb.equal(bookingRoot.get("bookingDate"), request.getDate()),
                            bookingRoot.get("status").in(BookingStatus.PENDING, BookingStatus.CONFIRMED),
                            cb.lessThan(bookingRoot.get("startTime"), request.getEndTime()),
                            cb.greaterThan(bookingRoot.get("endTime"), request.getStartTime())
                    );
                    venuePredicate = cb.and(venuePredicate, cb.equal(bookingSubquery, 0L));
                }

                venueSubquery.where(venuePredicate);
                predicate = cb.and(predicate, cb.exists(venueSubquery));
            }

            return predicate;
        };
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        return switch (sortBy) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
