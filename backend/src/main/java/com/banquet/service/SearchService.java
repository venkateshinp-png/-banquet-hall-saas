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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.*;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final BanquetHallRepository hallRepository;
    private final HallService hallService;

    public Page<HallResponse> searchHalls(SearchRequest request) {
        Specification<BanquetHall> spec = buildSpecification(request);

        Sort sort = buildSort(request.getSortBy());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<BanquetHall> page = hallRepository.findAll(spec, pageable);
        return page.map(hallService::toHallResponse);
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

            if (request.getZipcode() != null && !request.getZipcode().isBlank()) {
                predicate = cb.and(predicate,
                        cb.equal(root.get("zipcode"), request.getZipcode()));
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
