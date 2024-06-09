const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const messageCountFolderPath = path.join(__dirname, '../../Data_Vtuan/data/messageCounts');

async function createIfNotExist(filePath) {
    if (!(await fs.pathExists(filePath))) {
        await fs.writeJson(filePath, { created_at: moment().format('YYYY-MM-DD HH:mm:ss'), data: [] }, { spaces: 2 });
    }
}

async function cleanUpAndFilterMessageCountData(api, threadID, messageCountData) {
    const threadInfo = await api.getThreadInfo(threadID);
    const currentParticipantIDsSet = new Set(threadInfo.participantIDs.map(String));
    return messageCountData.data.filter(member => currentParticipantIDsSet.has(member.userID));
}

module.exports.config = {
    name: "checkloc",
    version: "1.0.0",
    hasPermssion: 2,
    Rent: 1,
    credits: "Vtuan",
    description: "Lọc thành viên thủ công",
    commandCategory: "Quản Trị Viên",
    usages: "[reply số]",
    cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
    var { threadID, messageID, senderID } = event;
    const threadFilePath = path.join(messageCountFolderPath, `${threadID}.json`);
    await createIfNotExist(threadFilePath);
    let messageCountData = await fs.readJson(threadFilePath);
    let totalMessages = messageCountData.data.reduce((acc, cur) => acc + cur.count, 0);
    const { PREFIX } = global.config;
    let threadSetting = global.data.threadData.get(threadID) || {};
    let prefix = threadSetting.PREFIX || PREFIX;

    messageCountData.data.sort((a, b) => b.count - a.count);

    let groupMessageCounts = [];
    const directoryContent = await fs.readdir(messageCountFolderPath);
    for (const file of directoryContent.filter((file) => file.endsWith('.json'))) {
        const filePath = path.join(messageCountFolderPath, file);
        const data = await fs.readJson(filePath);
        const totalMessages = data.data.reduce((acc, cur) => acc + cur.count, 0);
        groupMessageCounts.push({ threadID: file.replace('.json', ''), totalMessages });
    }
    groupMessageCounts.sort((a, b) => b.totalMessages - a.totalMessages);
    let currentGroupRank = groupMessageCounts.findIndex(group => group.threadID === threadID) + 1;
    let totalGroups = groupMessageCounts.length;
    const threadInfo = await api.getThreadInfo(event.threadID);

    let msg = ``;
    const cleanedMessageCountData = await cleanUpAndFilterMessageCountData(api, threadID, messageCountData);
    const participantIDs = threadInfo.participantIDs.map(participant => participant.toString());
    const filteredMessageCountData = cleanedMessageCountData.filter(userInfo => participantIDs.includes(userInfo.userID));
    const userInformationList = filteredMessageCountData.map((userInfo, index) => {
        const name = userInfo.name || `UserID: ${userInfo.userID}`;
        return { index: index + 1, userID: userInfo.userID, name, count: userInfo.count };
    });
    const userInformationString = userInformationList.map(info => `${info.index}. ${info.name} (${info.count})`).join('\n');

    const botID = api.getCurrentUserID();
    const threadInfos = await api.getThreadInfo(event.threadID);
    const botIsAdmin = threadInfos.adminIDs.some(e => e.id == botID);
    var botNotIsAdmin = ``
    if (!botIsAdmin) {
        botNotIsAdmin += `
⩥ Bot Không Phải là quản trị viên nên không lọc được!!
`;
    } else {
        botNotIsAdmin += `
⩥ Reply số thứ tự mà bạn muốn xóa khỏi nhóm
(có thể nhập nhiều. VD: 1 2 3)
⩥ Dùng ${prefix}lọc + số tin nhắn muốn lọc để lọc thành viên không tương tác
⩥ Dùng ${prefix}rsdata để reset tin nhắn của nhóm về 0
`;
    }

    const resultString = `
== [ Interact Allin ] ==
${userInformationString}

▱▱▱▱▱▱▱▱▱▱▱▱▱
${botNotIsAdmin}
${moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss')} || ${moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY')}
→ Tổng: ${totalMessages} tin nhắn và xếp thứ ${currentGroupRank}/${totalGroups} nhóm.`;

    return api.sendMessage(resultString, threadID, (error, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            userInformationList,
            resultString
        });
    }, messageID);
    return api.sendMessage(msg, threadID);
};


module.exports.handleReply = async ({ event, api, handleReply, Threads, Users }) => {
    var { threadID, messageID, body, senderID } = event;
    var { userInformationList, author } = handleReply;
    if (senderID != author) return;
    api.unsendMessage(handleReply.messageID);
    if (!body) return api.sendMessage('Vui lòng nhập ít nhất một số thứ tự.', threadID, messageID);

    const selectedNumbers = body.split(' ').map(num => parseInt(num)).filter(num => !isNaN(num));
    if (selectedNumbers.length === 0) return api.sendMessage('Lựa chọn không hợp lệ.', threadID, messageID);

    const selectedUserInfos = selectedNumbers.map(number => {
        if (number > 0 && number <= userInformationList.length) {
            return userInformationList[number - 1];
        }
        return null;
    }).filter(userInfo => userInfo !== null);

    if (selectedUserInfos.length > 0) {
        let messages = `Danh sách người bị xóa khỏi nhóm\n`;
        for (let i = 0; i < selectedUserInfos.length; i++) {
            const selectedUserInfo = selectedUserInfos[i];
            await api.removeUserFromGroup(selectedUserInfo.userID, threadID);
            let name = await Users.getNameUser(selectedUserInfo.userID);
            messages += `${i + 1}. ${name}\n`;
        }

        handleReply.userInformationList = userInformationList.filter(userInfo =>
            !selectedUserInfos.some(selectedUserInfo => selectedUserInfo.userID === userInfo.userID)
        );

        api.sendMessage(messages, threadID);
    } else {
        api.sendMessage(`Lựa chọn không hợp lệ. Vui lòng kiểm tra lại.`, threadID, messageID);
    }
};
