// src/main/java/com/example/demo/controller/PredictionController.java
package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/predict")
public class PredictionController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping
    public ResponseEntity<Map<String, Object>> predict(@RequestBody Map<String, Object> inputData) {
        try {
            float prediction = executePythonPrediction(inputData);
            Map<String, Object> response = new HashMap<>();
            response.put("prediction", prediction);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Prediction failed: " + e.getMessage());
        }
    }

    private float executePythonPrediction(Map<String, Object> inputData) throws Exception {
        // 构建Python命令
        String pythonScriptPath = "src/main/resources/predict.py";
        String inputJson = objectMapper.writeValueAsString(inputData);
        String command = String.format("python %s \"%s\"", pythonScriptPath, inputJson);

        // 执行命令
        Process process = Runtime.getRuntime().exec(command);

        // 读取输出
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String outputLine = reader.readLine();

        // 处理错误流
        BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        StringBuilder error = new StringBuilder();
        String errorLine;
        while ((errorLine = errorReader.readLine()) != null) {
            error.append(errorLine).append("\n");
        }
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new RuntimeException("Python脚本错误: \n" + error);
        }

        return Float.parseFloat(outputLine);
    }
}