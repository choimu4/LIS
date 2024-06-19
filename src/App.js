const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const moment = require('moment-timezone');
const session = require('express-session');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// 루트 경로에서 'index.html' 파일 서빙
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
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

app.post('/api/register', (req, res) => {
  const { name, username, password, email, birthdate, phone } = req.body;

  // 입력 데이터 검증
  if (!name || !username || !password || !email || !birthdate || !phone) {
    return res.json({ success: false, message: '모든 필드를 입력해야 합니다.' });
  }

  if (username.length < 4) {
    return res.json({ success: false, message: '아이디는 4자 이상이어야 합니다.' });
  }

  const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
  if (password.length < 6 || !specialChars.test(password)) {
    return res.json({ success: false, message: '비밀번호는 6자 이상이며, 특수문자를 포함해야 합니다.' });
  }

  // 중복 확인 쿼리
  const checkQuery = 'SELECT * FROM User WHERE uid = ?';
  connection.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }

    if (results.length > 0) {
      return res.json({ success: false, message: '이미 존재하는 아이디입니다.' });
    } else {
      // 사용자 삽입 쿼리
      const query = 'INSERT INTO User (uid, name, pw, email, phone, birth) VALUES (?, ?, ?, ?, ?, ?)';
      connection.query(query, [username, name, password, email, phone, birthdate], (err, results) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
        }
        res.json({ success: true });
      });
    }
  });
});

// 로그인 API 엔드포인트
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM User WHERE uid = ? AND pw = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error logging in:', err); // 오류 로그 추가
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }

    if (results.length > 0) {
      const user = results[0];
      const isAdmin = user.uid === 'admin';
      req.session.username = username; // 세션에 사용자 이름 저장
      res.json({ success: true, isAdmin, user });
    } else {
      res.json({ success: false, message: '아이디 또는 비밀번호가 틀립니다.' });
    }
  });
});

// 모든 사용자 정보 가져오기 API 엔드포인트
app.get('/api/users', (req, res) => {
  const query = 'SELECT * FROM User';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err); // 오류 로그 추가
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }
    res.json({ success: true, data: results });
  });
});

// 특정 사용자 정보 가져오기 API 엔드포인트
app.get('/api/user', (req, res) => {
  const { username } = req.query;

  const query = 'SELECT * FROM User WHERE uid = ?';
  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err); // 오류 로그 추가
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
  });
});

// 사용자 정보 수정 API 엔드포인트
app.post('/api/updateUser', (req, res) => {
  const { username, name, password, email, phone, birth } = req.body;

  const query = 'UPDATE User SET name = ?, pw = ?, email = ?, phone = ?, birth = ? WHERE uid = ?';
  connection.query(query, [name, password, email, phone, birth, username], (err, results) => {
    if (err) {
      console.error('Error updating user:', err); // 오류 로그 추가
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }
    res.json({ success: true });
  });
});

// 장소 정보 저장 API 엔드포인트
app.post('/api/savePlace', (req, res) => {
  const { name, road_address, address, phone } = req.body;

  // 중복 확인 쿼리
  const checkQuery = 'SELECT * FROM Laundry WHERE name = ?';
  connection.query(checkQuery, [name], (err, results) => {
    if (err) {
      console.error('Error checking place:', err); // 오류 로그 추가
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }

    if (results.length > 0) {
      return res.json({ success: false, message: '이미 존재하는 장소입니다.' });
    } else {
      const insertQuery = 'INSERT INTO Laundry (name, road_address, address, phone, washer_count, dryer_count, remain_time) VALUES (?, ?, ?, ?, ?, ?, ?)';
      connection.query(insertQuery, [name, road_address, address, phone, null, null, null], (err, results) => {
        if (err) {
          console.error('Error inserting place:', err); // 오류 로그 추가
          return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
        }
        res.json({ success: true });
      });
    }
  });
});

// 세탁소 정보 가져오기 API 엔드포인트
app.get('/api/laundry', (req, res) => {
  const { name } = req.query;
  let query = 'SELECT * FROM Laundry';
  const queryParams = [];

  if (name) {
    query += ' WHERE name = ?';
    queryParams.push(name);
  }

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching laundry data:', err); // 오류 로그 추가
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }
    res.json({ success: true, data: results });
  });
});

// 세탁소 정보 업데이트 API 엔드포인트
app.post('/api/updateLaundry', (req, res) => {
  const { name, washer_count, dryer_count } = req.body;

  const query = 'UPDATE Laundry SET washer_count = ?, dryer_count = ? WHERE name = ?';
  connection.query(query, [washer_count, dryer_count, name], (err, results) => {
    if (err) {
      console.error('Error updating laundry:', err);
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }
    res.json({ success: true });
  });
});

// 주문 생성 엔드포인트
app.post('/api/order', (req, res) => {
  const { laundry_id } = req.body;
  const username = req.session.username; // 세션에서 사용자 이름 가져오기

  if (!username) {
    return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }

  // 사용자 ID 가져오기
  const userQuery = 'SELECT id FROM User WHERE uid = ?';
  connection.query(userQuery, [username], (err, userResults) => {
    if (err) {
      console.error('Error fetching user ID:', err);
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    const user_id = userResults[0].id;
    const order_date = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'); // 예약 시점의 날짜와 시간

    const orderQuery = 'INSERT INTO Orders (user_id, laundry_id, order_date) VALUES (?, ?, ?)';
    connection.query(orderQuery, [user_id, laundry_id, order_date], (err, orderResults) => {
      if (err) {
        console.error('Error creating order:', err);
        return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
      }
      res.json({ success: true });
    });
  });
});

// 주문 정보 가져오기 API 엔드포인트
app.get('/api/orders', (req, res) => {
  const query = `
    SELECT Orders.id, Orders.order_date, User.name as user_name, Laundry.name as laundry_name
    FROM Orders
    JOIN User ON Orders.user_id = User.id
    JOIN Laundry ON Orders.laundry_id = Laundry.id
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err); // 오류 로그 추가
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }
    res.json({ success: true, data: results });
  });
});

// 문의 저장 API 엔드포인트
app.post('/api/declar', (req, res) => {
  const { name, email, subject, message } = req.body;
  const currentDate = moment().tz('Asia/Seoul').format('YY-MM-DD'); // 현재 시간을 대한민국 표준시(KST)로 변환

  const query = 'INSERT INTO Declar (name, email, title, reason, dec_date) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [name, email, subject, message, currentDate], (err, results) => {
    if (err) {
      console.error('Error inserting declar:', err);
      return res.status(500).json({ success: false, message: '데이터베이스 오류 발생', error: err });
    }
    res.json({ success: true });
  });
});

app.get('/api/declars', (req, res) => {
  const query = 'SELECT * FROM Declar';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching declars:', err); // 오류 로그 추가
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
