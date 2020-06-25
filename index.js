const { getTweets } = require('./twitter');
const { detectSentiment } = require('./sentiment');

const getBatch = async (q, since_id = null, count = 10) => {
  let tweets;
  const tweetObjects = [];

  try {
    tweets = await getTweets({ q, count, since_id });
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

const getAverages = (tweetObjects, avg = null) => {
  let averages;
  let length;
  if (avg) {
    length = avg.length + tweetObjects.length;
    averages = {
      POS: avg.POS * avg.length,
      NEG: avg.NEG * avg.length,
      NEU: avg.NEU * avg.length,
      MIX: avg.MIX * avg.length,
    };
  } else {
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

  averages = {
    POS: totals.POS / length,
    NEG: totals.NEG / length,
    NUE: totals.NEU / length,
    MIX: totals.MIX / length,
  };
  return { averages, length };
};

const areTheyCancelled = async q => {
  let batch = await getBatch(q);
  let last = batch[batch.length - 1].id;
  let avg = getAverages(batch);
  console.log(avg);
  while (true) {
    batch = await getBatch(q, last);
    last = batch[batch.length - 1].id;
    avg = getAverages(batch, avg);
    console.log(avg);
  }
};

areTheyCancelled('epstein');
