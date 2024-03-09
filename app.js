const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const cors = require('cors');
var html = require('html');

app.use(cors());
app.use(express.static('styles'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname));

mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Успешное подключение к базе данных');
  })
  .catch((error) => {
    console.error('Ошибка подключения к базе данных:', error);
  });

const FeedbackSchema = new mongoose.Schema({
  name: { type: String, required: false },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  messageType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


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
const Feedback = mongoose.model('Feedback', FeedbackSchema);

/*
RealEstate.deleteMany({})
  .then(() => {
    console.log('Все данные удалены');
  })
  .catch((err) => {
    console.error(err);
  });
*/


app.set('views', __dirname); //app.set('views', path.join(__dirname, 'views')); app.set('views', __dirname)
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index.html', { schema: null, data: null });
});

app.post('/feedback', (req, res) => {
  const feedback = new Feedback(req.body);

  feedback.save()
    .then(() => {
      res.send(`
        <script>
          alert('Ваш отзыв успешно отправлен');
          window.location.href = 'http://localhost:3000/index.html';
        </script>
      `);
    })
    .catch((error) => {
      console.error(error);
      res.redirect('/error');
    });
});


app.post('/realestate', (req, res) => {
  const realEstate = new RealEstate(req.body);

  realEstate.save()
    .then(() => {
      res.send(`
        <script>
          alert('Ваши данные успешно отправлены');
          window.location.href = 'http://localhost:3000/index.html';
        </script>
      `);
    })
    .catch((error) => {
      console.error(error);
      res.redirect('/error');
    });
});


app.get('/requests-per-day', (req, res) => {
  Feedback.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ])
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      console.error('Ошибка при получении данных:', error);
      res.status(500).json({ error: 'Произошла ошибка при получении данных' });
    });
});

app.get('/message-type-count', (req, res) => {
  Feedback.aggregate([
    {
      $group: {
        _id: "$messageType",
        count: { $sum: 1 }
      }
    }
  ])
    .then(data => {
      const messageTypeCount = {};
      data.forEach(item => {
        messageTypeCount[item._id] = item.count;
      });
      res.json(messageTypeCount);
    })
    .catch(error => {
      console.error('Ошибка при получении данных:', error);
      res.status(500).json({ error: 'Произошла ошибка при получении данных' });
    });
});

app.get('/real-estate-data', (req, res) => {
  RealEstate.find({})
    .then(data => res.json(data))
})


// Обновим маршрут для получения данных с возможностью поиска
app.get('/data/:schema', (req, res) => {
  const schema = req.params.schema;
  const searchColumn = req.query.column;
  const searchValue = req.query.value;
  let Model;

  // Determine the model based on the selected schema
  if (schema === 'feedback') {
    Model = Feedback;
  } else if (schema === 'real-estate') {
    Model = RealEstate;
  } else {
    return res.status(400).json({ error: 'Invalid schema' });
  }

  let query = {};

  // If search column and value are provided, add them to the query
  if (searchColumn && searchValue) {
    query[searchColumn] = { $regex: searchValue, $options: 'i' };
  }

  // Find data based on the selected schema and search query
  Model.find(query)
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch data' });
    });
});


function viewData() {
  const selectElement = document.getElementById('schema-select');
  const selectedSchema = selectElement.value;

  // Make a GET request to fetch data from the selected schema
  fetch(`/data/${selectedSchema}`)
    .then(response => response.json())
    .then(data => {
      const table = document.getElementById('data-table');
      table.innerHTML = '';

      // Create table headers
      const headers = Object.keys(data[0]);
      const headerRow = document.createElement('tr');
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });
      headerRow.appendChild(document.createElement('th')); // Add an empty header for the delete button
      table.appendChild(headerRow);

      // Populate table with data
      data.forEach(row => {
        const dataRow = document.createElement('tr');
        headers.forEach(header => {
          const td = document.createElement('td');
          td.textContent = row[header];
          dataRow.appendChild(td);
        });

        // Add a button to edit this row
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = function() {
          editRow(row._id, selectedSchema, headers, row);
        };
        const editButtonCell = document.createElement('td');
        editButtonCell.appendChild(editButton);
        dataRow.appendChild(editButtonCell);

        // Add a button to delete this row
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function() {
          deleteRow(row._id, selectedSchema);
        };
        const deleteButtonCell = document.createElement('td');
        deleteButtonCell.appendChild(deleteButton);
        dataRow.appendChild(deleteButtonCell);

        table.appendChild(dataRow);
      });
    })
    .catch(error => {
      console.log('Failed to fetch data: ' + error);
    });
}


function editRow(id, schema, headers, rowData) {
  const newValue = prompt('Enter new value:');
  if (newValue === null) return; // If user cancels, do nothing

  const selectField = prompt('Enter field to update:');
  if (selectField === null) return; // If user cancels, do nothing

  const dataToUpdate = {};
  headers.forEach(header => {
    if (header === selectField) {
      dataToUpdate[header] = newValue;
    } else {
      dataToUpdate[header] = rowData[header];
    }
  });

  // Make a PUT request to update the record in the selected schema
  fetch(`/data/${schema}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToUpdate)
  })
  .then(response => response.json())
  .then(data => {
    // Refresh the table after updating the record
    viewData();
  })
  .catch(error => {
    console.log('Failed to update data: ' + error);
  });
}

app.put('/data/:schema/:id', (req, res) => {
  const schema = req.params.schema;
  const id = req.params.id;
  const newData = req.body;
  let Model;

  // Determine the model based on the selected schema
  if (schema === 'feedback') {
    Model = Feedback;
  } else if (schema === 'real-estate') {
    Model = RealEstate;
  } else {
    return res.status(400).json({ error: 'Invalid schema' });
  }

  // Update the record with the specified ID in the selected schema
  Model.updateOne({ _id: id }, { $set: newData })
    .then(() => {
      res.json({ message: 'Record updated successfully' });
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to update record' });
    });
});


function deleteRow(id, schema) {
  // Make a DELETE request to delete the record from the selected schema
  fetch(`/data/${schema}/${id}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
      // Refresh the table after deleting the record
      viewData();
    })
    .catch(error => {
      console.log('Failed to delete data: ' + error);
    });
}

app.delete('/data/:schema/:id', (req, res) => {
  const schema = req.params.schema;
  const id = req.params.id;
  let Model;

  // Determine the model based on the selected schema
  if (schema === 'feedback') {
    Model = Feedback;
  } else if (schema === 'real-estate') {
    Model = RealEstate;
  } else {
    return res.status(400).json({ error: 'Invalid schema' });
  }

  // Delete the record with the specified ID from the selected schema
  Model.deleteOne({ _id: id })
    .then(() => {
      res.json({ message: 'Record deleted successfully' });
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to delete record' });
    });
});

app.get('/data/:schema', (req, res) => {
  const schema = req.params.schema;
  const searchColumn = req.query.column;
  const searchValue = req.query.value;
  let Model;

  // Determine the model based on the selected schema
  if (schema === 'feedback') {
    Model = Feedback;
  } else if (schema === 'real-estate') {
    Model = RealEstate;
  } else {
    return res.status(400).json({ error: 'Invalid schema' });
  }

  let query = {};

  // If search column and value are provided, add them to the query
  if (searchColumn && searchValue) {
    query[searchColumn] = { $regex: searchValue, $options: 'i' };
  }

  // Find data based on the selected schema and search query
  Model.find(query)
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch data' });
    });
});


app.get('/data/:schema/:id', (req, res) => {
  const schema = req.params.schema;
  const id = req.params.id;
  let Model;

  // Determine the model based on the selected schema
  if (schema === 'feedback') {
    Model = Feedback;
  } else if (schema === 'real-estate') {
    Model = RealEstate;
  } else {
    return res.status(400).json({ error: 'Invalid schema' });
  }

  // Find data based on the selected schema and id
  Model.findById(id)
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to fetch data' });
    });
});

function searchById() {
  const idInput = document.getElementById('id-input').value;
  const selectElement = document.getElementById('schema-select');
  const selectedSchema = selectElement.value;

  // Make a GET request to fetch data from the selected schema by _id
  fetch(`/data/${selectedSchema}/${idInput}`)
    .then(response => response.json())
    .then(data => {
      const table = document.getElementById('data-table');
      table.innerHTML = '';

      // Create table headers
      const headers = Object.keys(data);
      const headerRow = document.createElement('tr');
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      // Populate table with data
      const dataRow = document.createElement('tr');
      headers.forEach(header => {
        const td = document.createElement('td');
        td.textContent = data[header];
        dataRow.appendChild(td);
      });
      table.appendChild(dataRow);
    })
    .catch(error => {
      console.log('Failed to fetch data: ' + error);
    });
}


app.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});
