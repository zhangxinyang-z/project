package com.example.demo.repository;

import com.example.demo.entity.NewData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface NewDataRepository extends JpaRepository<NewData, Integer> {
    Optional<NewData> findFirstByOrderByUpdateTimeDesc();
}