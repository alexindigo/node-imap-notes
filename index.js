var Imap = require('imap');

module.exports = Notes;

function Notes(options, extraParams)
{
  this.currentBox = null;

  this.imap = new Imap(options);

  this.params = extraParams || {};

  // fallback to default folder Notes
  this.params['folder'] = this.params['folder'] || 'Notes';
}

Notes.prototype.connect = function Notes_connect(callback)
{
  var me = this;

  me.imap.once('ready', function Notes_connect_onReady()
  {
    me.imap.openBox(me.params['folder'], true, function Notes_connect_onOpenBox(err, box)
    {
      if (err) return callback(err);

      me.currentBox = box;

      callback();
    });
  });

  me.imap.once('error', function Notes_connect_onError(err)
  {
    callback(err);
  });

  me.imap.once('end', function Notes_connect_onEnd()
  {
// TODO:
    console.log('Connection ended');
  });

  me.imap.connect();
}

Notes.prototype.end = function Notes_end()
{
  this.imap.end();
}

// TODO: Add streams
Notes.prototype.search = function Notes_search(criteria, callback)
{
  var me = this
    , key
    , search = []
    , notes  = []
    ;

  if (typeof criteria == 'function')
  {
    callback = criteria;
    criteria = {};
  }

  // generate search array
  for (key in criteria)
  {
    if (!criteria.hasOwnProperty(key)) continue;

    search.push([key, criteria[key]]);
  }

  // get stuff
  me.imap.search(search, function(err, results)
  {
    if (err) return callback(err);

    var f = me.imap.fetch(results, {bodies: ''});

    f.on('message', function(msg, seqno)
    {
      console.log('Message #%d', seqno);

      msg.on('body', function(stream, info)
      {
        var headerParsed = false
          , header = ''
          , body = ''
          ;

        stream.on('data', function(chunk)
        {
          var pos;

          chunk = chunk.toString('utf8');

          if (!headerParsed)
          {

            if ((pos = chunk.indexOf('\r\n\r\n')) > -1)
            {
              header += chunk.substr(0, pos);
              // iOS Notes tend to have weird sequence in strange places
              // seems like removing it has not negative effect and makes things better
              body += chunk.substr(pos+4).replace(/=\r\n/g, '');
              headerParsed = true;
            }
            else
            {
              header += chunk;
            }
          }
          else
          {
            body += chunk.replace(/=\r\n/g, '');
          }
        });

        stream.once('end', function()
        {
          notes.push({header: header, body: body, parsed: Imap.parseHeader(header)});
        });
      });

    });

    f.once('error', function(err)
    {
      return callback(err);
    });

    // return everything
    f.once('end', function()
    {
      return callback(null, notes);
    });
  });
}

// TODO: Add streams
Notes.prototype.list = function Notes_list(callback)
{
  throw new Error('Not Implemented.');
}

// TODO: Add streams
Notes.prototype.fetch = function Notes_fetch(id, callback)
{
  throw new Error('Not Implemented.');
}

// TODO: Add/Accept streams
Notes.prototype.update = function Notes_update(id, data, callback)
{
  throw new Error('Not Implemented.');
}

// TODO: Add/Accept streams
Notes.prototype.create = function Notes_create(data, callback)
{
  throw new Error('Not Implemented.');
}
