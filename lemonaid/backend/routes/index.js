import {Router} from 'express';
import express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/api/test-get', function(req, res, next) {
  res.json({message: 'Hello from the backend!'});
});
router.post('/api/url-post', function(req, res, next) {
  res.json({message: 'POST request received!'});
})

export default router
