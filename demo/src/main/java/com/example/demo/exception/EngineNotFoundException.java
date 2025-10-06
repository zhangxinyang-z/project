package com.example.demo.exception;

public class EngineNotFoundException extends RuntimeException {

    // 原构造函数（接收引擎ID）
    public EngineNotFoundException(Integer engineId) {
        super("引擎数据不存在 (ID: " + engineId + ")");
    }

    // 新增构造函数（接收自定义消息）
    public EngineNotFoundException(String message) {
        super(message);
    }

    // 可选：同时接收ID和自定义消息
    public EngineNotFoundException(Integer engineId, String message) {
        super("引擎ID: " + engineId + " 错误原因: " + message);
    }
}