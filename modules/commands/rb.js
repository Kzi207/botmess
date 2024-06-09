const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const rentbotPath = path.join(__dirname, '../../Data_Vtuan/data/rentbot.json');

module.exports.config = {
    name: "rb",
    version: "1.0.0",
    hasPermssion: 3,
    Rent: 2,
    credits: "Vtuan",
    description: "Quản lí người thuê bot",
    commandCategory: "Admin-Hệ Thống",
    usages: "[ThueBot] add [id1] [id2]",
    cooldowns: 0
};

module.exports.run = async ({ api, event, args, Users }) => {
    const command = args[0];

    if (command === 'add') {
        const ThueBot = args[1];
        const threadID = event.threadID;

        if (ThueBot >= 3 || ThueBot < 0) {
            return api.sendMessage('Quyền hạn chỉ được phép nhập 1 hoặc 2', threadID, event.messageID);
        }

        let id1 = args[2];
        let id2 = args[3];
        if (!id2) {
            id1 = args[2];
            id2 = threadID;
        } else {
            if (id1 > id2) {
                [id1, id2] = [id2, id1];
            }
        }


        const dataToWrite = {
            ThueBot,
            id1,
            id2,
            NgàyBD: moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD|HH:mm:ss'),
            NgàyKT: moment().tz('Asia/Ho_Chi_Minh').add(1, 'month').format('YYYY-MM-DD|HH:mm:ss')
        };

        let currentData = [];
        try {
            currentData = await fs.readJson(rentbotPath);
        } catch (error) {
            console.error('Error reading rentbot.json:', error);
        }

        const existingPairIndex = currentData.findIndex(item => item.id1 === id1 && item.id2 === id2);
        if (existingPairIndex !== -1) {
            currentData[existingPairIndex].ThueBot = ThueBot;
            currentData[existingPairIndex].NgàyKT = NgàyKT;
        } else {
            currentData.push(dataToWrite);
        }

        try {
            await fs.writeJson(rentbotPath, currentData, { spaces: 2, EOL: '\r\n' });
            api.sendMessage('Đã ghi dữ liệu thành công!', threadID);
        } catch (error) {
            console.error('Error writing to rentbot.json:', error);
            api.sendMessage('Có lỗi xảy ra khi ghi dữ liệu.', threadID);
        }
    } else if (command === 'list') {
        let currentData = [];
         currentData = await fs.readJson(rentbotPath);

        if (currentData.length === 0) {
            const resultString = 'Không có dữ liệu thuê bot nào.';
            return api.sendMessage(resultString, event.threadID, (error, info) => {
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    resultString
                });
            }, event.messageID);
        } else {
            const listMessage = currentData.map(async (item, index) => {
              const userName = await Users.getNameUser(item.id1);
                const threadInfo = await api.getThreadInfo(item.id2);
                const groupName = threadInfo.name;

                return `
‣ ${index + 1}. ${userName} 
‣ ${groupName} 
‣ Bắt đầu: ${item.NgàyBD}
‣ Hết hạn: ${item.NgàyKT}
‣ ${item.ThueBot === 1 ? 'Không thuê' : 'Đang thuê'}
———————————————
`;
            });

            const resultString = `Danh sách thuê bot:\n${(await Promise.all(listMessage)).join('\n')}`;
            return api.sendMessage(resultString, event.threadID, (error, info) => {
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    resultString
                });
            }, event.messageID);
        }
    } else {
        const usageMessage = 'Cách sử dụng:\n' +
            '[ThueBot] add [id1] [id2]\n' +
            '[ThueBot] list\n';
        api.sendMessage(usageMessage, event.threadID);
    }
};