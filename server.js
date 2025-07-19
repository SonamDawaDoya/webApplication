// Express server setup
const express = require('express');
const Path = require('path')
const dotenv = require('dotenv');
const connectDB = require('./database/mongo');
const { createUserTable } = require('./models/userModel')

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.set('views', Path.join(__dirname, 'views'));
app.use(express.static(Path.join(__dirname, 'public')));


//Route imports
const adminRoutes = require('./routes/adminRoutes'); // ✅ Correct
const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes'); // ✅ Correct

app.use('/', adminRoutes);
app.use('/recipe', recipeRoutes);
app.use('/user', userRoutes); // ✅ Correct

createUserTable()

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
