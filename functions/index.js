const sanitizeHtml = require("sanitize-html");
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const rateLimit = {
  callLimitForOneIp: 5,
  timeInSeconds: 20,
  ipCache: new Map(),
};

exports.sendMail = functions.https.onRequest((req, res) => {
  let transporter = null;
  const mailCredentials = functions.config().form;

  if (mailCredentials) {
    transporter = nodemailer.createTransport({
      host: mailCredentials.hosting,
      port: mailCredentials.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: mailCredentials.mailgunadress,
        pass: mailCredentials.mailgunpass,
      },
    });
  } else {
    return res.status(500).json({code: "500",
      error: "Mail credentials are undefined"});
  }

  const reqIp = req.headers["fastly-client-ip"];
  let ipUser = {};
  const now = new Date();

  if (rateLimit.ipCache.get(reqIp)===undefined) {
    rateLimit.ipCache.set(reqIp, {reqCount: 0, time: now});
  } else {
    ipUser = rateLimit.ipCache.get(reqIp);
    functions.logger.log("current time" + (now - ipUser.time));
    if ((ipUser.reqCount + 1 > rateLimit.callLimitForOneIp)||
        (now - ipUser.time <= rateLimit.timeInSeconds * 1000)) {
      return res.status(429)
          .json({code: "429", error: "Too many requests!"});
    }
  }
  ipUser = rateLimit.ipCache.get(reqIp);
  ipUser.reqCount+=1;
  functions.logger.log("req number " + ipUser.reqCount);
  ipUser.time = new Date();

  if (!Object.keys(req.body ?? {})) {
    return res.status(400).json({code: 400, error: "No message!"});
  }

  const lines = Object.entries(req.body)
      .map(([key, val]) => `<p><b>${key}: </b>${val}</p>`)
      .join("\n");
  const html = `<p><b>Message from contact form:</b>${lines}</p>`;
  const htmlSan = sanitizeHtml(html);

  const mailOptions={
    from: `Contact form <${mailCredentials.mailgunadress}>`,
    to: functions.config().form.mailadressto,
    subject: "Message contact form", // Subject line,
    date: (new Date()).toUTCString(),
    html: htmlSan, // html body
  };

  transporter.sendMail(mailOptions, (error)=>{
    if (error) {
      console.error("Error sending mail", error.message);
      return res.status(500).json({code: "500", error: error.message});
    }
    return res.status(200).json({data: "ok"});
  });
});
