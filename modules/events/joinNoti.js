const fs = require('fs-extra');
const path = require('path');

const autoRulesPath = path.join(__dirname, '../../Data_Vtuan/data/autoRules.json');
const rulesDataPath = path.join(__dirname, '../../Data_Vtuan/data/rules.json');

module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "1.0.0",
  credits: "Vtuan",
  description: "Thông báo bot hoặc người vào nhóm",
};

module.exports.run = async function ({ api, event, Threads }) {
  const threadInfo = await api.getThreadInfo(event.threadID);
  const threadData = (await Threads.getData(event.threadID)).data || {};
  const { threadID } = event;

  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
    await api.changeNickname(`${global.config.BOTNAME || "𝙼𝚊𝚛𝚒𝚜<3"}`, threadID, api.getCurrentUserID());
    return api.sendMessage(`
Kết nối thành công! 
Mình là bot của ${global.config.ADMIN_NAME || "Vtuan"}
——————————————————
${global.config.PREFIX}check để xem mức độ tương tác
${global.config.PREFIX}checksn để xem danh sách người chưa setname
${global.config.PREFIX}ping để tag toàn bộ thành viên trong nhóm
${global.config.PREFIX}sing để nghe nhạc
${global.config.PREFIX}kick để kick người dùng ra khỏi nhóm
${global.config.PREFIX}anti để bật các công cụ chống phá nhóm
${global.config.PREFIX}rsdata để mỗi khi lọc xong sẽ reset lại dữ liệu checktt
${global.config.PREFIX}setprefix để đổi prefix của bot
${global.config.PREFIX}setUnsend để đổi icon gỡ bot
${global.config.PREFIX}setname để đổi biệt danh
${global.config.PREFIX}rule để thêm luật cho box
${global.config.PREFIX}caidat để xem các cài đặt của nhóm
${global.config.PREFIX}box để xem thông tin nhóm
${global.config.PREFIX}autokick để cấm thành viên nào đó vào nhóm
.....
dùng ${global.config.PREFIX} help,menu để xem danh sách lệnh.
${global.config.PREFIX}help + tên lệnh để xem cách dùng hoặc liên hệ trực tiếp admin để biết thêm thông tin qua link fb: ${(!global.config.FACEBOOK_ADMIN) ?  "Thêm facebook admin ở config!" : global.config.FACEBOOK_ADMIN}
`, threadID);
  } else {
    const addedByUserID = event.logMessageData.administratorFbId || event.author;
    const userInfo = await api.getUserInfo(addedByUserID);
    const addedByName = userInfo[addedByUserID]?.name;

    const participants = event.logMessageData.addedParticipants || [];
    const messages = [];
    let typeJoin;

    participants.forEach(async (participant) => {
      const userName = participant.fullName;
      const userFbId = participant.userFbId;
      
      typeJoin = (addedByUserID === userFbId || addedByName === userName)
        ? "đã tham gia nhóm"
        : `được thêm vào nhóm bởi ${addedByName}`;

      let msg = `${userName}`;
      messages.push(msg);
      console.log(`Thông báo thêm: ${msg}`);
    });

    if (!fs.existsSync(autoRulesPath)) {
      console.error('Lỗi: autoRules.json không tồn tại');
    } else {
      let autoRulesData;

      try {
        autoRulesData = fs.readFileSync(autoRulesPath, 'utf-8');
        autoRulesData = JSON.parse(autoRulesData);
      } catch (error) {
        console.error('Lỗi khi đọc autoRules.json:', error);
      }

      const threadRules = autoRulesData.find(entry => entry.threadID == threadID);

      if (threadRules && threadRules.status === true) {
        let rulesData;

        try {
          rulesData = fs.readFileSync(rulesDataPath, 'utf-8');
          rulesData = JSON.parse(rulesData);
        } catch (error) {
          console.error('Lỗi khi đọc rules.json:', error);
        }

        const thisThreadRules = rulesData.find(entry => entry.threadID == threadID);

        if (thisThreadRules && thisThreadRules.listRule && thisThreadRules.listRule.length > 0) {
          let msgg = "=== Luật của nhóm ===\n\n";
          thisThreadRules.listRule.forEach((rule, index) => {
            msgg += `${index + 1}/ ${rule}\n`;
          });
          api.sendMessage({ body: msgg }, threadID);
          return;
        }
      }
    }

    var msgs = `${messages.join(',')} ${typeJoin}`;
    await api.sendMessage(msgs, threadID);
  }
};
