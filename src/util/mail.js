// import send from "gmail-send";
// export default {
//     sendEmailAlert: function (alertArgs: MailArgs): void {
//         // console.info("sending email alert", alertArgs);
//         try {
//             send({
//                 user: process.env.MAIL_USER,               // Your GMail account used to send emails
//                 pass: process.env.MAIL_PASSWORD,             // Application-specific password
//                 to: alertArgs.to,      // Send back to yourself
//                 subject: alertArgs.subject,//'Error on Pro+ Server',
//                 html: alertArgs.html
//             })();
//         } catch (exception) {
//             console.log(exception);
//         }
//     }
// };
const nodemailer =  require("nodemailer"); 
 
// const transporter = nodemailer.createTransport( 
//   `smtps://${process.env.MAIL_USER}:${process.env.MAIL_PASSWORD}@smtp.conflee.de` 
// ); 
const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER, // generated ethereal user
      pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
  });
module.exports = {
    sendEmailAlert: (mailOptions) =>{
        mailOptions.from =process.env.MAIL_USER;
        transporter.sendMail( mailOptions, (error, info) => { 
        if (error) { 
            return console.log(`error: ${error}`); 
        } 
        console.log(`Message Sent ${info.response}`); 
        }); 
    }
};