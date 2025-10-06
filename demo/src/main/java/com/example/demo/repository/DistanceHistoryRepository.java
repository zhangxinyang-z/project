package com.example.demo.repository;

import com.example.demo.entity.DistanceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DistanceHistoryRepository extends JpaRepository<DistanceHistory, Integer> {
    List<DistanceHistory> findByRecordTimeBetweenOrderByRecordTime(
            LocalDateTime start,
            LocalDateTime end
    );
}