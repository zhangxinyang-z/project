package com.example.demo.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "new_data")
public class SensorData {
    @Id
    private Integer id;

    @Column(name = "ultrasonic")
    private Float distance;

    @Column(name = "temperature")
    private Float temperature;

    @Column(name = "humidity")
    private Float humidity;

    @Column(name = "update_time")
    private LocalDateTime updateTime;
}