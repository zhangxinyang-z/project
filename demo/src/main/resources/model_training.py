# -*- coding: utf-8 -*-
# model_training.py
import tensorflow as tf
from keras.src.layers import LayerNormalization, TimeDistributed, GlobalAveragePooling1D
from tensorflow.keras import Sequential
from tensorflow.keras.models import load_model
from tensorflow.keras.saving import register_keras_serializable
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.callbacks import EarlyStopping, TensorBoard, ReduceLROnPlateau
from sklearn.model_selection import train_test_split
from config import SEQUENCE_LENGTH, TEST_SIZE, RANDOM_STATE, MODEL_PATH
from tensorflow.keras.layers import Layer
import datetime



def build_lstm_model(input_shape):
    model = Sequential([
        # 第一层：双向LSTM
        Bidirectional(
            LSTM(128, return_sequences=True),
            input_shape=input_shape
        ),
        LayerNormalization(),
        Dropout(0.3),

        # 第二层：双向LSTM + Attention
        Bidirectional(
            LSTM(64, return_sequences=True)
        ),
        AttentionLayer(),  # 输出形状 (None, 30, 64)
        LayerNormalization(),
        Dropout(0.3),

        # 时间分布式全连接
        TimeDistributed(Dense(32, activation='relu')),

        # 全局平均池化
        GlobalAveragePooling1D(),

        # 输出层
        Dense(1, activation='linear')
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='huber_loss',
        metrics=['mae', tf.keras.metrics.RootMeanSquaredError()]
    )
    return model


@register_keras_serializable(package="CustomLayers", name="AttentionLayer")
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


def train_model(X_train, y_train):
    """修正后的训练流程"""
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.15,
        random_state=RANDOM_STATE
    )

    # 创建学习率调度器（传递给优化器，不作为回调）
    lr_schedule = tf.keras.optimizers.schedules.CosineDecayRestarts(
        initial_learning_rate=0.001,
        first_decay_steps=1000,
        t_mul=2.0,
        m_mul=0.9
    )

    # 构建模型（使用修正后的build_lstm_model）
    model = build_lstm_model((X_train.shape[1], X_train.shape[2]))

    # 使用带学习率调度的优化器
    optimizer = tf.keras.optimizers.Adam(learning_rate=lr_schedule)
    model.compile(
        optimizer=optimizer,
        loss='huber_loss',
        metrics=['mae']
    )

    callbacks = [
        EarlyStopping(monitor='val_loss', patience=20, restore_best_weights=True),
        TensorBoard(log_dir="logs/" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
    ]

    history = model.fit(
        X_train, y_train,
        epochs=100,
        batch_size=128,
        validation_data=(X_val, y_val),
        callbacks=callbacks,
        verbose=1
    )
    model.save(MODEL_PATH)
    return model

if __name__ == "__main__":
    from data_preprocessing import X_train, y_train

    print(f"[数据验证] X_train 形状: {X_train.shape}, y_train 形状: {y_train.shape}")
    history = train_model(X_train, y_train)
    print("模型训练完成，已保存至", MODEL_PATH)