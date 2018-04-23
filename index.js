let steem = require('steem')
let mongo = require('mongodb')
let config = require('./config').mongo
let config2 = require('./config').steem
let sleep = require('system-sleep')

function getVotingPower(account) {
  var STEEMIT_100_PERCENT = 10000;
  var STEEMIT_VOTE_REGENERATION_SECONDS = (5 * 60 * 60 * 24);
  var HOURS = 60 * 60;
  var voting_power = account.voting_power;
  var last_vote_time = new Date((account.last_vote_time) + 'Z');
  var elapsed_seconds = (new Date() - last_vote_time) / 1000;
  var regenerated_power = Math.round((STEEMIT_100_PERCENT * elapsed_seconds) / STEEMIT_VOTE_REGENERATION_SECONDS);
  var current_power = Math.min(voting_power + regenerated_power, STEEMIT_100_PERCENT);
  return current_power;
}

async function work () {
  let m = await mongo.connect(config)
  let db = await m.db('memeit')
  let col = await db.collection('posts')
  let posts = await col.find({hidden: false, voted: true}).toArray()
  posts.filter(async function (p) {
    let col2 = await db.collection('bot')
    let votes = await col2.find({author: p.author, permlink: p.permlink}).toArray()
    if (votes.length < 1) {
      return true
    } else {
      return false
    }
  })
  posts = posts.slice(0, 10)
  for (let p of posts) {
    steem.broadcast.vote(config2, 'memeit.lol', p.author, p.permlink, Math.floor(10000 / posts.length), function (err, result) {
      if (err) {
        console.log(err)
      }
    })
    console.log(p.author, p.permlink)
    let col2 = await db.collection('bot')
    await col2.insertOne({author: p.author, permlink: p.permlink, date: Date.now()})
    await sleep(4000)
  }
  console.log("Done")
}

setInterval(async function() {
  await steem.api.getAccounts(['memeit.lol'], async function(err, account) {
    var vp = getVotingPower(account[0]) / 100
    if(vp === 100) await work()
  });
}, 900000)