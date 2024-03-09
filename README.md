# Designing-Web-applications
![Пример изображения](/images/main.png)
## Описание

Это веб-приложение предназначено для продажи недвижимости и предсказания цен на недвижимость с использованием алгоритма XGBRegressor. Приложение также использует базу данных MongoDB для хранения информации о недвижимости и пользователях.

## Особенности

- Современный дизайн
- Инструменты для работы с данными
- Интеграция модели машинного обучения
- Визуализация данных

## Технологии

- Python для бэкенда
- Flask для веб-фреймворка
- MongoDB для хранения данных
- XGBRegressor для предсказания цен на недвижимость
- HTML, CSS и JavaScript для фронтенда

## Установка проекта
1. Распакуйте/склонируйте проект
2. Установите MongoDB
3. **Python:**
   Установите необходимые библиотеки Python из файла `requirements.txt` с помощью следующей команды:
   ```bash
   pip install -r requirements.txt
    ```
4. **Node:**
    Установите модули Node.js с помощью следующей команды: 
    ```bash
    npm install
    ```
## Запуск проекта
1. Установите все необходимые зависимости (предыдущий пункт)
2. Убедитесь, что MongoDB запущен и доступен.
3. Запустите приложение для работы модели, выполнив `python model/server.py`.
4. Запустите локальный сервер при помощи `node app.js`.
5. Откройте браузер и перейдите по адресу `http://localhost:5000`.

## Зависимости

### Для Node:

- [axios](https://www.npmjs.com/package/axios) (^1.6.2)
- [ejs](https://www.npmjs.com/package/ejs) (^3.1.9)
- [express](https://www.npmjs.com/package/express) (^4.18.2)
- [mongoose](https://www.npmjs.com/package/mongoose) (^8.0.2)

### Для Python:

- [Flask](https://pypi.org/project/Flask/) (^3.0.2)
- [Flask_Cors](https://pypi.org/project/Flask-Cors/) (^4.0.0)
- [joblib](https://pypi.org/project/joblib/) (^1.3.2)
- [xgboost](https://pypi.org/project/xgboost/) (^2.0.3)

## MongoDB-модели

### Модель обратной связи (Feedback)

```javascript
const FeedbackSchema = new mongoose.Schema({
  name: { type: String, required: false },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  messageType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', FeedbackSchema);
```
- **name**: Имя отправителя *(String, необязательное поле)*.
- **phone**: Номер телефона отправителя *(String, обязательное поле)*.
- **email**: Email адрес отправителя *(String, обязательное поле)*.
- **message**: Сообщение обратной связи *(String, обязательное поле)*.
- **messageType**: Тип сообщения *(String, обязательное поле)*. Например, "Покупка", "Продажа", "Общая консультация".
- **createdAt**: Дата и время создания записи *(Date, по умолчанию текущая дата и время)*.


### Модель квартиры (realEstate)
```javascript
const realEstateSchema = new mongoose.Schema({
  building_type: { type: String, required: true },
  level: { type: Number, required: true },
  levels: { type: Number, required: true },
  rooms: { type: Number, required: true },
  area: { type: Number, required: true },
  kitchen_area: { type: Number, required: true },
  object_type: { type: String, required: true },
  price: { type: Number, required: true },
});
const RealEstate = mongoose.model('RealEstate', realEstateSchema);
```
- **building_type**: Тип здания *(String, обязательное поле)*.
- **level**: Этаж квартиры *(Number, обязательное поле)*.
- **levels**: Общее количество этажей в здании *(Number, обязательное поле)*.
- **rooms**: Количество комнат в квартире *(Number, обязательное поле)*.
- **area**: Общая площадь квартиры в квадратных метрах *(Number, обязательное поле)*.
- **kitchen_area**: Площадь кухни в квартире в квадратных метрах *(Number, обязательное поле)*.
- **object_type**: Тип объекта недвижимости *(String, обязательное поле)*.
- **price**: Цена квартиры *(Number, обязательное поле)*.