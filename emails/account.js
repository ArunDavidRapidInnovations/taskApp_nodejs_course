const result = require('dotenv').config();

const sgMail = require('@sendgrid/mail');

const sendGridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendGridAPIKey);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'arun@rapidinnovation.dev',
    subject: 'Thanks for Joining the app!',
    text: ` Hi ${name}, \n\n thanks for signing into the application. Please reach out if you need any help with the system. \n\n regards\n Arun`,
  });
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'arun@rapidinnovation.dev',
    subject: 'Cancellation Email',
    text: ` Hi ${name}, \n\n this is a cancellation email. To cancel this service please spin twice, Just kidding. we already deleted your account. If you have any suggestions that would have improved your experience with us please reply to this emil. \n\n regards\n Arun`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
