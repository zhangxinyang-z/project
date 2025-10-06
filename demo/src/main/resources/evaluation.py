# -*- coding: utf-8 -*-
# evaluation.py
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Layer
import tensorflow as tf
from scipy.signal import savgol_filter
from config import MODEL_PATH


class AttentionLayer(Layer):
    def __init__(self, **kwargs):
        super(AttentionLayer, self).__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(
            name='attention_weight',
            shape=(input_shape[-1], 1),
            initializer='glorot_uniform',
            trainable=True
        )
        super(AttentionLayer, self).build(input_shape)

    def call(self, x):
        # 输入x形状: (batch_size, timesteps, features)
        e = tf.tanh(tf.matmul(x, self.W))  # (batch_size, timesteps, 1)
        a = tf.nn.softmax(e, axis=1)       # 沿时间步的注意力权重
        return x * a  # 保持三维形状 (batch_size, timesteps, features)


def evaluate_model(model_path, X_test, y_test):
    """评估模型并输出指标"""
    y_pred = None  # 初始化变量

    try:
        # 加载模型时注册自定义层
        model = load_model(
            model_path,
            custom_objects={'AttentionLayer': AttentionLayer}
        )
        print(f"成功加载模型: {model_path}")

        # 输入形状验证
        if X_test.shape[1:] != model.input_shape[1:]:
            raise ValueError(f"输入形状不匹配！模型期望: {model.input_shape[1:]}, 实际输入: {X_test.shape[1:]}")

        # 预测
        y_pred = model.predict(X_test, verbose=1)
        y_pred = savgol_filter(y_pred.squeeze(), 11, 3)  # 平滑处理

    except Exception as e:
        print(f"模型加载或预测失败: {str(e)}")
        return  # 直接返回，避免使用未定义的y_pred

    # 检查 NaN（现在y_pred已确保定义）
    print(f"y_test NaN数量: {np.isnan(y_test).sum()}")
    print(f"y_pred NaN数量: {np.isnan(y_pred).sum()}")
    print(f"X_test NaN数量: {np.isnan(X_test).sum()}")

    if np.isnan(y_test).any() or np.isnan(y_pred).any() or np.isnan(X_test).any():
        raise ValueError("评估数据包含 NaN，请检查数据预处理和模型训练！")

    # 计算指标
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"MAE: {mae:.2f}, RMSE: {rmse:.2f}, R²: {r2:.2f}")
    # 添加百分位误差
    percentile_errors = np.percentile(np.abs(y_test - y_pred), [25, 50, 75])
    print(f"25/50/75百分位绝对误差: {percentile_errors}")

    # 残差分析
    residuals = y_test - y_pred
    plt.figure(figsize=(12, 6))
    plt.scatter(y_pred, residuals, alpha=0.3)
    plt.axhline(y=0, color='r', linestyle='--')
    plt.xlabel("Predicted RUL")
    plt.ylabel("Residuals")
    plt.title("残差分析图")
    plt.savefig("residual_analysis.png")
    # 可视化
    plt.figure(figsize=(12, 6))
    plt.plot(y_test[:200], label='True RUL', alpha=0.7)
    plt.plot(y_pred[:200], label='Predicted RUL', alpha=0.7)
    plt.xlabel("Sample Index")
    plt.ylabel("RUL")
    plt.legend()
    plt.savefig("rul_prediction.png")
    plt.show()

    plt.figure(figsize=(12, 6))
    plt.plot(y_test[:200], label='True RUL', linewidth=2)
    plt.plot(y_pred[:200], label='Predicted RUL', alpha=0.7)
    plt.fill_between(
        range(len(y_pred[:200])),
        y_pred[:200] - 10,  # 误差带
        y_pred[:200] + 10,
        color='orange',
        alpha=0.2
    )
    plt.title("RUL预测结果 (带误差范围)")
    plt.legend()
    plt.grid(True)

if __name__ == "__main__":
    from data_preprocessing import X_test, y_test
    print(f"[数据验证] X_test 形状: {X_test.shape}, y_test 形状: {y_test.shape}")
    evaluate_model(MODEL_PATH, X_test, y_test)