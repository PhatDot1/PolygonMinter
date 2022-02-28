import nodemailer from 'nodemailer';

const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

var accessToken;
var accessTokenExpiry;

console.log(process.env.EMAIL_PRIVATE_KEY.replace(/\\n/g, "\n"));

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        serviceClient: process.env.EMAIL_SERVICE_CLIENT,
        privateKey: process.env.EMAIL_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }
});

transporter.on('token', token => {
    console.log('A new access token was generated');
    console.log('User: %s', token.user);
    console.log('Access Token: %s', token.accessToken);
    console.log('Expires: %s', new Date(token.expires));

    accessToken = token.accessToken;
    accessTokenExpiry = new Date(token.expires);
});

await transporter.verify();

var emailUserAfterMint = async (toEmailAddress, programmeName, receiverName, programmeType, indexOfNFT, etherscanLinkToTx, ethAddress) =>  {

    if (emailRegexp.test(toEmailAddress)) {

        console.log(toEmailAddress);

        if (!(toEmailAddress.includes('@encode.club'))) {

            console.log('While in testing mode do not send to emails outside of Encode club');
            return;
        }

        var subjectText = `Your NFT for ${programmeName}`;

        var recieverFirstName = receiverName.split(' ')[0];
        var senderFirstName = process.env.EMAIL_USER.split(' ')[0];

        var openseaUrl = `${process.env.OPENSEA_DOMAIN}/${process.env.NFT_CONTRACT_ADDRESS}/${indexOfNFT}`;

        var twitterIntentLink = `https://twitter.com/intent/tweet?text=I just received this NFT for completing the ${programmeName} with @encodeclub.&url=${openseaUrl}`;
        twitterIntentLink = twitterIntentLink.replaceAll(' ', '%20');

        var htmlText = `<div>
        <div>Hey ${recieverFirstName},<br></div><br>
        <div>🎉 Congratulations on completing the ${programmeName}.<br></div><br>
        <div>💌 We have just sent you a special NFT certificate for participating in the ${programmeType}. You can view it on <a href="${openseaUrl}" target="_blank">Opensea</a> and in your wallet <a href="${etherscanLinkToTx}" target="_blank">${ethAddress}</a>. <br></div><br>
        <div>📢 Now show-off your achievement! Having a great twitter profile helps you stand out in crypto!<b> So tweet out your NFT</b>, be sure to tag <a href="https://twitter.com/encodeclub" target="_blank">@encodeclub</a> and we'll retweet. Click <a href="${twitterIntentLink}" target="_blank">here</a> for an automatically generated tweet you can edit!<br></div><br>
        <div>🙌 We want to help you with your next steps also! To that end, please find the calendly's of various individuals who can help at Encode.<br></div><br>
        <div>🌱 For <b>startups and investments</b>, arrange a call with Eomji <a href="https://calendly.com/eomji/30min" target="_blank">here</a>.<br></div>
        <div>💼 For <b>getting a job</b>, arrange a call with Laura <a href="https://calendly.com/laura_wiltshire/30min" target="_blank">here</a>.<br></div>
        <div>📅 For doing another <b>programme</b> (such as a bootcamp, hackathon or accelerator) with Encode, arrange a call with Vanessa <a href="https://calendly.com/vanessa-encode/30min" target="_blank">here.</a><br></div><br>
        <div>See you soon and wagmi 🚀,<br></div>
        <div>${senderFirstName}</div>
        <img alt="" src="https://www.encode.club?utm_source=nftMinter&utm_medium=email&utm_campaign=openRate" style="display: none; width: 1px; height: 1px;">
        </div>`;

        //Valid email
        await transporter.sendMail({
            from: `${process.env.EMAIL_USER} <${process.env.EMAIL_ADDRESS}>`,
            to: toEmailAddress,
            subject: subjectText,
            html:htmlText,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                accessToken: accessToken,
                expires: accessTokenExpiry
            }
        });
        
    } else {

        console.log('Error - Email address not valid');
    }

    return;
}


var mailer = {
    emailUserAfterMint: emailUserAfterMint
}

export default mailer;