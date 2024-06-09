const request = require("request");
const fs = require("fs");

module.exports.config = {
  name: "đấm",
  version: "1.0.0",
  hasPermssion: 0,
  Rent: 2,
  credits: "Vtuan",
  description: "Đấm người bạn tag",
  commandCategory: "Nhóm",
  usages: "[tag]",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, args, Users }) => {
    var links = [
        "https://i.postimg.cc/SNX8pD8Z/13126.gif",
        "https://i.postimg.cc/TYZb2gJT/146.gif",
        "https://i.postimg.cc/fyV3DR33/anime-punch.gif",
        "https://i.postimg.cc/P5sLnhdx/onehit-30-5-2016-3.gif",
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
    var callback = () => api.sendMessage({ body: `${name} đã bị đấm`, mentions: [{ tag: uid, id: uid }], attachment: fs.createReadStream(__dirname + "/cache/puch.gif") }, threadID, () => fs.unlinkSync(__dirname + "/cache/puch.gif"));

    request(encodeURI(links[Math.floor(Math.random() * links.length)])).pipe(fs.createWriteStream(__dirname + "/cache/puch.gif")).on("close", callback);
};
