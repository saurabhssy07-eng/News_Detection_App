const http = require('http');

const body = JSON.stringify({ content: 'https://www.reuters.com/world/', sourceType: 'url' });

const req = http.request(
  {
    hostname: 'localhost',
    port: 3000,
    path: '/api/analyze',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  },
  (res) => {
    let data = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('STATUS', res.statusCode);
      console.log(data);
    });
  }
);

req.on('error', (err) => {
  console.error(err.message);
});

req.write(body);
req.end();
