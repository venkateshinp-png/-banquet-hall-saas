package com.banquet.repository;

import com.banquet.entity.HallStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HallStaffRepository extends JpaRepository<HallStaff, Long> {

    List<HallStaff> findByHallId(Long hallId);

    List<HallStaff> findByUserId(Long userId);

    Optional<HallStaff> findByHallIdAndUserId(Long hallId, Long userId);

    boolean existsByHallIdAndUserId(Long hallId, Long userId);
}
