import nodemailer from "nodemailer";

const emailRegexp =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

var accessToken;
var accessTokenExpiry;

// console.log(process.env.EMAIL_PRIVATE_KEY.replace(/\\n/g, "\n"));

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    serviceClient: process.env.EMAIL_SERVICE_CLIENT,
    privateKey: process.env.EMAIL_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

transporter.on("token", (token) => {
  //   console.log("A new access token was generated");
  //   console.log("User: %s", token.user);
  //   console.log("Access Token: %s", token.accessToken);
  //   console.log("Expires: %s", new Date(token.expires));

  accessToken = token.accessToken;
  accessTokenExpiry = new Date(token.expires);
});

await transporter.verify();

var emailUserAfterMint = async (
  toEmailAddress,
  programmeName,
  receiverName,
  programmeType,
  indexOfNFT,
  etherscanLinkToTx,
  ethAddress
) => {
  if (emailRegexp.test(toEmailAddress)) {
    // console.log(toEmailAddress);

    // if (!toEmailAddress.includes("@encode.club")) {
    //   console.log(
    //     "While in testing mode do not send to emails outside of Encode club"
    //   );
    //   return;
    // }

    var subjectText = `Your NFT for ${programmeName}`;

    var recieverFirstName = receiverName.split(" ")[0];
    var senderFirstName = process.env.EMAIL_USER.split(" ")[0];

    var openseaUrl = `${process.env.OPENSEA_DOMAIN}/${process.env.NFT_CONTRACT_ADDRESS}/${indexOfNFT}`;

    var twitterIntentLink = `https://twitter.com/intent/tweet?text=I just received this NFT for taking part in the ${programmeName} with @encodeclub.&url=${openseaUrl}`;
    twitterIntentLink = twitterIntentLink.replaceAll(" ", "%20");

    var htmlText = `<div>
        <div>Hey ${recieverFirstName},<br></div><br>
        <div>🎉 Congratulations on completing the ${programmeName}.<br></div><br>
        <div>💌 We have just sent you a special NFT certificate for participating in the programme. You can view it on <a href="${openseaUrl}" target="_blank">Opensea</a> and in your wallet <a href="${etherscanLinkToTx}" target="_blank">${ethAddress}</a>. <br></div><br>
        <div>📢 Now show-off your achievement! Having a great twitter profile helps you stand out in crypto!<b> So tweet out your NFT</b>, be sure to tag <a href="https://twitter.com/encodeclub" target="_blank">@encodeclub</a> and we'll retweet. Click <a href="${twitterIntentLink}" target="_blank">here</a> for an automatically generated tweet you can edit!<br></div><br>
        <div>📜 You can also add this to your LinkedIn as a certificate to show off to future employers! Here is a short <a href="https://encodeclub.notion.site/Encode-Club-NFT-Certificate-Guide-4b0264ba5bc84fa3bf2c2b3bd7b940f4" target="_blank">guide</a> on how to do that. <br></div><br>
        <div>We hope to see you soon!<br></div>
        <div>Encode Club</div>
        </div>`;

    //Valid email
    await transporter.sendMail({
      from: `${process.env.EMAIL_USER} <${process.env.EMAIL_ADDRESS}>`,
      to: toEmailAddress,
      subject: subjectText,
      html: htmlText,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        accessToken: accessToken,
        expires: accessTokenExpiry,
      },
    });
    return "Email Success";
  } else {
    // console.log("Error - Email address not valid");
    return "Email Error";
  }
};

var mailer = {
  emailUserAfterMint: emailUserAfterMint,
};

export default mailer;
