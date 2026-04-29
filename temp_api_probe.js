const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

function post(url, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end(JSON.stringify(data));
  });
}

(async () => {
  const health = await get('http://localhost:3000/api/health');
  console.log(health.status);
  console.log(health.body);
  console.log('---');
  const result = await post('http://localhost:3000/api/analyze', {
    sourceType: 'url',
    url: 'https://r.search.yahoo.com/_ylt=AwrKB1jKffBpGQIAgL.7HAx.;_ylu=Y29sbwNzZzMEcG9zAzEEdnRpZAMEc2VjA3Ny/RV=2/RE=1778578122/RO=10/RU=https%3a%2f%2fwww.bbc.com%2fnews%2farticles%2fc9d4dzwdp53o/RK=2/RS=EZ0NgFfFC8pnafQ92cqzJsvjW5Q-'
  });
  console.log(result.status);
  console.log(result.body);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
