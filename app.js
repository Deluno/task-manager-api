const path = require('path');
const fs = require('fs');

const express = require('express');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const multer = require('multer');
const uuid = require('uuid');

const db = require('./utils/database');
const utils = require('./utils/helpers');
const errorController = require('./controllers/error');

const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');
const fileRoutes = require('./routes/file');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'files');
//   },
//   filename: (req, file, cb) => {
//     const id = uuid.v4();
//     cb(null, id + file.originalname);
//   },
// });

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(utils.setHeaders);
app.use(express.json());
app.use(multer({ dest: 'files' }).single('file'));

app.use('/users', userRoutes);
app.use('/users/:username/tasks', taskRoutes);
app.use('/users/:username/tasks/:tid/files', fileRoutes);
app.use('/auth', authRoutes);

app.use(errorController.badRequest);

global.__rootdir = __dirname;

db.setRelations();
db.sequelize
  // .sync({ force: true })
  .sync()
  .then((result) => {
    console.log('Database is synced!');
    return User.findByPk('admin');
  })
  .then(async (user) => {
    if (!user) {
      const password = await bcrypt.hash('admin', 12);
      return User.create({
        username: 'admin',
        email: 'admin@net.com',
        password: password,
        role: 'admin',
      });
    }
  })
  .then((user) => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
