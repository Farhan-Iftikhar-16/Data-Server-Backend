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

const MONGO_URL = ' ';

 mongoose.connect(MONGO_URL).then(() => {
   console.log('db connected');
 }).catch( (err) => {
   console.error(`Error connecting to the database. ${err}`);
 });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Create Express server
const app = express();
// Express configuration
app.set("port", 5000);
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

app.post('/api/v1/backup', async (req, res) => {
  await createBackup().then(() => {
    return res.status(200).json({success:true,message: "Backup created successfully"});
  }).catch(() => {
    return res.status(500).json({success:false,message: "Error occurred while creating backup"});
  });
})

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



setInterval(() => {
  createBackup().then();
}, 86400000);



function createBackup() {
  return  new Promise((resolve, reject) =>  {
    const bucketName = 'aodocsbucket';
    const accessKey = 'AKIA46QKRQGN5QZB634I';
    const accessSecret = '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';
    const prefix = "backups/";

    // const mongoS3Backup = require("node-mongodump-s3");
    // const backupClient = mongoS3Backup({ bucketName, accessKey, accessSecret });

    const s3Bucket = new aws.S3({
      accessKeyId: accessKey,
      secretAccessKey: accessSecret,
      Bucket: bucketName,
    });


    const dumpPath = path.resolve(__dirname, "test_backup_" + Date.now() + ".bson");
    const command = `mongodump  --uri="${MONGO_URL}" --archive="${dumpPath}"`;
    exec(command, (error, stdout, stderr) => {
      // We cannot trust stderr cause mongo spits warnings/logs on this channel
      // so we check if the dump was created
      if (error) {
        reject(false);
        return;
      }

      s3Bucket.upload({
        Bucket: bucketName,
        Key: prefix + "test_backup_" + Date.now() + ".bson",
        Body: fs.createReadStream(dumpPath),
      }, (error) => {
         if (error) {
           reject(error);
         }

         if (!error) {
           resolve();
         }
      });
    });
  })


  //   backupClient.backupDatabase({
  //     uri: dbConnectionUri,
  //     backupName: "test_backup_" + Date.now() + '.bson',
  //     prefix: prefix,
  //   }).then((response) => {
  //   });
}

/**
 * Primary app routes.
 */






module.exports = app;
