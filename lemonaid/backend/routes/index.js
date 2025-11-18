import {Router} from 'express';
import express from 'express';
var router = express.Router();

function extractItemIdFromUrl(url) {
  // Pattern 1: /itm/<id>
  const pattern1 = /\/itm\/(\d+)/;     // /itm/<id>
  const pattern2 = /[?&]itm=(\d+)/;    // ?itm=<id> or &itm=<id>

  const match1 = url.match(pattern1);
  if (match1 !== null) {
    return match1[1];
  } else {
    const match2 = url.match(pattern2);
    if (match2 !== null) {
      return match2[1];
    } else {
      return null;
    }
  }
}
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/api/test-get', function(req, res, next) {
  res.json({message: 'Hello from dddthe backend!'});
});
router.post('/api/url-post', function(req, res, next) {
  const url = req.body.url;
  
  const itemId = extractItemIdFromUrl(url);
  console.log(`Extracted item ID: ${itemId}`);
  res.json({message: 'URL received', itemId: itemId});
})
router.get

export default router
