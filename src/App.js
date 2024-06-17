const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 루트 경로에서 'index.html' 파일 서빙
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 데이터베이스 연결 설정
const connection = mysql.createConnection({
  host: 'softwareproject.cpg6iummgq8d.eu-north-1.rds.amazonaws.com',
  user: 'admin',
  password: 'cometrue',
  database: 'LRS'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// 회원가입 API 엔드포인트
app.post('/api/register', (req, res) => {
  const { name, username, password, email, birthdate, phone } = req.body;

  if (username.length < 4) {
    return res.json({ success: false, message: '아이디는 4자 이상이어야 합니다.' });
  }

  const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
  if (password.length < 6 || !specialChars.test(password)) {
    return res.json({ success: false, message: '비밀번호는 6자 이상이며, 특수문자를 포함해야 합니다.' });
  }

  const query = 'INSERT INTO User (uid, name, pw, email, phone, birth) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(query, [username, name, password, email, phone, birthdate], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }
    res.json({ success: true });
  });
});

// 로그인 API 엔드포인트
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM User WHERE uid = ? AND pw = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }

    if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: '아이디 또는 비밀번호가 틀립니다.' });
    }
  });
});

// 사용자 정보 가져오기 API 엔드포인트
app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM User';
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }
    res.json({ success: true, data: results });
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
