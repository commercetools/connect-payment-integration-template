const express = require('express');
const cors = require('cors');
const { generateKeyPair, exportJWK, SignJWT } = require('jose');

const PORT = process.env.PORT || 9002;
const KID = 'jwt-mock-key-1';

async function main() {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const publicJwk = await exportJWK(publicKey);
  publicJwk.kid = KID;
  publicJwk.use = 'sig';
  publicJwk.alg = 'RS256';

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/jwt/.well-known/jwks.json', (req, res) => {
    res.json({ keys: [publicJwk] });
  });

  app.post('/jwt/token', async (req, res) => {
    const token = await new SignJWT(req.body || {})
      .setProtectedHeader({ alg: 'RS256', kid: KID })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey);
    res.json({ token });
  });

  app.listen(PORT, () => {
    console.log(`jwt-mock listening on ${PORT}`);
  });
}

main();
