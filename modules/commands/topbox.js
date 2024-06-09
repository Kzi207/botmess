const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

const folderPath = path.join(__dirname, '../../Data_Vtuan/data/messageCounts');

module.exports.config = {
  name: "topbox",
  version: "2.0.0",
  hasPermission: 0,
  Rent: 1,
  credits: "Vtuan",
  description: "Hiển thị thứ hạng tin nhắn của nhóm",
  commandCategory: "Nhóm",
  usages: "topbox",
  cooldowns: 5
};

const formatDateTime = dateTime => moment.tz(dateTime, 'Asia/Ho_Chi_Minh').format("HH:mm:ss || D/MM/YYYY");

const getMessageForGroup = async (api, item, i) => {
  const { threadName } = await api.getThreadInfo(item.file);
  return `⩺ Nhóm: ${threadName}\n⩺ Top: ${i + 1}\n⩺ Tổng: ${item.totalCount}\n⩺ Ngày tạo: ${item.created_at}\n—————————————`;
};

const getMessageForSingleThread = async (api, totalCounts, event) => {
  const threadIndex = totalCounts.findIndex(item => item.file === event.threadID);
  return (threadIndex !== -1) ? [ `▱▱ ⟦ Tương Tác Tổng ⟧ ▱▱\n\n⩺ Nhóm: ${await api.getThreadInfo(event.threadID).then(({threadName}) => threadName)}\n⩺ Top: ${threadIndex + 1}\n⩺ Tổng số tin nhắn: ${totalCounts[threadIndex].totalCount}\n⩺ Ngày tạo: ${totalCounts[threadIndex].created_at}\n—————————————` ] : [];
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const totalCounts = (await Promise.all((await fs.readdir(folderPath)).map(async (file, index) => {
      const { data, created_at } = fs.readJsonSync(path.join(folderPath, file), { throws: false }) || { data: [], created_at: null };
      return { index: index + 1, totalCount: data.reduce((acc, item) => acc + item.count, 0), file: path.parse(file).name, created_at };
    }))).sort((a, b) => b.totalCount - a.totalCount);

    const gio = formatDateTime(new Date());
    const isAll = args[0] === 'all';

    const totalCountsMessages = isAll ? [`▱▱▱ ⟦ Tổng Tương Tác ⟧ ▱▱▱`, ...(await Promise.all(totalCounts.map(async (item, i) => getMessageForGroup(api, item, i))))]
      : await getMessageForSingleThread(api, totalCounts, event);

    const msg = totalCountsMessages.join('\n');
    api.sendMessage(msg + `\n${gio}`, event.threadID);
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu từ các file:', error);
  }
};