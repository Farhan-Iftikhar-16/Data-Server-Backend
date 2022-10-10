const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const lusca = require('lusca');
const path = require('path');
const cors = require('cors');
const partials = require('express-partials');
const cookieParser = require('cookie-parser')
const sts = require('strict-transport-security');
const globalSTS = sts.getSTS({'max-age':{'days': 30}});
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const helper = require('./controllers/helper');
const middleware = require("./dataAccess/index");
const { isAuthenticated } = middleware;
const { exec } = require("child_process");
const aws = require("aws-sdk");
const mongoS3Backup = require("node-mongodump-s3");

const envConfig = dotenv.parse(fs.readFileSync('.env'))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}
/**
 * Connect to MongoDB.
 */

const url = 'mongodb+srv://farhaniftikhar:rMl0mak3Ce3hCjEL@cluster0.cznfc0m.mongodb.net/?retryWrites=true&w=majority';

 mongoose.connect(url).then(() => {
   console.log('db connected');
 }).catch( (err) => {
   console.error(`Error connecting to the database. ${err}`);
 });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Create Express server
const app = express();
// Express configuration
app.set("port", 4000);
app.set("views", path.join(__dirname, "../views"));
// view engine setup
app.set('layout', 'layout');
// to use response partials
app.engine('.ejs', require('ejs').renderFile);
app.set("view engine", "ejs");
// app.use(expressLayouts);
partials.register('.ejs', require('ejs'));
app.use(partials());

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.options("*", cors());
app.use(cors());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
// This will apply this policy to all requests
app.use(globalSTS);

app.use(express.static(path.join(__dirname, "../public"), { maxAge: 31557600000 })
);

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;


app.use('/api/v1/accounts', require('./routes/user'));
app.use('/api/v1', require('./routes/index'));
app.get('/api/v1/logout/:id', require('./controllers/user').logout);

app.get('/signup', async (req, res, next) => {
  const accessToken = req.params.access_token  || req.headers["access_token"] || req.query.access_token || (req.body ? req.body.access_token:"") || req.cookies.access_token;
  if(accessToken && accessToken !== '') {
    return res.redirect('/');
  }
  res.render('signup', {});
});

app.get('/login', async (req, res, next) => {
  const accessToken = req.params.access_token  || req.headers["access_token"] || req.query.access_token || (req.body ? req.body.access_token:"") || req.cookies.access_token;
  if(accessToken && accessToken !== '') {
    return res.redirect('/');
  }
  res.render('login', {});
});

app.get('/',isAuthenticated, async (req, res, next) => {
  let files = await helper.populateFFData(req.user._id);
  let allFlatFiles = await helper.flatData(req.user._id);
  res.render('home', {files: files, allFlatFiles: allFlatFiles});
});

app.get('/menu',isAuthenticated, async (req, res, next) => {
  let files = await helper.populateFFData(req.user._id);
  let allFlatFiles = await helper.flatData(req.user._id);
  res.partial('partials/menu', { files: files, allFlatFiles: allFlatFiles });
});

createBackup();

function createBackup() {
  setInterval(() => {
    const bucketName = 'aodocsbucket';
    const accessKey = 'AKIA46QKRQGN5QZB634I';
    const accessSecret = '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';
    const dbConnectionUri = 'mongodb+srv://farhaniftikhar:rMl0mak3Ce3hCjEL@cluster0.cznfc0m.mongodb.net/?retryWrites=true&w=majority';
    const prefix = "backups/";

    // const mongoS3Backup = require("node-mongodump-s3");
    // const backupClient = mongoS3Backup({ bucketName, accessKey, accessSecret });

    const s3Bucket = new aws.S3({
      accessKeyId: accessKey,
      secretAccessKey: accessSecret,
      Bucket: bucketName,
    });


    const dumpPath = path.resolve(__dirname, "test_backup_" + Date.now() + ".bson");
    const command = `mongodump  --uri="${dbConnectionUri}" --archive="${dumpPath}"`;
    exec(command, (error, stdout, stderr) => {
      // We cannot trust stderr cause mongo spits warnings/logs on this channel
      // so we check if the dump was created
      if (error) {
        console.log(error);
        return;
      }

      console.log(dumpPath);
      // if (!fs.existsSync(dumpPath)) {
      //   console.log("Something went wrong");
      //   return;
      // }
      s3Bucket.upload({
        Bucket: bucketName,
        Key: prefix + "test_backup_" + Date.now() + ".bson",
        Body: fs.createReadStream(dumpPath),
      }, (err1, data) => {
        console.log({err1});

        console.log({data});
      });
    });

  //   backupClient.backupDatabase({
  //     uri: dbConnectionUri,
  //     backupName: "test_backup_" + Date.now() + '.bson',
  //     prefix: prefix,
  //   }).then((response) => {
  //     console.log("Success response ", response);
  //   });
  }, 86400000);
}

/**
 * Primary app routes.
 */






module.exports = app;
