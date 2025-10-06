package com.example.demo.repository;

import com.example.demo.entity.HumidityHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface HumidityHistoryRepository extends JpaRepository<HumidityHistory, Integer> {
    List<HumidityHistory> findByRecordTimeBetweenOrderByRecordTime(
            LocalDateTime start,
            LocalDateTime end
    );
}