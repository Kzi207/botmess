module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "Mirai Team", // mod by vtuan
  description: "Thông báo bot hoặc người rời khỏi nhóm",
  dependencies: {
    "fs-extra": "",
    "path": ""
  }
};

module.exports.run = async function ({ api, event, Users }) {
  const { logMessageData } = event;
  const name = global.data.userName.get(logMessageData.leftParticipantFbId) || await Users.getNameUser(logMessageData.leftParticipantFbId);
  const type = (event.author == logMessageData.leftParticipantFbId) ? "rời" : "bị quản trị viên kick";

  let msg = `${name} đã ${type} khỏi nhóm.`;

  return api.sendMessage(msg, event.threadID);
};
