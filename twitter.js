const Twitter = require('twitter');
require('dotenv').config();

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// twitter shit is here
const getTweets = (options = {}) => {
  options = {
    q: '',
    count: 0,
    tweet_mode: 'extended',
    ...options,
  };

  return new Promise((resolve, reject) => {
    client.get('search/tweets.json', options, (err, tweets, response) => {
      if (err) reject(err);
      resolve(tweets);
    });
  });
};

// const start = async () => {
//   console.log(await getTweets({ q: 'epstein', count: 5, since_id: null }));
// };
// start();
module.exports = { getTweets };
