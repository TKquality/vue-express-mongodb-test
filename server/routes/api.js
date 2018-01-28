const http = require('http');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const xmlParser = require('xml2json');


router.get('/', (req, res) => {
  res.header('Content-Type', 'text/plain;charset=utf-8');
  res.send('Welcome to "The World"...');
});

router.get('/user', (req, res) => {

  User.find({}, function(err, docs) {
    res.json(docs);
  });
});

const ndlEndpoint = 'iss.ndl.go.jp';
router.get('/books/:isbn', (req, res) => {

  const isbn = req.params.isbn;
  const ndlOpt = {
    operationType: 'searchRetrieve',
    queryType: 'isbn',
  }

  if (isbn.length !== 10 && isbn.length !== 13) {
    res.sendStatus(400);
  }

  let queryPath = '/api/opensearch';
  queryPath += '?';
  queryPath += 'isbn' + '=' + isbn;
  // console.log(queryPath);

  const ndlRequestOpt = {
    method: 'GET',
    hostname: ndlEndpoint,
    path: queryPath,
  };
  const ndlRequest = http.request(ndlRequestOpt, (ndlResponse) => {
    ndlResponse.setEncoding('utf8');

    let ndlResponseData = '';
    ndlResponse.on('data', (chunk) => {
      ndlResponseData += chunk;
    });

    ndlResponse.on('end', () => {

      const jsonStr = xmlParser.toJson(ndlResponseData);
      const jsonData = JSON.parse(jsonStr);
      const info = jsonData.rss.channel.item;
      const resJson = {
        isbn: isbn,
        title: info['dc:title'],
        titleTranscription: info['dcndl:titleTranscription'],
        volume: info['dcndl:volume'] ? info['dcndl:volume'] : '1',
        author: info['author'],
        seriesTitle: info['dcndl:seriesTitle'] ? info['dcndl:seriesTitle'].split('\;')[0] : '',
        publisher: info['dc:publisher'],
        pubDate: info['pubDate'],
        images: {
          smallThumbnail: '',
          thumbnail: '',
        },
        comment: '',
      }
      // console.log(resJson);

      res.header('Content-Type', 'application/json');
      res.send(resJson);
    });

  });
  ndlRequest.end();

});

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: String,
  number: String,
});
mongoose.model('User', UserSchema);
mongoose.connect('mongodb://localhost/test_db');

const User = mongoose.model('User');
const OPT = { upsert: true, };
router.post('/user', (req, res) => {
  console.log(req.body);

  const query = { name: req.body.name };
  const doc = req.body;
  const opt = { upsert: true };

  User.findOneAndUpdate(query, doc, opt, (err, result) => {
    console.log(result);
    res.send('unk');
  });
});

module.exports = router;

/* xhr post test code hoge */
// const post = new XMLHttpRequest();
// post.open('POST', '/api/user');
// post.setRequestHeader('Accept','application/json');
// post.setRequestHeader('Content-type','application/json');
// const dat = {name:'Kaga',number:'3',};
// post.send(JSON.stringify(dat));
