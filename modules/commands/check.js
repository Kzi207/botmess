const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const messageCountFolderPath = path.join(__dirname, '../../Data_Vtuan/data/messageCounts');

module.exports.config = {
    name: "check",
    version: "2.0.0",
    hasPermssion: 0,
    Rent: 1,
    credits: "Vtuan",
    description: "Kiểm tra tương tác",
    commandCategory: "Nhóm",
    usages: "[...|tag|reply|all]",
    cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
    try {
        const ic = require('./../../Data_Vtuan/datajson/icon.json');
        const icon = ic[Math.floor(Math.random() * ic.length)].trim();
        const { threadID, messageReply, mentions } = event;
        const file = path.join(messageCountFolderPath, `${event.threadID}.json`);
        const { data } = await fs.readJson(file).catch(error => {
            return { data: [] };
        });
        if (!data || !Array.isArray(data)) {
            return;
        }
        const read = await fs.readJson(file).catch(error => {
            return { created_at: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss||YYYY-MM-DD'), data: [] };
        });
        const ntdl = read.created_at;
        const threadInfo = await api.getThreadInfo(event.threadID).catch(error => {
            return null;
        });
        if (!threadInfo) {
            return;
        }
        const participantIDs = Array.isArray(threadInfo.participantIDs) ? threadInfo.participantIDs : [];

        const sortedData = [...data].sort((a, b) => b.count - a.count);
        const itemsPerPage = 15;// đổi số người / 1 trang ở đây
        const totalPages = Math.ceil(sortedData.length / itemsPerPage);

        if (args[0] === 'all' && Array.isArray(participantIDs) && event.senderID) {
            let currentPage = args[1] && !isNaN(args[1]) ? parseInt(args[1]) : 1;
            currentPage = Math.max(1, Math.min(currentPage, totalPages));

            const startIdx = (currentPage - 1) * itemsPerPage;
            const endIdx = startIdx + itemsPerPage;
            const currentDataPage = sortedData.slice(startIdx, endIdx);

            const userInteraction = sortedData.find(user => user.userID === event.senderID);
            const userRank = sortedData.findIndex(user => user.userID === event.senderID && participantIDs.includes(event.senderID));
            const userInteractionCount = userInteraction ? userInteraction.count : 0;

            const msg = `⟦🏆  Tương tác 🏆⟧\n${currentDataPage
                .filter(user => participantIDs.includes(user.userID))
                .map((user, index) => `⪼ Top: ${startIdx + index + 1}\n⪼ Name: ${user.name}\n⪼ Tương tác: ${user.count} tin nhắn\n⪼ Lần tt cuối: ${user.ttgn}\n▱▱▱▱▱▱▱▱▱▱▱▱▱\n`)
                .join('')}\n${userRank >= 0 ? `Bạn đứng thứ ${userRank + 1} với ${sortedData[userRank].count} tin nhắn` : ''}\n\nTrang ${currentPage}/${totalPages}\n⩺ Reply + trang muốn xem\n⩺ check all + trang muốn xem\n⪧ Ngày Tạo Dữ Liệu: ${ntdl}`;

            api.sendMessage(msg, threadID, (error, info) => {
                if (!error) {
                    global.client.handleReply.push({
                        name: module.exports.config.name,
                        messageID: info.messageID,
                        author: event.senderID,
                        msg,
                        currentPage,
                        totalPages,
                        itemsPerPage,
                        sortedData,
                        participantIDs,
                        ntdl
                    });
                }
            });
        } else {
            const uid = messageReply && messageReply.senderID || (mentions && Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : event.senderID);
            const userRank = sortedData.findIndex(user => user.userID === uid && participantIDs.includes(uid));

            if (userRank !== -1) {
                const user = sortedData[userRank];
                const msg = `[${icon}] Thông tin tương tác của ${user.name}\n`
                    + `⩺ Đứng thứ ${userRank + 1} với ${user.count} tin nhắn\n`
                    + `⩺ Lần tương tác gần nhất: ${user.ttgn}\n`;
                api.sendMessage(msg, threadID);
            }
        }
    } catch (error) {
        console.error('Lỗi trong quá trình xử lý sự kiện:', error);
    }
};

module.exports.handleReply = async ({ api, handleReply, event }) => {
    const { threadID, senderID, body } = event;
    let { msg, currentPage, totalPages, itemsPerPage, sortedData, participantIDs, ntdl, author } = handleReply;

    if (isNaN(parseInt(body)) || body > totalPages) return api.sendMessage(`${body} cái lồn`, threadID);
    if (senderID != author) return api.sendMessage(`Cút`, threadID);

    api.unsendMessage(handleReply.messageID);

    if (body.toLowerCase() === 'next') {
        currentPage++;
    } else if (body.toLowerCase() === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (!isNaN(parseInt(body))) {
        const requestedPage = parseInt(body);
        if (requestedPage > 0 && requestedPage <= totalPages) {
            currentPage = requestedPage;
        }
    }

    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentDataPage = sortedData.slice(startIdx, endIdx);

    const newMsg = `⟦🏆  Tương tác 🏆⟧\n${currentDataPage
        .filter(user => participantIDs.includes(user.userID))
        .map((user, index) => `⪼ Top: ${startIdx + index + 1}\n⪼ Name: ${user.name}\n⪼ Tương tác: ${user.count} tin nhắn\n⪼ Lần tt cuối: ${user.ttgn}\n▱▱▱▱▱▱▱▱▱▱▱▱▱\n`)
        .join('')}\nTrang ${currentPage}/${totalPages}\nReply + trang muốn xem\n⪧ Ngày Tạo Dữ Liệu: ${ntdl}`;

    api.sendMessage(newMsg, threadID, async (error, info) => {
        if (error) {
            console.error(error);
        } else {
            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                msg,
                currentPage,
                totalPages,
                itemsPerPage,
                sortedData,
                participantIDs
            });
        }
    });
};

module.exports.handleEvent = async ({ api, event }) => {
    try {
        const filePath = path.join(messageCountFolderPath, `${event.threadID}.json`);
        let threadData = fs.existsSync(filePath) ? await fs.readJson(filePath) : {
            created_at: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss||YYYY-MM-DD'),
            data: []
        };
        const currentTime = moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss||YYYY-MM-DD');

        const threadInfo = await api.getThreadInfo(event.threadID).catch(error => {
            console.error('Lỗi khi lấy thông tin thread:', error);
            return null;
        });

        if (!threadInfo) {
            console.error('Không thể lấy thông tin thread.');
            return;
        }

        await Promise.all(threadInfo.participantIDs.map(async userID => {
            if (!threadData.data.some(user => user.userID === userID)) {
                const userInfo = await api.getUserInfo(userID);
                threadData.data.push({
                    userID,
                    count: 0,
                    name: userInfo[userID]?.name || "Unknown",
                    ttgn: currentTime
                });
            }
        }));

        if (!threadData.data.some(user => user.userID === event.senderID)) {
            try {
                const userInfo = await api.getUserInfo(event.senderID);
                threadData.data.push({
                    userID: event.senderID,
                    count: 1,
                    name: userInfo[event.senderID]?.name || "Unknown",
                    ttgn: currentTime
                });
            } catch (error) {
                threadData.data.push({
                    userID: event.senderID,
                    count: 1,
                    name: "Unknown",
                    ttgn: currentTime
                });
            }
        } else {
            const userToUpdate = threadData.data.find(user => user.userID === event.senderID);
            userToUpdate.count += 1;
            userToUpdate.ttgn = currentTime;
        }

        await fs.writeJson(filePath, threadData, { spaces: 2 });
    } catch (error) {
        console.error('Lỗi trong quá trình xử lý sự kiện:', error);
    }
};
