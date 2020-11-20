const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const router = require('./app/router');
const cors = require('cors');
const multer = require('multer');

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors('*'));

app.use(express.urlencoded({extended: true}));
const mutipartParser = multer();
app.use(mutipartParser.none());

// on ajoute le middleware de "nettoyage" des variables
const bodySanitizer = require('./app/middlewares/body-sanitizer');
app.use(bodySanitizer);

// On utilise le middleware express.static pour servir tous les fichiers qui sont dans le dossier "public"
app.use(express.static('public'));

app.use(router);



app.listen(PORT, () => {
  console.log(`Listening on ${PORT} ...`);
});
