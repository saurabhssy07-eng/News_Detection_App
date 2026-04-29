async function main() {
  const tests = [
    { method: 'GET', url: 'http://localhost:3000/api/analyze' },
    { method: 'POST', url: 'http://localhost:3000/api/analyze', body: 'not json' },
    {
      method: 'POST',
      url: 'http://localhost:3000/api/analyze',
      body: JSON.stringify({ sourceType: 'url', url: 'https://example.com' })
    }
  ];

  for (const test of tests) {
    try {
      const response = await fetch(test.url, {
        method: test.method,
        headers: test.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body: test.body
      });
      const text = await response.text();
      console.log('STATUS', response.status);
      console.log(text);
    } catch (error) {
      console.log('ERROR', error.message);
    }
    console.log('---');
  }
}

main();
