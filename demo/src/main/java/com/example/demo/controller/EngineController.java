package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.entity.EngineData;
import com.example.demo.service.EngineService;
import com.example.demo.exception.EngineNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/engines")
public class EngineController {

    @Autowired
    private EngineService engineService;

    @GetMapping
    public List<EngineData> getAllEngines() throws Exception {
        return engineService.loadEngineData();
    }

    @GetMapping("/{engineId}")
    public ApiResponse<EngineData> getEngine(@PathVariable Integer engineId) {
        EngineData data = engineService.getEngineById(engineId);
        return ApiResponse.success(data);
    }
}