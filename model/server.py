from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import xgboost as xgb
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

current_directory = os.getcwd()
print("Текущая директория:", current_directory)


def check_model_loaded(model_path):
    try:
        loaded_model = joblib.load(model_path)
        print("Модель успешно загружена.")
        return loaded_model
    except Exception as e:
        print("Произошла ошибка при загрузке модели:", e)
        return None
    
loaded_model = check_model_loaded('model/XGBOOST_model.pkl')


def predict(data):
    try:
        print(data)
        data['month'], data['year']  = data['year_month'].split('-')[1], data['year_month'].split('-')[0]
        del data['year_month']
        for key in data:
            data[key] = float(data[key])

        # Проверка на ошибки
        if data['level'] > data['levels']:
            raise ValueError("A floor cannot be higher than the total number of floors.")
        
        if data['kitchen_area'] > data['area']:
            raise ValueError("The size of the kitchen cannot be larger than the total area of the apartment.")

        data_array = [data['geo_lat'], data['geo_lon'], data['building_type'], data['level'], data['levels'], data['rooms'], data['area'], data['kitchen_area'], data['object_type'], data['level']/data['levels'], data['year'], data['month'], data['area']/data['rooms']]

        data_for_prediction = [data_array]
        result = loaded_model.predict(data_for_prediction)
        print(data_for_prediction)
        print(result)
        return result.tolist()
    except Exception as e:
        raise ValueError("Data error: " + str(e))



@app.route('/predict', methods=['POST'])
def make_prediction():
    try:
        data = request.form.to_dict()
        print("Received data:", data)  

        prediction_result = predict(data)
        print("Prediction result:", prediction_result) 

        return jsonify({'result': prediction_result})
    except ValueError as e:
        print("Error:", e)  
        return jsonify({'error': str(e)}), 400  
    except Exception as e:
        print("Error:", e)  
        return jsonify({'error': "Internal Error"}), 500 


    
if __name__ == '__main__':
    app.run(host='localhost', port=8000, debug=True)