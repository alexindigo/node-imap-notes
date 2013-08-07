var Notes   = require('./')
  , inspect = require('util').inspect
  ;

var notes = new Notes(
{
  user: process.argv[2] || process.env['user'],
  password: process.argv[3] || process.env['pass'],
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

notes.connect(function(err)
{
  if (err) throw err;

  console.log(['Connected']);

  notes.search({subject: 'test'}, function(err, list)
  {
    if (err) throw err;

    console.log('Done', inspect(list, false, 4, true));

    notes.end();
  });
});
