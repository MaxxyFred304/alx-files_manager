const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const routes = require('./routes');

app.use(express.json());

// Load all routes from routes/index.js
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
