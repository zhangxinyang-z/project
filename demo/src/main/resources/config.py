# -*- coding: utf-8 -*-
# config.py
DATASET_PATHS = {
    "train": "CMAPSSData/train_FD001.txt",
    "test": "CMAPSSData/test_FD001.txt",
    "rul": "CMAPSSData/RUL_FD001.txt"
}

SEQUENCE_LENGTH = 30
TEST_SIZE = 0.2
RANDOM_STATE = 42
MODEL_PATH = "lstm_model.keras"