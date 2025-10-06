package com.example.demo.service;

import com.example.demo.entity.NewData;
import com.example.demo.repository.NewDataRepository;
import com.example.demo.entity.DistanceHistory;
import com.example.demo.entity.HumidityHistory;
import com.example.demo.entity.TemperatureHistory;
import com.example.demo.repository.DistanceHistoryRepository;
import com.example.demo.repository.HumidityHistoryRepository;
import com.example.demo.repository.TemperatureHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SensorService {
    private final TemperatureHistoryRepository tempHistoryRepo;
    private final HumidityHistoryRepository humidityHistoryRepo;
    private final DistanceHistoryRepository distanceHistoryRepo;
    private final NewDataRepository newDataRepository;

    @Autowired
    public SensorService(TemperatureHistoryRepository tempHistoryRepo,
                         HumidityHistoryRepository humidityHistoryRepo,
                         DistanceHistoryRepository distanceHistoryRepo,
                         NewDataRepository newDataRepository) {
        this.tempHistoryRepo = tempHistoryRepo;
        this.humidityHistoryRepo = humidityHistoryRepo;
        this.distanceHistoryRepo = distanceHistoryRepo;
        this.newDataRepository = newDataRepository;
    }

    public List<TemperatureHistory> getTemperatureHistory(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = start.plusDays(1).minusNanos(1);
        return tempHistoryRepo.findByRecordTimeBetweenOrderByRecordTime(start, end);
    }

    public List<HumidityHistory> getHumidityHistory(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = start.plusDays(1).minusNanos(1);
        return humidityHistoryRepo.findByRecordTimeBetweenOrderByRecordTime(start, end);
    }

    public List<DistanceHistory> getDistanceHistory(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = start.plusDays(1).minusNanos(1);
        return distanceHistoryRepo.findByRecordTimeBetweenOrderByRecordTime(start, end);
    }

    public NewData getRealtimeData() {
        return newDataRepository.findFirstByOrderByUpdateTimeDesc().orElse(null);
    }
}