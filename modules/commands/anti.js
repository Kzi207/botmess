const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');

const filePath = path.join(__dirname, '../../Data_Vtuan/data/namebox.json');
const antiImageFolderPath = path.join(__dirname, '../../Data_Vtuan/data/antiImages');
const antiImageFilePath = path.join(__dirname, '../../Data_Vtuan/data/antiImages/antiImage.json');
const antiSpamPath = path.join(__dirname, '../../Data_Vtuan/data/antispamStatus.json');

fs.ensureFileSync(filePath);
let data = fs.readJsonSync(filePath, { throws: false }) || [];
let antiSpamStatus = fs.existsSync(antiSpamPath) ? JSON.parse(fs.readFileSync(antiSpamPath)) : [];
let usersSpam = {};

function createAntiImageFolderIfNotExist() {
    fs.ensureDirSync(antiImageFolderPath);
}

function createAntiImageFileIfNotExist() {
    if (!fs.existsSync(antiImageFilePath)) {
        fs.writeJsonSync(antiImageFilePath, []);
    }
}

module.exports.config = {
    Rent: 2,
    hasPermssion: 1,
    credits: "Vtuan",
    name: "anti",
    commandCategory: "Quản Trị Viên",
    usages: "anti",
    version: "6.0.0",
    cooldowns: 0,
    description: 'anti',
};

module.exports.run = async ({ api, event, args, Threads }) => {
    const { threadID, messageID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName;
    const { PREFIX } = global.config;
    let threadSetting = global.data.threadData.get(threadID) || {};
    let prefix = threadSetting.PREFIX || PREFIX;

    if (!args[0]) {
        return api.sendMessage(`
=== 『 𝐇𝐒𝐛𝐨𝐱 』 ===
|‣ ${prefix}𝐚𝐧𝐭𝐢 𝐧𝐚𝐦𝐞𝐛𝐨𝐱: 𝐨𝐧/𝐨𝐟𝐟-𝐜𝐡𝐨̂́𝐧𝐠 đ𝐨̂̉𝐢 𝐭𝐞̂𝐧 𝐧𝐡𝐨́𝐦
————————————————
|‣ ${prefix}𝐚𝐧𝐭𝐢 𝐬𝐩𝐚𝐦: 𝐨𝐧/𝐨𝐟𝐟-𝐜𝐡𝐨̂́𝐧𝐠 𝐬𝐩𝐚𝐦 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 
————————————————
|‣ ${prefix}𝐚𝐧𝐭𝐢 𝐚𝐯𝐭𝐛𝐨𝐱: 𝐨𝐧/𝐨𝐟𝐟-𝐜𝐡𝐨̂́𝐧𝐠 đ𝐨̂̉𝐢 𝐚̉𝐧𝐡 𝐧𝐡𝐨́𝐦
————————————————
|‣ ${prefix}𝐚𝐧𝐭𝐢 𝐨𝐮𝐭 - 𝐜𝐡𝐨̂́𝐧𝐠 𝐭𝐡𝐚̀𝐧𝐡 𝐯𝐢𝐞̂𝐧 𝐨𝐮𝐭 𝐜𝐡𝐮̀𝐚
————————————————
|‣ ${prefix}𝐚𝐧𝐭𝐢 𝐪𝐭𝐯 - 𝐡𝐚̣𝐧 𝐜𝐡𝐞̂́ 𝐤𝐡𝐚̉ 𝐧𝐚̆𝐧𝐠 𝐜𝐮̛𝐨̛́𝐩 𝐛𝐨𝐱
————————————————
     ${moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss')} || ${moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY')}
        `, threadID, messageID);
    }

    switch (args[0]) {
        case "namebox":
            if (args.length !== 2 || (args[1] !== "on" && args[1] !== "off")) {
                return api.sendMessage(`${prefix}anti namebox on để bật chống đổi tên nhóm\n${prefix}anti namebox off để tắt.`, threadID, messageID);
            }

            let threadEntry = data.find(entry => entry.threadID === threadID);
            if (args[1] === "on") {
                if (!threadEntry) {
                    threadEntry = { threadID: threadID, namebox: threadName, status: true };
                    data.push(threadEntry);
                } else {
                    threadEntry.status = true;
                    threadEntry.namebox = threadName;
                }
            } else if (args[1] === "off") {
                if (threadEntry) threadEntry.status = false;
            }

            try {
                fs.writeJsonSync(filePath, data);
                api.sendMessage(`Đã ${threadEntry.status ? "bật" : "tắt"} chức năng chống đổi tên nhóm ${threadEntry.namebox}`, threadID, messageID);
            } catch (error) {
                api.sendMessage("Đã xảy ra lỗi khi cố gắng cập nhật cài đặt, vui lòng thử lại sau.", threadID, messageID);
                console.error("Không thể ghi vào tệp namebox.json:", error);
            }
            break;

        case "spam":
            const infoThread = await api.getThreadInfo(threadID);
            const adminIDs = infoThread.adminIDs.map(e => e.id);
            const idBot = api.getCurrentUserID();

            switch (args[1]) {
                case "setspam":
                    if (!adminIDs.includes(idBot)) {
                        api.sendMessage("Bot phải là quản trị viên thì mới setspam được nhé<3", threadID);
                        return;
                    }
                    let newCount = parseInt(args[2]);
                    let newTime = parseInt(args[3]);
                    if (isNaN(newCount) || isNaN(newTime)) {
                        api.sendMessage("Vui lòng cung cấp số lần tin nhắn và thời gian hợp lệ.", threadID);
                        return;
                    }
                    const index = antiSpamStatus.findIndex(setting => setting.threadID === threadID);
                    if (index !== -1) {
                        antiSpamStatus[index].spamCount = newCount;
                        antiSpamStatus[index].spamTime = newTime;
                    } else {
                        antiSpamStatus.push({ threadID, spamCount: newCount, spamTime: newTime, status: false });
                    }
                    fs.writeFileSync(antiSpamPath, JSON.stringify(antiSpamStatus, null, 4));
                    api.sendMessage(`Đã cài đặt scan antispam ${newCount}/${newTime/1000}s\nDùng ${global.config.PREFIX}antispam on để bật chế độ chống spam<3`, threadID);
                    break;
                case "on":
                    const settingOn = antiSpamStatus.find(setting => setting.threadID === threadID);
                    if (!settingOn) {
                        api.sendMessage(`Dùng ${global.config.PREFIX}antispam setspam <số tin nhắn> <time> để cài đặt thông số`, threadID);
                        return;
                    }
                    settingOn.status = true;
                    fs.writeFileSync(antiSpamPath, JSON.stringify(antiSpamStatus, null, 4));
                    api.sendMessage('Đã bật chế độ chống spam!', threadID);
                    break;
                case "off":
                    const settingOff = antiSpamStatus.find(setting => setting.threadID === threadID);
                    if (settingOff) {
                        settingOff.status = false;
                        fs.writeFileSync(antiSpamPath, JSON.stringify(antiSpamStatus, null, 4));
                        api.sendMessage('Đã tắt chế độ chống spam!', threadID);
                    }
                    break;
                default:
                    api.sendMessage("Dùng antispam setspam/on/off [count] [time]", threadID);
            }
            break;

        case "avtbox":
            const cmdImage = args[1];
            const threadIDStr = event.threadID.toString();
            let antiImageData = await fs.readJson(antiImageFilePath).catch(() => []);
            let threadData = antiImageData.find(item => item.id === threadIDStr);

            if (cmdImage === 'on') {
                createAntiImageFolderIfNotExist(antiImageFolderPath);

                if (!threadData) {
                    threadData = { id: threadIDStr, status: true };
                    antiImageData.push(threadData);
                } else {
                    threadData.status = true;
                }

                const threadInfo = await api.getThreadInfo(threadID);
                const imageUrl = threadInfo.imageSrc;
                threadData.imageURL = imageUrl;

                const response = await axios({
                    method: 'get',
                    url: imageUrl,
                    responseType: 'stream',
                });

                const fileName = `${threadIDStr}.jpg`;
                const imagePath = path.join(antiImageFolderPath, fileName);
                const writer = fs.createWriteStream(imagePath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                await fs.writeJson(antiImageFilePath, antiImageData, { spaces: 4 });

                api.sendMessage(`Đã bật anti ảnh nhóm!`, threadID);
            } else if (cmdImage === 'off') {
                if (threadData) {
                    threadData.status = false;
                    const imageFilePath = path.join(antiImageFolderPath, `${threadIDStr}.jpg`);
                    if (fs.existsSync(imageFilePath)) {
                        fs.unlinkSync(imageFilePath);
                    }
                    api.sendMessage('Đã tắt anti ảnh nhóm!', threadID);
                } else {
                    api.sendMessage('Đã bật anti ảnh đéo đâu mà tắt?', threadID);
                }
            } else {
                api.sendMessage(`Dùng ${global.config.PREFIX}avtbox on hoặc off để bật/tắt theo ý muốn`, threadID);
            }
            await fs.writeJson(antiImageFilePath, antiImageData, { spaces: 4 });
            break;

        case "out":
            let dataAntiout = (await Threads.getData(event.threadID)).data || {};
            if (typeof dataAntiout["antiout"] === "undefined" || dataAntiout["antiout"] === false) {
                dataAntiout["antiout"] = true;
            } else {
                dataAntiout["antiout"] = false;
            }
            await Threads.setData(event.threadID, { data: dataAntiout });
            global.data.threadData.set(parseInt(event.threadID), dataAntiout);
            return api.sendMessage(`${dataAntiout["antiout"] ? "bật" : "tắt"} thành công chức năng chống thành viên out chùa`, event.threadID);

        case "qtv":
            const info = await api.getThreadInfo(event.threadID);
            if (!info.adminIDs.some(item => item.id == api.getCurrentUserID())) {
                return api.sendMessage({ body: 'Bot chưa là quản trị viên!!' }, event.threadID, event.messageID);
            }
            const dataQtv = (await Threads.getData(event.threadID)).data || {};
            if (typeof dataQtv["guard"] === "undefined" || dataQtv["guard"] === false) {
                dataQtv["guard"] = true;
            } else {
                dataQtv["guard"] = false;
            }
            await Threads.setData(event.threadID, { data: dataQtv });
            global.data.threadData.set(parseInt(event.threadID), dataQtv);
            return api.sendMessage({ body: `Đã ${dataQtv["guard"] ? "bật" : "tắt"} thành công anti thay đổi quản trị viên` }, event.threadID, event.messageID);

        default:
            return api.sendMessage('Tùy chọn không hợp lệ.', event.threadID, event.messageID);
    }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
    const { threadID, senderID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
    const adminBot = global.config.ADMINBOT || [];

    if (adminBot.includes(senderID) || adminIDs.includes(senderID)) return;

    let antispamData = JSON.parse(fs.readFileSync(antiSpamPath, "utf-8"));
    let threadAntispamData = antispamData.find(item => item.threadID === event.threadID.toString());

    if (threadAntispamData && threadAntispamData.status === true) {
        if (!usersSpam[senderID]) {
            usersSpam[senderID] = { count: 0, start: Date.now() };
        }

        usersSpam[senderID].count++;
        let name = await Users.getNameUser(senderID);
        if (Date.now() - usersSpam[senderID].start > threadAntispamData.spamTime) {
            if (usersSpam[senderID].count > threadAntispamData.spamCount) {
                api.removeUserFromGroup(senderID, threadID);
                api.sendMessage({
                    body: `Đã tự động kick ${name} do spam`}, threadID);
            }
            usersSpam[senderID].count = 0;
            usersSpam[senderID].start = Date.now();
        }
    }
};
