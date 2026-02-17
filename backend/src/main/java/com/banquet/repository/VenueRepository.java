package com.banquet.repository;

import com.banquet.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findByHallId(Long hallId);

    List<Venue> findByHallIdAndActiveTrue(Long hallId);
}
