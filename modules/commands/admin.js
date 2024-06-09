module.exports.config = {
    name: "admin",
    version: "1.0.5",
    hasPermssion: 0,
    Rent: 1,
    credits: "Mirai Team",
    description: "Bật tắt chế độ chỉ qtv dùng lệnh",
    commandCategory: "Admin-Hệ Thống",
    usages: "Bật tắt chế độ chỉ admin và qtv dùng lệnh",
    cooldowns: 0,
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.languages = {
    "vi": {
        "listAdmin": ` ADMINBOT \n\n%1`,
        "listNDH": `  SUPPORTBOT  \n\n%1`,
        "notHavePermssion": ' Bạn không đủ quyền hạn để có thể sử dụng chức năng "%1"',
        "addedNewAdmin": ' Đã thêm %1 người dùng trở thành ADMINBOT:\n\n%2',
        "removedAdmin": ' Đã gỡ bỏ %1 người điều hành adminbot:\n\n%2',
        "removedAdminSupport": 'Đã gỡ bỏ %1 người điều hành Support Bot:\n\n%2',
        "adminsupport": ' Đã thêm %1 người dùng trở thành người hỗ trợ  người điều hành bot:\n\n%2'
    },
    "en": {
        "listAdmin": '[Admin] Admin list: \n\n%1',
        "notHavePermssion": '[Admin] You have no permission to use "%1"',
        "addedNewAdmin": '[Admin] Added %1 Admin :\n\n%2',
        "removedAdmin": '[Admin] Remove %1 Admin:\n\n%2'
    }
};

module.exports.onLoad = function () {
    const { writeFileSync, existsSync } = require('fs-extra');
    const { resolve } = require("path");
    const path = resolve(__dirname, 'cache', 'data.json');
    if (!existsSync(path)) {
        const obj = {
            adminbox: {}
        };
        writeFileSync(path, JSON.stringify(obj, null, 4));
    } else {
        const data = require(path);
        if (!data.hasOwnProperty('adminbox')) data.adminbox = {};
        writeFileSync(path, JSON.stringify(data, null, 4));
    }
};

module.exports.run = async function ({ api, event, args, Users, permssion, getText }) {
    const content = args.slice(1, args.length);
    const moment = require("moment-timezone");
    var timeNow = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss");

    if (args.length == 0) return api.sendMessage(`=== 『 𝚌𝚊́𝚌𝚑 𝚍𝚞̀𝚗𝚐  』 ===\n▱▱▱▱▱▱▱▱▱▱▱▱▱\n\n→ admin add => thêm người dùng làm adminbot\n→ admin rm => gỡ bỏ adminbot\n→ admin list => xem danh sách các admin \n▱▱▱▱▱▱▱▱▱▱▱▱▱\n===「${timeNow}」===`, event.threadID, event.messageID);

    const { threadID, messageID, mentions } = event;
    const { configPath } = global.client;
    const { ADMINBOT } = global.config;
    const { NDH } = global.config;
    const { userName } = global.data;
    const { writeFileSync } = global.nodemodule["fs-extra"];
    const mention = Object.keys(mentions);

    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);

    switch (args[0]) {
        case "add": {
            if (event.senderID != ADMINBOT[0]) return api.sendMessage(`Quyền hạn????`, event.threadID, event.messageID)
            if (event.type == "message_reply") { content[0] = event.messageReply.senderID }
            if (mention.length != 0 && isNaN(content[0])) {
                var listAdd = [];

                for (const id of mention) {
                    ADMINBOT.push(id);
                    config.ADMINBOT.push(id);
                    listAdd.push(`→ UID: ${id}\n→ Tên ADMINBOT mới: ${event.mentions[id]}`);
                };

                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedNewAdmin", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
            }
            else if (content.length != 0 && !isNaN(content[0])) {
                ADMINBOT.push(content[0]);
                config.ADMINBOT.push(content[0]);
                const name = (await Users.getData(content[0])).name
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedNewAdmin", 1, ` ADMIN \n→ Tên ADMINBOT mới: ${name}`), threadID, messageID);
            }
            else return global.utils.throwError(this.config.name, threadID, messageID);
        }
        case "rm": {
            if (event.senderID != ADMINBOT[0]) return api.sendMessage(`Quyền hạn????`, event.threadID, event.messageID)
            if(event.type == "message_reply") { content[0] = event.messageReply.senderID }
            if (mentions.length != 0 && isNaN(content[0])) {
                const mention = Object.keys(mentions);
                var listAdd = [];

                for (const id of mention) {
                    const index = config.ADMINBOT.findIndex(item => item == id);
                    ADMINBOT.splice(index, 1);
                    config.ADMINBOT.splice(index, 1);
                    listAdd.push(` UID: ${id}\n→ ${event.mentions[id]}`);
                };

                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedAdmin", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
            }
            else if (content.length != 0 && !isNaN(content[0])) {
                const index = config.ADMINBOT.findIndex(item => item.toString() == content[0]);
                ADMINBOT.splice(index, 1);
                config.ADMINBOT.splice(index, 1);
                const name = (await Users.getData(content[0])).name
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedAdmin", 1, ` ${content[0]} → ${name}`), threadID, messageID);
            }
            else global.utils.throwError(this.config.name, threadID, messageID);
        }
      case "list": {
        const adminIDs = global.config.ADMINBOT;
        let msg = "[ Danh Sách Admin ]\n";
        for (let i = 0; i < adminIDs.length; i++) {
            const adminID = adminIDs[i];
            if (!adminID) {
                msg += `${i + 1}.Không có thông tin admin!\n▱▱▱▱▱▱▱▱▱▱▱▱▱\n`;
                continue;
            }
            const userInfo = await api.getUserInfo(adminID);
            const userName = userInfo[adminID].name;
            msg += `${i + 1}.admin: ${userName}\n`;
            msg += `‣link fb: https://www.facebook.com/${adminID}\n`;
            msg += `\n▱▱▱▱▱▱▱▱▱▱▱▱▱\n`;
        }
        msg += `[ ! ] - Nếu cần hỗ trợ hãy ib 1 trong số các admin hoặc sử dụng callad để được hỗ trợ!`

        api.sendMessage(msg || 'Không có thông tin admin.', event.threadID, event.messageID);
      }
    }
}
