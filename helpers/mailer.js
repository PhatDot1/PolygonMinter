import nodemailer from 'nodemailer';

const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

var accessToken;
var accessTokenExpiry;

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'OAuth2',
        serviceClient: process.env.EMAIL_SERVICE_CLIENT,
        privateKey: process.env.EMAIL_PRIVATE_KEY,
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

var emailUserAfterMint = async (toEmailAddress, etherscanLinkToTx) =>  {

    if (emailRegexp.test(toEmailAddress)) {

        //Valid email
        await transporter.sendMail({
            from: `${process.env.EMAIL_USER} <${process.env.EMAIL_ADDRESS}>`,
            to: toEmailAddress,
            subject: "NFT Minted",
            text: `Nft link here - ${etherscanLinkToTx}`,
            auth: {
                user: process.env.EMAIL_ADDRESS,
                accessToken: accessToken,
                expires: accessTokenExpiry
            }
        });
        
    } else {

        console.log('Error - Email address not valid');
    }

    return '';
}


var mailer = {
    emailUserAfterMint: emailUserAfterMint
}

export default mailer;