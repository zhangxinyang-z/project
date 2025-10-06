# data_preprocessing.py
import re
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from config import DATASET_PATHS, SEQUENCE_LENGTH

def load_data():
    # 加载数据并清理空列
    train = pd.read_csv(DATASET_PATHS["train"], sep=" ", header=None)
    test = pd.read_csv(DATASET_PATHS["test"], sep=" ", header=None)
    rul = pd.read_csv(DATASET_PATHS["rul"], sep=" ", header=None)
    train.dropna(axis=1, how="all", inplace=True)
    test.dropna(axis=1, how="all", inplace=True)
    rul.dropna(axis=1, how="all", inplace=True)

    # 删除指定列（操作设置+低贡献传感器）
    columns_to_delete = [2, 3, 4] + list(range(5, 26))[4::5]  # 删除操作设置和指定传感器
    train.drop(train.columns[columns_to_delete], axis=1, inplace=True)
    test.drop(test.columns[columns_to_delete], axis=1, inplace=True)

    # 更新列名（保留的传感器编号需连续）
    num_sensors = train.shape[1] - 2  # 总列数减去id和cycle
    columns = ['id', 'cycle'] + [f'sensor_{i+1}' for i in range(num_sensors)]
    train.columns = columns
    test.columns = columns
    rul.columns = ['RUL']
    return train, test, rul
def calculate_rul(train, test, rul):
    """计算训练集和测试集的RUL"""
    # --- 训练集处理（保持不变）---
    train_rul = train.groupby('id')['cycle'].max().reset_index()
    train_rul.columns = ['id', 'max_cycle']
    train = train.merge(train_rul, on='id', how='left')
    train['RUL'] = train['max_cycle'] - train['cycle']
    train.drop(columns=['max_cycle'], inplace=True)

    # --- 测试集处理（关键修正）---
    # 1. 计算每个引擎的最大周期
    test_rul = test.groupby('id')['cycle'].max().reset_index()
    test_rul.columns = ['id', 'max_cycle']
    test = test.merge(test_rul, on='id', how='left')

    # 2. 合并外部RUL数据（确保索引匹配）
    # 确保rul有id列并与测试集对齐
    rul = rul.reset_index().rename(columns={'index': 'id'})  # 假设rul原本索引是id
    test = test.merge(rul, on='id', how='left')

    # 删除缺失RUL的样本（若必须保留可改为插值）
    test.dropna(subset=['RUL'], inplace=True)

    # 4. 清理临时列
    test.drop(columns=['max_cycle'], inplace=True)
    return train, test

def preprocess_features(train, test):
    # 转换传感器列为浮点类型
    original_sensor_cols = [col for col in train.columns if re.match(r'^sensor_\d+$', col)]
    train[original_sensor_cols] = train[original_sensor_cols].astype(np.float32)
    test[original_sensor_cols] = test[original_sensor_cols].astype(np.float32)

    # 执行标准化
    scaler = StandardScaler()
    train.loc[:, original_sensor_cols] = scaler.fit_transform(train[original_sensor_cols])
    test.loc[:, original_sensor_cols] = scaler.transform(test[original_sensor_cols])

    # 在 preprocess_features() 函数末尾保存 scaler 参数
    np.save("models/lstm_model/scaler_mean.npy", scaler.mean_)
    np.save("models/lstm_model/scaler_scale.npy", scaler.scale_)

    return train, test

def create_sequences(data, seq_length):
    # 增强版序列生成
    sequences, labels = [], []
    sensor_cols = [col for col in data.columns if 'sensor' in col]

    for engine_id in data['id'].unique():
        engine_data = data[data['id'] == engine_id]

        # 重叠滑动窗口（步长=5）
        for i in range(0, len(engine_data) - seq_length, 5):
            seq = engine_data.iloc[i:i + seq_length][sensor_cols].values
            label = engine_data.iloc[i + seq_length]['RUL']

            # 添加随机噪声增强
            if np.random.rand() > 0.5:
                seq = seq * (1 + np.random.normal(0, 0.01, seq.shape))

            sequences.append(seq)
            labels.append(label)

    return np.array(sequences), np.array(labels)

def preprocess_data():
    # 主函数：加载数据并生成训练和测试集
    train, test, rul = load_data()
    train, test = calculate_rul(train, test, rul)
    train, test = preprocess_features(train, test)
    X_train, y_train = create_sequences(train, SEQUENCE_LENGTH)
    X_test, y_test = create_sequences(test, SEQUENCE_LENGTH)
    return X_train, y_train, X_test, y_test

if __name__ == "__main__":
    X_train, y_train, X_test, y_test = preprocess_data()
    print("预处理完成，训练集形状:", X_train.shape, "测试集形状:", X_test.shape)