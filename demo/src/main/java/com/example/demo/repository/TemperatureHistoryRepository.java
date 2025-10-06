package com.example.demo.repository;

import com.example.demo.entity.TemperatureHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TemperatureHistoryRepository extends JpaRepository<TemperatureHistory, Integer> {
    List<TemperatureHistory> findByRecordTimeBetweenOrderByRecordTime(
            LocalDateTime start,
            LocalDateTime end
    );
}