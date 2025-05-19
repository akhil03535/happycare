import tensorflow as tf
import tensorflowjs as tfjs
import numpy as np

def convert_model():
    # Load the model
    model = tf.keras.models.load_model('lstm_ecg_model.h5')
    
    # Convert and save the model
    tfjs.converters.save_keras_model(model, 'public/lstm_ecg_model')

if __name__ == '__main__':
    convert_model()
