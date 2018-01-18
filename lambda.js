var githubapi = require("github");

// the 'handler' that lambda calls to execute our code
exports.handler = function(event, context) {
  // variables that are populated via async calls to github
  var referenceCommitSha,
    newTreeSha, newCommitSha, code;
  // github info
  var user = 'keldog-test-5';
  var password = 'NO SIR NO SIR'; // total hacks on kelner's part.... REPLACEME TODO TODO TODO
  var repo = 'database-hacks';
  var commitMessage = 'Trying to fix the Database!!';
  var github = new githubapi({
    version: "3.0.0"
  });
  github.authenticate({
    type: "basic",
    username: user,
    password: password
  });
  var code = 'Sweet sweet kelnerhacks';
  // get a reference to the master branch of the repo
  console.log('Getting reference...');
  github.gitdata.getReference({
    user: user,
    repo: repo,
    ref: 'heads/master'
  }, function(err, data) {
    if (err) console.log(err);
    if (!err) {
      referenceCommitSha = data.object.sha;
      callback(null);
    }
  });

  // create a new tree with our code
  console.log('Creating tree...');
  var files = [];
  files.push({
    path: "hax.js",
    mode: '100644',
    type: 'blob',
    content: code
  });

  github.gitdata.createTree({
    user: user,
    repo: repo,
    tree: files,
    base_tree: referenceCommitSha
  }, function(err, data) {
    if (err) console.log(err);
    if (!err) {
      newTreeSha = data.sha;
      callback(null);
    }
  });

  // create the commit with our new code
  console.log('Creating commit...');
  github.gitdata.createCommit({
    user: user,
    repo: repo,
    message: commitMessage,
    tree: newTreeSha,
    parents: [referenceCommitSha]
  }, function(err, data) {
    if (err) console.log(err);
    if (!err) {
      newCommitSha = data.sha;
      callback(null);
    }
  });

  // update the reference to point to the new commit
  console.log('Updating reference...');
  github.gitdata.updateReference({
    user: user,
    repo: repo,
    ref: 'heads/master',
    sha: newCommitSha,
    force: true
  }, function(err, data) {
    if (err) console.log(err);
    if (!err) callback(null, 'done');
  });
};
