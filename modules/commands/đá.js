const request = require("request");
const fs = require("fs");

module.exports.config = {
  name: "đá",
  version: "1.0.0",
  Rent: 2,
  hasPermssion: 0,
  credits: "Vtuan",
  description: "Đá người bạn tag",
  commandCategory: "Nhóm",
  usages: "[tag]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args, Users }) => {
  var link = [    
    "https://i.postimg.cc/65TSxJYD/2ce5a017f6556ff103bce87b273b89b7.gif",
    "https://i.postimg.cc/65SP9jPT/Anime-083428-6224795.gif",
    "https://i.postimg.cc/RFXP2XfS/jXOwoHx.gif",
    "https://i.postimg.cc/jSPMRsNk/tumblr-nyc5ygy2a-Z1uz35lto1-540.gif",
  ];

  const { threadID, messageID, mentions, type, messageReply } = event;
  let uid;

  if (type === "message_reply" && messageReply) {
    uid = messageReply.senderID;
  }

  if (mentions && Object.keys(mentions).length > 0) {
    uid = Object.keys(mentions)[0];
  }

  if (!uid) {
    uid = event.senderID;
  }

  let name = await Users.getNameUser(uid);
  var callback = () => api.sendMessage({ body: `${name} đã bị sút`, mentions: [{ tag: uid, id: uid }], attachment: fs.createReadStream(__dirname + "/cache/spair.gif") }, threadID, () => fs.unlinkSync(__dirname + "/cache/spair.gif"));

  request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname + "/cache/spair.gif")).on("close", callback);
};
