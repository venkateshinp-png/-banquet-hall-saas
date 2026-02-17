package com.banquet.repository;

import com.banquet.entity.HallDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HallDocumentRepository extends JpaRepository<HallDocument, Long> {

    List<HallDocument> findByHallId(Long hallId);

    void deleteByHallId(Long hallId);
}
