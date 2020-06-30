const { getTweets } = require('./twitter');
const { detectSentiment } = require('./sentiment');

const getBatch = async (q, since_id = null, count = 100) => {
  let tweets;
  const tweetObjects = [];

  try {
    tweets = await getTweets({ q, count, since_id });
  } catch (err) {
    console.log({ err, message: 'twitter error' });
  }
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

const getAverages = (tweetObjects, avg = null) => {
  let averages;
  let length;
  if (avg) {
    length = avg.length + tweetObjects.length;
    averages = {
      POS: avg.newAverages.POS * avg.length,
      NEG: avg.newAverages.NEG * avg.length,
      NEU: avg.newAverages.NEU * avg.length,
      MIX: avg.newAverages.MIX * avg.length,
    };
  } else {
    // eslint-disable-next-line prefer-destructuring
    length = tweetObjects.length;
    averages = { POS: 0, NEG: 0, NEU: 0, MIX: 0 };
  }

  const totals = tweetObjects.reduce(
    (acc, { score }) => ({
      POS: score.Positive + acc.POS,
      NEG: score.Negative + acc.NEG,
      NEU: score.Neutral + acc.NEU,
      MIX: score.Mixed + acc.MIX,
    }),
    { POS: 0, NEG: 0, NEU: 0, MIX: 0 }
  );

  const newAverages = {
    POS: (totals.POS + averages.POS) / length,
    NEG: (totals.NEG + averages.NEG) / length,
    NEU: (totals.NEU + averages.NEU) / length,
    MIX: (totals.MIX + averages.MIX) / length,
  };
  return { newAverages, length };
};

const startSentimentCollection = async q => {
  let batch = await getBatch(q);
  let last = batch[batch.length - 1].id;
  let avg = getAverages(batch);
  console.log(avg);
  setInterval(async () => {
    batch = await getBatch(q, last);
    last = batch[batch.length - 1].id;
    avg = getAverages(batch, avg);
    console.log(avg);
  }, 5000);
};

startSentimentCollection('America');
