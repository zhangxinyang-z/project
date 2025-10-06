package com.example.demo.controller;

import com.example.demo.entity.NewData;
import com.example.demo.repository.NewDataRepository;
import com.example.demo.entity.DistanceHistory;
import com.example.demo.entity.HumidityHistory;
import com.example.demo.entity.TemperatureHistory;
import com.example.demo.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/sensor")
public class SensorController {
    private final SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    @GetMapping("/history/temperature")
    public ResponseEntity<List<TemperatureHistory>> getTempHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(sensorService.getTemperatureHistory(date));
    }

    @GetMapping("/history/humidity")
    public ResponseEntity<List<HumidityHistory>> getHumidityHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(sensorService.getHumidityHistory(date));
    }

    @GetMapping("/history/distance")
    public ResponseEntity<List<DistanceHistory>> getDistanceHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(sensorService.getDistanceHistory(date));
    }

    @GetMapping("/realtime")
    public ResponseEntity<NewData> getRealtimeData() {
        NewData data = sensorService.getRealtimeData();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(1, TimeUnit.SECONDS)) // 1秒缓存
                .body(data);
    }
}