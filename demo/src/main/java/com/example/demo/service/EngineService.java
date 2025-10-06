package com.example.demo.service;

import com.example.demo.exception.EngineNotFoundException;
import com.example.demo.entity.EngineData;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.List;


@Service
public class EngineService {
    public List<EngineData> loadEngineData() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(
                new ClassPathResource("data/engine_data.json").getInputStream(),
                new TypeReference<List<EngineData>>() {}
        );
    }

    public EngineData getEngineById(Integer engineId) throws EngineNotFoundException {
        try {
            List<EngineData> data = loadEngineData();
            return data.stream()
                    .filter(e -> e.getEngineId().equals(engineId))
                    .findFirst()
                    .orElseThrow(() -> new EngineNotFoundException(engineId));
        } catch (IOException e) {
            // 使用新构造函数传递字符串消息
            throw new EngineNotFoundException("系统数据加载失败，请检查配置: " + e.getMessage());
        }
    }
}