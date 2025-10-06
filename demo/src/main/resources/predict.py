# predict.py
import tensorflow as tf
import numpy as np
from sklearn.preprocessing import StandardScaler

def custom_preprocess(input_data, sequence_length=30, num_features=17):
    """独立预处理函数（确保与模型训练时的维度一致）"""
    # 加载标准化参数
    scaler = StandardScaler()
    scaler.mean_ = np.load("models/lstm_model/scaler_mean.npy", allow_pickle=True)
    scaler.scale_ = np.load("models/lstm_model/scaler_scale.npy", allow_pickle=True)

    # 检查标准化参数的特征数量是否与模型期望一致
    if scaler.mean_.shape[0] != num_features:
        raise ValueError(f"标准化参数的特征数量应为 {num_features}，但实际为 {scaler.mean_.shape[0]}。")

    # 将输入数据转换为二维数组（样本数 x 特征数）
    sensor_data = np.array(input_data["sensor_readings"], dtype=np.float32).reshape(1, -1)

    # 检查输入数据的特征数量是否与模型期望一致
    if sensor_data.shape[1] != num_features:
        raise ValueError(f"输入数据的特征数量应为 {num_features}，但实际为 {sensor_data.shape[1]}。")

    # 标准化数据
    processed_data = scaler.transform(sensor_data)

    # 调整为 LSTM 输入形状 (batch_size, sequence_length, num_features)
    # 如果数据不足 sequence_length 长度，用边缘值填充
    if processed_data.shape[1] < sequence_length:
        processed_data = np.pad(processed_data, ((0, 0), (0, sequence_length - processed_data.shape[1])), mode='edge')

    # 如果数据超过 sequence_length 长度，截取前 sequence_length 长度
    elif processed_data.shape[1] > sequence_length:
        processed_data = processed_data[:, :sequence_length]

    # 确保 processed_data 的形状为 (1, sequence_length, num_features)
    processed_data = processed_data.reshape(1, sequence_length, num_features)  # (batch_size, seq_len, features)
    return processed_data

if __name__ == "__main__":
    # 示例输入（实际可通过命令行参数或其他方式传递）
    example_input = {
        "sensor_readings": [
            518.67, 643.02, 1585.29, 1398.21, 21.61, 553.9, 2388.04, 9050.17, 47.2, 521.72,
            2388.03, 8125.55, 0.03, 392, 2388, 100.0, 23.3735
        ]
    }

    # 预处理输入数据
    processed_data = custom_preprocess(example_input)

    # 加载模型
    model = tf.saved_model.load("models/lstm_model")
    infer = model.signatures["serving_default"]

    # 预测
    input_tensor = tf.constant(processed_data, dtype=tf.float32)
    output = infer(input_tensor)

    # 打印预测结果
    print("预测结果:", float(output["output_0"].numpy()[0][0]))