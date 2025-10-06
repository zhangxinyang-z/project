# -*- coding: utf-8 -*-
# main.py
from data_preprocessing import load_data, calculate_rul, preprocess_features, create_sequences
from model_training import train_model
from evaluation import evaluate_model
from config import SEQUENCE_LENGTH, MODEL_PATH

def main():
    # 数据预处理
    train, test, rul = load_data()
    train, test = calculate_rul(train, test, rul)
    train, test = preprocess_features(train, test)
    X_train, y_train = create_sequences(train, SEQUENCE_LENGTH)
    X_test, y_test = create_sequences(test, SEQUENCE_LENGTH)

    # 模型训练
    model = train_model(X_train, y_train)

    # 模型评估
    evaluate_model(MODEL_PATH, X_test, y_test)

if __name__ == "__main__":
    main()