package com.banquet.repository;

import com.banquet.entity.Booking;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByVenueId(Long venueId);

    List<Booking> findByVenueHallId(Long hallId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.venue.id = :venueId " +
            "AND b.bookingDate = :date " +
            "AND (b.status = com.banquet.enums.BookingStatus.PENDING OR b.status = com.banquet.enums.BookingStatus.CONFIRMED) " +
            "AND b.startTime < :endTime " +
            "AND b.endTime > :startTime")
    long countOverlapping(@Param("venueId") Long venueId,
                          @Param("date") LocalDate date,
                          @Param("startTime") LocalTime startTime,
                          @Param("endTime") LocalTime endTime);
}
