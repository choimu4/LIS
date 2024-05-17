const express = require('express');
const path = require('path');
const app = express();

// 정적 파일을 위한 디렉토리 설정을 조정합니다.
// `path.join(__dirname, '..', 'public')`을 사용하여 'src' 디렉토리의 상위 디렉토리로 이동한 후 'public' 디렉토리를 찾습니다.
app.use(express.static(path.join(__dirname, '..', 'public')));

// 'public' 디렉토리 내의 'index.html' 파일을 루트 URL('/')에 서빙합니다.
// 경로 설정에 있어서도 마찬가지로 `__dirname`에서 상위 디렉토리로 이동하여 'public' 디렉토리 내의 'index.html'을 찾아야 합니다.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});