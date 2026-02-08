const fs = require('fs');
const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    console.log('Fetching token list from Jupiter...');
    const tokens = await fetchJSON('https://token.jup.ag/strict');
    
    const logoMap = {};
    tokens.forEach(token => {
      if (token.logoURI && token.address) {
        logoMap[token.address] = token.logoURI;
      }
    });
    
    fs.writeFileSync(
      './utils/allTokenLogos.json',
      JSON.stringify(logoMap, null, 2)
    );
    
    console.log(`✓ Successfully downloaded ${Object.keys(logoMap).length} token logos`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
