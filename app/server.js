const express = require('express');
const app = express();
const path = require('path')
// Run the app by serving the static files
// in the dist directory

// const forceSSL = function() {
//   return function (req, res, next) {
//     if (req.headers['x-forwarded-proto'] !== 'https') {
//       return res.redirect(
//        ['https://', req.get('Host'), req.url].join('')
//       );
//     }
//     next();
//   }
// }

//app.use(forceSSL())
app.use(express.static(__dirname));
// Start the app by listening on the default
// Heroku port

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + 'index.html'));
});

app.listen(process.env.PORT || 8080);