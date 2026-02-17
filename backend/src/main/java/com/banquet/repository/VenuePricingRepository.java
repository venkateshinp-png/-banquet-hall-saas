package com.banquet.repository;

import com.banquet.entity.VenuePricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VenuePricingRepository extends JpaRepository<VenuePricing, Long> {

    List<VenuePricing> findByVenueIdAndEffectiveDate(Long venueId, LocalDate date);

    void deleteByVenueIdAndEffectiveDate(Long venueId, LocalDate date);
}
