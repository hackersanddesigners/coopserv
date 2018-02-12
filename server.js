const connect = require('connect'),
  http = require('http'),
  compression = require('compression'),
  session = require('cookie-session'),
  bodyParser = require('body-parser'),
  urlparser = require('url')
  coop = require('./coop'),
  creds = require('../creds');

function fail(req, res, obj) {
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function sendRes(req, res, obj) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

async function processRequest(req, res) {
  var url = urlparser.parse(req.url, true);

  if(url.pathname == '/api/activities') {
    if(req.method == 'POST') {
      sendRes(req, res, await coop.addActivity(
        req.session.addr,
        req.body.cost,
        req.body.title,
        req.body.description,
        req.body.global == 'true'
      ));
    } else if(url.query.actId) {
      sendRes(req, res, coop.getActivity(url.query.actId));
    } else {
      sendRes(req, res, coop.getActivities());
    } 
  } else if(url.pathname == '/api/budget') {
    if(req.method == 'POST') {
      sendRes(req, res, coop.distributeBudget(req.session.addr));
    } else {
      sendRes(req, res, coop.getBudget());
    }
  } else if(url.pathname == '/api/members') {
    if(req.method == 'POST') {
      sendRes(req, res, await coop.addMember(req.session.addr, req.body.name, req.body.addr));
    } else {
      sendRes(req, res, coop.getMembers());
    }
  } else if(url.pathname == '/api/members/delete') {
      sendRes(req, res, await coop.removeMember(req.session.addr, req.body.addr));
  } else if(url.pathname == '/api/participants') {
    if(req.method == 'POST') {
      sendRes(req, res, await coop.addParticipant(
        req.session.addr, req.body.memId, req.body.actId));
    } else {
      sendRes(req, res, coop.getParticipants(url.query.actId));
    }
  } else if(url.pathname == '/api/participants/delete') {
    sendRes(req, res, await coop.removeParticipant(
      req.session.addr, req.body.memId, req.body.actId));
  } else if(url.pathname == '/api/votes') {
    if(req.method == 'POST') {
      coop.unlockAccount(req.session.addr, req.session.pwd);
      sendRes(req, res, await coop.vote(
        req.session.addr,
        req.body.actId,
        req.body.prom,
        req.body.just));
    } else if(url.query.actId) {
      sendRes(req, res, coop.getVoteIds(url.query.actId));
    } else if(url.query.voteId) {
      sendRes(req, res, coop.getVote(url.query.voteId));
    }
  } else if(url.pathname == '/api/votes/delete') {
    sendRes(req, res, await coop.deleteVote(
      req.session.addr, req.body.voteId));
  } else if(url.pathname == '/api/finalize') {
    sendRes(req, res, await coop.finalize(req.session.addr, req.body.actId));
  } else {
    sendRes(req, res, { 'user': req.session.user });
  }
}

var creds = creds.creds;

var app = connect();

app.use(compression());

app.use(session({
    keys: ['secret1', 'secret2']
}));

app.use(bodyParser.urlencoded({extended: false}));

// Check user authentication - JBG
app.use((req, res, next) => { 
  var url = urlparser.parse(req.url, true);

  console.log(req.method, url.pathname, req.body);

  if(url.pathname == '/api/logout') {
    req.session = null;
    sendRes(req, res, {});
    return;
  } else if(url.pathname == '/api/login' &&
    creds[req.body.name].pwd == req.body.pwd) {
      req.session.user = req.body.name;
      req.session.auth = true;
      req.session.addr = creds[req.body.name].addr; 
      req.session.pwd = req.body.pwd; 
      console.log(req.session.addr, req.body.pwd);
      coop.unlockAccount(req.session.addr, req.body.pwd);
      next();
      return;
  } else if(req.session && req.session.auth == true) {
    next();
    return;
  }

  res.writeHead(403);
  res.end('Not authorized.');
});

app.use((req, res) => {
  processRequest(req, res)
});

http.createServer(app).listen(3000);

