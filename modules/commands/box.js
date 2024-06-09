const fs = require("fs");
const request = require("request");

module.exports.config = {
  name: "box",
  version: "1.0.0", 
  hasPermssion: 0,
  Rent: 1,
  credits: "HungCatMoi",
  description: "Xem thông tin box của bạn",
  commandCategory: "Quản Trị Viên", 
  usages: "boxinfo", 
  cooldowns: 0,
  dependencies: [] 
};

module.exports.run = async function({ api, event, args }) {
  let threadInfo = await api.getThreadInfo(event.threadID);
  let memLength = threadInfo.participantIDs.length;
  let threadMem = threadInfo.participantIDs.length;
  let nameMen = [];
  let gendernam = [];
  let gendernu = [];
  let nope = [];

  for (let z in threadInfo.userInfo) {
    let gioitinhone = threadInfo.userInfo[z].gender;
    let nName = threadInfo.userInfo[z].name;

    if (gioitinhone == "MALE") {
      gendernam.push(z + gioitinhone);
    } else if (gioitinhone == "FEMALE") {
      gendernu.push(gioitinhone);
    } else {
      nope.push(nName);
    }
  }

  let nam = gendernam.length;
  let nu = gendernu.length;
  let qtv = threadInfo.adminIDs.length;
  let sl = threadInfo.messageCount;
  let u = threadInfo.nicknames;
  let icon = threadInfo.emoji;
  let threadName = threadInfo.threadName;
  let id = threadInfo.threadID;
  let sex = threadInfo.approvalMode;
  let pd = sex == false ? 'tắt' : sex == true ? 'bật' : 'Kh';

  let callback = () =>
    api.sendMessage(
      {
        body: `⭐️Tên: ${threadName}\n👨‍💻 ID Box: ${id}\n👀 Phê duyệt: ${pd}\n🧠 Emoji: ${icon}\n👉 Thông tin: gồm ${threadMem} thành viên\nSố tv nam 🧑‍🦰: ${nam} thành viên\nSố tv nữ 👩‍🦰: ${nu} thành viên\nVới ${qtv} quản trị viên\n🕵️‍♀️ Tổng số tin nhắn: ${sl} tin.`,
        attachment: fs.createReadStream(__dirname + '/cache/1.png')
      },
      event.threadID,
      () => fs.unlinkSync(__dirname + '/cache/1.png'),
      event.messageID
    );

  return request(encodeURI(`${threadInfo.imageSrc}`))
    .pipe(fs.createWriteStream(__dirname + '/cache/1.png'))
    .on('close', () => callback());
};
