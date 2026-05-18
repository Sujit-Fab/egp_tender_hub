const https = require('https');
https.get('https://api-i5mxqv7zvq-el.a.run.app/api/notices', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('notices:', res.statusCode));
});
https.get('https://api-i5mxqv7zvq-el.a.run.app/api/stds', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('stds:', res.statusCode));
});
