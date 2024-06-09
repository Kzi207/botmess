module.exports.config = {
  name: "sex",
  version: "2.0.0",
  hasPermssion: 0,
  Rent: 2,
  credits: "Vtuan",
  description: "Xem video về anime chill",
  commandCategory: "Random-img",
  usages: "",
  cooldowns: 2
};

module.exports.run = async ({ api, event ,Users}) => {
  const axios = require('axios');
  const request = require('request');
  const fs = require("fs");
  const video = require('./../../Data_Vtuan/datajson/vdgai.json');
  const randomVideo = video[Math.floor(Math.random() * video.length)].trim();
  const fileName = '1.mp4';
  const filePath = __dirname + `/${fileName}`;

  function downloadAndSendImage(image, fileName, callback) {
    request(image).pipe(fs.createWriteStream(fileName)).on("close", callback);
  }

  let callback = function () {
    return api.sendMessage({
      body: 'sex cái cc có gái thoi ',
      attachment: [
        fs.createReadStream(filePath)
      ]
    }, event.threadID, () => {
      fs.unlinkSync(filePath);
    }, event.messageID);
  };
  downloadAndSendImage(randomVideo, filePath, callback);
}
