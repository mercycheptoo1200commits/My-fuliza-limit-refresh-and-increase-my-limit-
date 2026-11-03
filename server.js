const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const PACKAGES = { basic: 1000, standard: 2500, premium: 5000 };

app.post('/api/pay', async (req, res) => {
  let { phone, packageId } = req.body;
  const amount = PACKAGES[packageId];
  if (!amount) return res.status(400).json({ error: 'Package invalid' });
  if (phone.startsWith('0')) phone = '254' + phone.slice(1);
  try {
    const r = await axios.post('https://global.optimapaybridge.co.ke/api/v2/collecto/initiate',
      { phone, amount, providerCode: 'SAFARICOM', reference: 'ORDER-' + Date.now() },
      { headers: { 'X-API-Key': process.env.OPTIMA_API_KEY, 'X-API-Secret': process.env.OPTIMA_API_SECRET } }
    );
    res.json({ identifier: r.data.identifier || r.data.id });
  } catch (e) { res.status(400).json({ error: e.response?.data || e.message }); }
});

app.get('/api/status/:id', async (req, res) => {
  const r = await axios.get(`https://global.optimapaybridge.co.ke/api/v2/collecto/status/${req.params.id}`,
    { headers: { 'X-API-Key': process.env.OPTIMA_API_KEY, 'X-API-Secret': process.env.OPTIMA_API_SECRET } });
  res.json(r.data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Live ' + PORT));
