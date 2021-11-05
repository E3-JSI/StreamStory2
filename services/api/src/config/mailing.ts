import nodemailer from 'nodemailer';

import config from '.';

const transporter = nodemailer.createTransport(config.mailer);

export default transporter;
