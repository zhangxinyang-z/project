package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class EngineData {
    @JsonProperty("engine_id")
    private Integer engineId;

    public Integer getEngineId() {
        return this.engineId;
    }

    @JsonProperty("data")
    private List<CycleData> data;

    @Data
    public static class CycleData {

        @JsonProperty("cycle")
        private Integer cycle;

        @JsonProperty("op_setting1")
        private Double opSetting1;

        @JsonProperty("op_setting2")
        private Double opSetting2;

        @JsonProperty("op_setting3")
        private Double opSetting3;

        @JsonProperty("sensor1")
        private Double sensor1;

        @JsonProperty("sensor2")
        private Double sensor2;

        @JsonProperty("sensor3")
        private Double sensor3;

        @JsonProperty("sensor4")
        private Double sensor4;

        @JsonProperty("sensor5")
        private Double sensor5;
    }
}