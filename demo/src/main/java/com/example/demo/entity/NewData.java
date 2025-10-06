package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "new_data")
public class NewData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Integer id;

    @Column(name = "ultrasonic")
    @JsonProperty("ultrasonic")
    private Float ultrasonic;

    @Column(name = "temperature")
    @JsonProperty("temperature")
    private Float temperature;

    @Column(name = "humidity")
    @JsonProperty("humidity")
    private Float humidity;

    @Column(name = "update_time")
    @JsonProperty("updateTime")
    private LocalDateTime updateTime;
}