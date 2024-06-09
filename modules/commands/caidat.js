const fs = require("fs");
const path = require('path');

const pathToAutoSetNameData = path.join(__dirname, '../../Data_Vtuan/data/autosetname.json');
const pathToAntiSpamData = path.join(__dirname, '../../Data_Vtuan/data/antispamStatus.json');
const messageCountFolderPath = path.join(__dirname, '../../Data_Vtuan/data/messageCounts');
const antiImageFilePath = path.join(__dirname, '../../Data_Vtuan/data/antiImages/antiImage.json');
const filePath = path.join(__dirname, '../../Data_Vtuan/data/namebox.json');
const iconUnsendPath = path.join(__dirname, '../../Data_Vtuan/data/iconUnsend.json');

module.exports.config = {
  name: "caidat",
  version: "1.0.0",
  hasPermssion: 1,
  Rent: 1,
  credits: "Vtuan",
  description: "Xem tất cả cài đặt của nhóm!",
  commandCategory: "Quản Trị Viên",
  usages: "...",
  cooldowns: 5,
};

module.exports.run = async ({ api, event, Threads, args }) => {
  const filesystem = global.nodemodule["fs-extra"];
  const threadSettings = await api.getThreadInfo(event.threadID);
  const threadID = event.threadID.toString();
  const ThreadData = global.data.threadData; 
  let antispamStatusMsg, spamCountMsg, spamTimeMsg, antispamSettings;
  let autoSetNameMsg;
  let antiImageStatusMsg;
  let threadTitle = threadSettings.threadName;
  let groupId = threadSettings.threadID;

  // Approval mode data
  let approvalModeStatus = threadSettings.approvalMode;
  const approvalModeText = approvalModeStatus === false ? 'tắt' : approvalModeStatus === true ? 'bật' : 'Kh';

  // Antispam data
  if (!filesystem.existsSync(pathToAntiSpamData)) {
    antispamStatusMsg = "Chưa cài đặt antispam!";
  } else {
    const antispamData = JSON.parse(filesystem.readFileSync(pathToAntiSpamData, "utf-8"));
    const threadAntispamData = antispamData.find(item => item.threadID === event.threadID.toString());
    if (threadAntispamData && threadAntispamData.status === true) {
      antispamStatusMsg = "Bật";
      spamCountMsg = `${threadAntispamData.spamCount}`;
      spamTimeMsg = `${(threadAntispamData.spamTime / 1000).toFixed(2)}s`;
      antispamSettings = `${spamCountMsg}|${spamTimeMsg}`
    } else {
      antispamStatusMsg = "Tắt";
      spamCountMsg = "";
      spamTimeMsg = "";
      antispamSettings = ``
    }
  }

  // Auto set name data
  if (!filesystem.existsSync(pathToAutoSetNameData)) {
    autoSetNameMsg = "Không có";
  } else {
    const autoSetNameData = JSON.parse(filesystem.readFileSync(pathToAutoSetNameData, "utf-8"));
    const threadAutoSetName = autoSetNameData.find(item => item.threadID === event.threadID.toString());
    if (threadAutoSetName && threadAutoSetName.nameUser && threadAutoSetName.nameUser.length > 0) {
      autoSetNameMsg = `Bật (${threadAutoSetName.nameUser})`;
    } else {
      autoSetNameMsg = "Không có";
    }
  }

  /// Anti out data
  const threadExtraData = await Threads.getData(event.threadID);
  const isAntiOutEnabled = threadExtraData.data && threadExtraData.data.antiout;
  const antiOutStatusMsg = isAntiOutEnabled ? "Bật" : "Tắt";

  // Message rank data
  const currentThreadID = event.threadID;
  const directoryContent = await filesystem.readdir(messageCountFolderPath);
  const messageCountFiles = directoryContent.filter((file) => file.endsWith('.json'));
  const groupMessageCountStats = [];

  for (const file of messageCountFiles) {
      const filePath = path.join(messageCountFolderPath, file);
      const fileContent = await filesystem.readJson(filePath);
      const totalMsgs = fileContent.data.reduce((acc, cur) => acc + cur.count, 0);
      const threadID = file.replace('.json', '');
      groupMessageCountStats.push({ threadID, totalMessages: totalMsgs });
  }

  groupMessageCountStats.sort((a, b) => b.totalMessages - a.totalMessages);
  const currentGroup = groupMessageCountStats.find(group => group.threadID === currentThreadID);
  const currentGroupRank = groupMessageCountStats.findIndex(group => group.threadID === currentThreadID) + 1;
  const currentGroupMsgCount = currentGroup ? currentGroup.totalMessages : 0;
  const totalGroupCount = groupMessageCountStats.length;
  const msgRankText = `Nhóm đứng top ${currentGroupRank} server với ${currentGroupMsgCount} tin nhắn trong tổng số ${totalGroupCount} nhóm.`;

  /// Anti image data
  try {
    const antiImageJSONData = filesystem.readJsonSync(antiImageFilePath);
    const antiImageData = antiImageJSONData.find(item => item.id === threadID);
    antiImageStatusMsg = antiImageData ? (antiImageData.status ? "Bật" : "Tắt") : "tắt";
  } catch (error) {
    console.error('Không thể đọc dữ liệu từ file antiImage.json', error);
    antiImageStatusMsg = "Không thể xác định";
  }

  /// Antinamebox data 
  const nameboxData = filesystem.readJsonSync(filePath, { throws: false }) || [];
  const nameboxEntry = nameboxData.find(entry => entry.threadID == threadID);
  const nameboxStatusText = nameboxEntry && nameboxEntry.status ? "bật" : "tắt";

  /// Icon Unsend data
  const threadGroupId = event.threadID;
  let iconUnsendData = [];

  if (fs.existsSync(iconUnsendPath)) {
    const iconUnsendFileData = fs.readFileSync(iconUnsendPath, 'utf-8');
    iconUnsendData = JSON.parse(iconUnsendFileData);
  }

  const iconUnsendConfig = global.config.iconUnsend; 
  const iconUnsendStatus = iconUnsendConfig.status;
  const iconUnsendIcon = iconUnsendConfig.icon;

  const existingGroup = iconUnsendData.find(item => item.groupId === threadGroupId);
  let unsendIcon = '';

  if (existingGroup && existingGroup.iconUnsend) {
    unsendIcon = `${existingGroup.iconUnsend}`;
  } else {
    unsendIcon = `${iconUnsendIcon}`;
  }

  return api.sendMessage(`== [ Cài Đặt Nhóm ] ==\n────────────\n→ Tên nhóm: ${threadTitle || "không có"}\n→ ID: ${threadGroupId}\n→ Phê duyệt: ${approvalModeText}\n→ Antispam: ${antispamStatusMsg} ${antispamSettings}\n→ Autosetname: ${autoSetNameMsg}\n→ Antiout: ${antiOutStatusMsg}\n→ Anti ảnh nhóm: ${antiImageStatusMsg}\n→ Anti tên nhóm: ${nameboxStatusText}\n→ Icon unsend: ${unsendIcon}\n────────────\n${msgRankText}`, event.threadID);
};
