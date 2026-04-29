const u = 'https://news.google.com/read/CBMi4gFBVV95cUxOb1h4S01zUW4yY1U2OXpBeXh6UkcwNjdYUGVId3p5Sm5jVzlrampOSUNQcUstdzR5b3p2QmNyQVpuUEF0LTlNckdOdzFaUWZkcVdjaWRYMzhSaW5fN21TV3ZGRDN5NThUa25FNGdFbE90Q2NjVW5xZHktcnlGQlhhSm5hY295Rzg1czA5dWpUcXdKc1p1ZTRpYzBSeEV6czduUnFzU29kdDR0U3R1Z2JzZWlJdl82TlhkLTdxc09jYjd0UXhfZUtjWGNXbXZadXJQMlZLWDF0UHhMbUFYYUFSYWpn0gHnAUFVX3lxTE5DRE9JV1MxajU4N2tUNmxvZk1wcExRUEpsQklmVFZQWTBZdU9ZNHBqa0M2NGFJczhIejFnLVNEYmtja2w3cE40OFhoaWpBYUt3UW5lM1VFRFppbVBranNrZTE3Nk13dTZkby1aUUpUVUU2QS11ai1WaFpZVEpkN3VJR2ltbVRLbzBSUlJuajIyM0xDVU1VODJ2RmdYOEtLdDlJWkpvLXFOWTlCQ2pEMTRLS2Q4T1paaXh1bDZZRXFTM2p3WEl5UFpRYmxSOXFlb2h5OV9jMld6dFY3a19XbW16Nl91MHk2bw?hl=en-IN&gl=IN&ceid=IN%3Aen';
fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: u, sourceType: 'url' })
}).then(async (r) => {
  console.log('status', r.status);
  console.log(await r.text());
}).catch((e) => {
  console.error(e);
});
