const { getTweets } = require('./twitter');
const { detectSentiment } = require('./sentiment');

const getBatch = async searchQuery => {
  let tweets;
  const tweetObjects = [];

  try {
    tweets = await getTweets({ q: searchQuery, count: 10 });
  } catch (err) {
    console.log({ err, message: 'twitter error' });
  }
  //   let count = 1;
  for (let tweet of tweets.statuses) {
    if (tweet.retweeted_status) {
      tweet = tweet.retweeted_status;
    }

    let data;
    try {
      data = await detectSentiment({
        LanguageCode: 'en',
        Text: tweet.full_text,
      });
      //   console.log(`${count} - ${tweet.full_text}\n\n\n`);
      //   count += 1;
    } catch (err) {
      console.log({ err, message: 'aws error' });
    }

    tweetObjects.push({
      tweet,
      score: data.SentimentScore,
    });
  }
  return tweetObjects;
};

const getAverages = tweetObjects => {
  const totals = tweetObjects.reduce(
    (acc, { score }) => ({
      POS: score.Positive + acc.POS,
      NEG: score.Negative + acc.NEG,
      NEU: score.Neutral + acc.NEU,
      MIX: score.Mixed + acc.MIX,
    }),
    { POS: 0, NEG: 0, NEU: 0, MIX: 0 }
  );

  const averages = {
    POS: totals.POS / tweetObjects.length,
    NEG: totals.NEG / tweetObjects.length,
    NUE: totals.NEU / tweetObjects.length,
    MIX: totals.MIX / tweetObjects.length,
  };
  console.log(averages);
};

async function start() {
  console.log(await getBatch('epstein'));
}
start();
