var githubapi = require("github"),
  async = require("async"),
  secrets = require('./secrets.js');

// the 'handler' that lambda calls to execute our code
exports.handler = function(event, context) {

  // variables that are populated via async calls to github
  var referenceCommitSha,
    newTreeSha, newCommitSha, code;

  // github info
  var user = 'keldog-test-5';
  var password = secrets.password;
  var repo = 'database-hacks';
  var commitMessage = 'Trying to fix the Database!!';

  var github = new githubapi({version: "3.0.0"});

  github.authenticate({
    type: "basic",
    username: user,
    password: password
  });

  async.waterfall([
    code = "Sweet sweet kelnerhacks".toString('utf8');

    // get a reference to the master branch of the repo
    function(callback){

      console.log('Getting reference...');
      github.gitdata.getReference({
        user: user,
        repo: repo,
        ref: 'heads/master'
        }, function(err, data){
         if (err) console.log(err);
         if (!err) {
           referenceCommitSha = data.object.sha;
           callback(null);
         }
      });

    },

    // create a new tree with our code
    function(callback){

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
      }, function(err, data){
        if (err) console.log(err);
        if (!err) {
          newTreeSha = data.sha;
          callback(null);
        }
      });

    },

    // create the commit with our new code
    function(callback){

      console.log('Creating commit...');
      github.gitdata.createCommit({
        user: user,
        repo: repo,
        message: commitMessage,
        tree: newTreeSha,
        parents: [referenceCommitSha]
      }, function(err, data){
        if (err) console.log(err);
        if (!err) {
          newCommitSha = data.sha;
          callback(null);
        }
      });

    },

    // update the reference to point to the new commit
    function(callback){

      console.log('Updating reference...');
      github.gitdata.updateReference({
        user: user,
        repo: repo,
        ref: 'heads/master',
        sha: newCommitSha,
        force: true
      }, function(err, data){
        if (err) console.log(err);
        if (!err) callback(null, 'done');
      });

    }

  // optional callback for results
  ], function (err, result) {
    if (err) context.done(err, "Drat!!");
    if (!err) context.done(null, "Code successfully pushed to github.");
  });

};
