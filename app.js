const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require("cors");
const middleware = express.json()
const internRoutes = require('./routes/internRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();
const port = 8000;

app.use(cors())
mongoose.connect('mongodb+srv://maddisai2811:tEaziPDl120vdlFz@cluster0.lp2xd1o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(middleware)

//Routes
app.use('/backend', internRoutes);
app.use('/backend', adminRoutes);
app.get('/testing', (req, res) => {
  res.send("Running");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});