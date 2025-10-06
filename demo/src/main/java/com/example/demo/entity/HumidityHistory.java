package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "humidity_history")
public class HumidityHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Integer id;

    @Column(name = "value")
    @JsonProperty("value")
    private Float value;

    @Column(name = "record_time")
    @JsonProperty("recordTime")
    private LocalDateTime recordTime;
}