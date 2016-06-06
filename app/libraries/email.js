'use strict';

const nodemailer = require('nodemailer');
const sesTransport = require('nodemailer-ses-transport');

const cloud = require('./cloud');

const transporter = nodemailer.createTransport(sesTransport({
  ses: cloud.ses,
}));

module.exports = {
  send(message) {
    return transporter.sendMail(message);
  },
};
