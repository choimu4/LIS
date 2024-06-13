const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const KAKAO_CLIENT_ID = '209c2fbbd8b5150893c2e7bbf4c704b4';
const KAKAO_CLIENT_SECRET = '209c2fbbd8b5150893c2e7bbf4c704b4';
const REDIRECT_URI = 'http://localhost:3000/oauth/kakao/callback';

app.get('/oauth/kakao/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      {},
      {
        params: {
          grant_type: 'authorization_code',
          client_id: KAKAO_CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          code: code,
          client_secret: KAKAO_CLIENT_SECRET
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const user = userResponse.data;

    res.json(user);
  } catch (error) {
    res.status(500).send('Error during OAuth process');
  }
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
