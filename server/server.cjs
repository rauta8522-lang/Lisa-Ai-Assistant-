const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
const DATA_FILE = path.join(__dirname, 'data.json');

// Data save karne ka updated function
app.post('/api/save', (req, res) => {
  const newUser = {
    id: Date.now(), // Har user ko ek unique ID milegi
    ...req.body,
    createdAt: new Date().toISOString() // Save karne ka time
  };

  const data = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : [];
  data.push(newUser);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  res.status(200).send({ message: "User data saved!", user: newUser });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));