package com.banquet.repository;

import com.banquet.entity.BanquetHall;
import com.banquet.enums.HallStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BanquetHallRepository extends JpaRepository<BanquetHall, Long>,
        JpaSpecificationExecutor<BanquetHall> {

    List<BanquetHall> findByOwnerId(Long ownerId);

    List<BanquetHall> findByStatus(HallStatus status);

    List<BanquetHall> findByStatusAndCityIgnoreCase(HallStatus status, String city);

    List<BanquetHall> findByStatusAndZipcode(HallStatus status, String zipcode);

    @Query(value = """
        SELECT h.*, 
            (6371 * acos(
                cos(radians(:lat)) * cos(radians(h.latitude)) * 
                cos(radians(h.longitude) - radians(:lng)) + 
                sin(radians(:lat)) * sin(radians(h.latitude))
            )) AS distance
        FROM banquet_halls h
        WHERE h.status = 'APPROVED'
            AND h.latitude IS NOT NULL 
            AND h.longitude IS NOT NULL
            AND (6371 * acos(
                cos(radians(:lat)) * cos(radians(h.latitude)) * 
                cos(radians(h.longitude) - radians(:lng)) + 
                sin(radians(:lat)) * sin(radians(h.latitude))
            )) < :radius
        ORDER BY distance
        """, nativeQuery = true)
    List<BanquetHall> findNearbyHalls(
            @Param("lat") Double latitude,
            @Param("lng") Double longitude,
            @Param("radius") Double radiusKm
    );
}
