package com.banquet.service;

import com.banquet.dto.BookingRequest;
import com.banquet.dto.BookingResponse;
import com.banquet.entity.BanquetHall;
import com.banquet.entity.Booking;
import com.banquet.entity.User;
import com.banquet.entity.Venue;
import com.banquet.entity.VenuePricing;
import com.banquet.enums.BookingStatus;
import com.banquet.repository.BookingRepository;
import com.banquet.repository.HallStaffRepository;
import com.banquet.repository.UserRepository;
import com.banquet.repository.VenuePricingRepository;
import com.banquet.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final VenuePricingRepository venuePricingRepository;
    private final HallStaffRepository hallStaffRepository;

    @Transactional
    public BookingResponse createBooking(Long customerId, BookingRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Venue venue = venueRepository.findById(request.venueId())
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        long overlapping = bookingRepository.countOverlapping(
                venue.getId(),
                request.bookingDate(),
                request.startTime(),
                request.endTime()
        );
        if (overlapping > 0) {
            throw new RuntimeException("The selected time slot is not available");
        }

        long durationHours = Duration.between(request.startTime(), request.endTime()).toHours();
        if (durationHours < venue.getMinBookingDurationHours()) {
            throw new RuntimeException("Minimum booking duration is " + venue.getMinBookingDurationHours() + " hours");
        }

        BigDecimal totalAmount = calculateAmount(venue, request.bookingDate(),
                request.startTime(), request.endTime());

        Booking booking = Booking.builder()
                .customer(customer)
                .venue(venue)
                .bookingDate(request.bookingDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .totalAmount(totalAmount)
                .paidAmount(BigDecimal.ZERO)
                .status(BookingStatus.PENDING)
                .paymentMode(request.paymentMode())
                .build();

        booking = bookingRepository.save(booking);
        return toBookingResponse(booking);
    }

    public List<BookingResponse> getCustomerBookings(Long customerId) {
        return bookingRepository.findByCustomerId(customerId).stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getHallBookings(Long hallId, Long userId) {
        verifyHallAccess(hallId, userId);
        return bookingRepository.findByVenueHallId(hallId).stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isCustomer = booking.getCustomer().getId().equals(userId);
        boolean isHallOwner = booking.getVenue().getHall().getOwner().getId().equals(userId);
        boolean isStaff = hallStaffRepository.existsByHallIdAndUserId(
                booking.getVenue().getHall().getId(), userId);

        if (!isCustomer && !isHallOwner && !isStaff) {
            throw new RuntimeException("Not authorized to view this booking");
        }

        return toBookingResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isCustomer = booking.getCustomer().getId().equals(userId);
        boolean isHallOwner = booking.getVenue().getHall().getOwner().getId().equals(userId);
        boolean isStaff = hallStaffRepository.existsByHallIdAndUserId(
                booking.getVenue().getHall().getId(), userId);

        if (!isCustomer && !isHallOwner && !isStaff) {
            throw new RuntimeException("Not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking = bookingRepository.save(booking);
        return toBookingResponse(booking);
    }

    public BookingResponse toBookingResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getCustomer().getId(),
                booking.getCustomer().getFullName(),
                booking.getVenue().getId(),
                booking.getVenue().getName(),
                booking.getVenue().getHall().getName(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getTotalAmount(),
                booking.getPaidAmount(),
                booking.getStatus(),
                booking.getPaymentMode(),
                booking.getCancellationReason(),
                booking.getCreatedAt()
        );
    }

    public BigDecimal calculateAmount(Venue venue, LocalDate date, LocalTime start, LocalTime end) {
        List<VenuePricing> pricingSlots = venuePricingRepository
                .findByVenueIdAndEffectiveDate(venue.getId(), date);

        if (pricingSlots.isEmpty()) {
            long minutes = Duration.between(start, end).toMinutes();
            BigDecimal hours = BigDecimal.valueOf(minutes)
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            return venue.getBasePricePerHour().multiply(hours)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal total = BigDecimal.ZERO;
        for (VenuePricing slot : pricingSlots) {
            LocalTime overlapStart = start.isBefore(slot.getSlotStart()) ? slot.getSlotStart() : start;
            LocalTime overlapEnd = end.isAfter(slot.getSlotEnd()) ? slot.getSlotEnd() : end;

            if (overlapStart.isBefore(overlapEnd)) {
                long overlapMinutes = Duration.between(overlapStart, overlapEnd).toMinutes();
                BigDecimal overlapHours = BigDecimal.valueOf(overlapMinutes)
                        .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
                total = total.add(slot.getPrice().multiply(overlapHours));
            }
        }

        if (total.compareTo(BigDecimal.ZERO) == 0) {
            long minutes = Duration.between(start, end).toMinutes();
            BigDecimal hours = BigDecimal.valueOf(minutes)
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            return venue.getBasePricePerHour().multiply(hours)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return total.setScale(2, RoundingMode.HALF_UP);
    }

    private void verifyHallAccess(Long hallId, Long userId) {
        BanquetHall hall = venueRepository.findByHallId(hallId).stream()
                .findFirst()
                .map(Venue::getHall)
                .orElseThrow(() -> new RuntimeException("Hall not found or has no venues"));

        boolean isOwner = hall.getOwner().getId().equals(userId);
        boolean isStaff = hallStaffRepository.existsByHallIdAndUserId(hallId, userId);

        if (!isOwner && !isStaff) {
            throw new RuntimeException("Not authorized to view bookings for this hall");
        }
    }
}
