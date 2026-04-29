const http = require('http');

function postJson(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/analyze',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      },
      (res) => {
        let out = '';
        res.on('data', (chunk) => {
          out += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: out });
        });
      }
    );

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  const payload = {
    sourceType: 'url',
    url: 'https://example.com/news/world-asia-68812345',
    content: 'https://example.com/news/world-asia-68812345'
  };

  const result = await postJson(payload);
  console.log(JSON.stringify(result, null, 2));
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
