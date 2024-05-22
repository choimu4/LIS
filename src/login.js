// 사용자 목록과 비밀번호
const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' },
    { username: 'user3', password: 'password3' }
  ];
  
  // 로그인 처리 함수
  function login(username, password) {
    // 사용자 목록을 순회하며 입력된 사용자 정보와 비교
    for (let user of users) {
        if (user.username === username && user.password === password) {
            // 로그인 성공 시, 사용자 이름을 세션 스토리지에 저장
            sessionStorage.setItem('username', username);
            // 로그인 성공 메시지 출력
            alert('로그인 성공!');
            // 여기에 로그인 성공 후의 추가 동작을 수행할 수 있습니다. 예: 다른 페이지로 이동
            return;
        }
    }
    // 사용자 정보가 일치하지 않을 때
    alert('사용자 정보가 일치하지 않습니다.');
  }
  
  // 로그인 폼 제출 이벤트 핸들러
  document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // 로그인 함수 호출
    login(username, password);
  });
  