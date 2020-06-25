const AWS = require('aws-sdk');

if (!AWS.config.region) {
  AWS.config.update({
    region: 'us-east-1',
  });
}

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const comprehend = new AWS.Comprehend();

const detectSentiment = params =>
  new Promise((resolve, reject) => {
    comprehend.detectSentiment(params, (err, data) => {
      if (err) console.log(err, err.stack);
      resolve(data);
    });
  });

module.exports = { detectSentiment };
