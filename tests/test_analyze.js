const axios = require('axios');

const PORT = process.env.PORT || 3000;

async function sendPost(body) {
  const url = `http://localhost:${PORT}/api/analyze`;
  const res = await axios.post(url, body, { timeout: 20000 });
  return { statusCode: res.status, body: res.data };
}

async function runTests() {
  const tests = [
    {
      name: 'Real news test',
      payload: {
        content:
          'The government announced a new infrastructure plan today to improve transportation across the city, officials said.',
        sourceType: 'text'
      },
      expectOk: true
    },
    {
      name: 'Fake-news style content test',
      payload: {
        content:
          'BREAKING: Scientists confirm chocolate cures cancer, study finds miraculous results and global celebrations ensue.',
        sourceType: 'text'
      },
      expectOk: true
    },
    {
      name: 'Informational content test',
      payload: {
        content:
          'This report summarizes migration patterns of monarch butterflies over the last decade and includes dataset references.',
        sourceType: 'text'
      },
      expectOk: true
    },
    {
      name: 'Edge case: empty input',
      payload: { content: '', sourceType: 'text' },
      expectOk: false
    }
  ];

  let failed = 0;

  for (const t of tests) {
    process.stdout.write(`Running: ${t.name}... `);
    try {
      const res = await sendPost(t.payload);
      const actualOk = Boolean(res.body && res.body.ok);
      const pass = actualOk === t.expectOk;
      if (pass) {
        console.log('PASS');
      } else {
        failed += 1;
        console.log('FAIL');
        console.log('  status:', res.statusCode);
        console.log('  body:', JSON.stringify(res.body));
      }
    } catch (err) {
      failed += 1;
      console.log('ERROR');
      console.error(err && err.message ? err.message : err);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} test(s) failed.`);
    process.exit(1);
  }

  console.log('\nAll tests passed.');
  process.exit(0);
}

if (require.main === module) {
  console.log('Note: ensure the server is running: npm start');
  runTests();
}
