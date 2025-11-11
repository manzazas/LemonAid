var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/api/test-get', function(req, res, next) {
  res.json({message: 'Hello from the backend!'});
});
router.post('/api/test-post', function(req, res, next) {
  res.json({message: 'POST request received!'});
})

module.exports = router;
