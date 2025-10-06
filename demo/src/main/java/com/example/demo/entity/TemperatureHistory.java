package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "temperature_history")
public class TemperatureHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")  // 明确指定JSON字段名
    private Integer id;

    @Column(name = "value")
    @JsonProperty("value")
    private Float value;

    @Column(name = "record_time")
    @JsonProperty("recordTime")
    private LocalDateTime recordTime;
}