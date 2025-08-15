require('dotenv').config();
const express = require('express');
const cors = require('cors');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', notificationRoutes);
app.get("/", (req, res) => {
    res.send("Couple Code Api is Working");
  });
  
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});