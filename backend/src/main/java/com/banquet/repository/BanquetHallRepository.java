package com.banquet.repository;

import com.banquet.entity.BanquetHall;
import com.banquet.enums.HallStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BanquetHallRepository extends JpaRepository<BanquetHall, Long>,
        JpaSpecificationExecutor<BanquetHall> {

    List<BanquetHall> findByOwnerId(Long ownerId);

    List<BanquetHall> findByStatus(HallStatus status);

    List<BanquetHall> findByStatusAndCityIgnoreCase(HallStatus status, String city);
}
