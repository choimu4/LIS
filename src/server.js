const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());


// AWS RDS MySQL 연결 설정
const connection = mysql.createConnection({
  host: 'softwareproject.cpg6iummgq8d.eu-north-1.rds.amazonaws.com',
  user: 'admin',
  password: 'cometrue',
  database: 'softwareproject'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});


// MySQL 데이터 API 엔드포인트 설정
app.get('/api/data', (req, res) => {
  connection.query('SELECT * FROM mytable', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
