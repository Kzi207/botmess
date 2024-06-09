const fs = require("fs-extra");
const axios = require("axios");
const path = require('path');

module.exports.config = {
    name: "boximage",
    version: "1.0.2",
    hasPermission: 1,
    credits: "Vtuan",
    Rent: 2,
    description: "",
    commandCategory: "Quản Trị Viên",
    usages: "reply ảnh để đổi",
    cooldowns: 2
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID } = event;

    if (event.type !== "message_reply") return api.sendMessage("➜ Bạn phải reply một ảnh nào đó", threadID, messageID);
    if (!event.messageReply.attachments || event.messageReply.attachments.length === 0) return api.sendMessage("➜ Bạn phải reply một ảnh nào đó", threadID, messageID);
    if (event.messageReply.attachments.length > 1) return api.sendMessage("➜ Bạn chỉ được phép reply một ảnh", threadID, messageID);

    const imageLink = event.messageReply.attachments[0].url;
    const imagePath = path.resolve(__dirname, `./../../Data_Vtuan/data/antiImages/${threadID}.jpg`);

    try {
        const response = await axios({
            method: 'GET',
            url: imageLink,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            api.changeGroupImage(fs.createReadStream(imagePath), threadID, () => {
               // fs.unlinkSync(imagePath); // Xoá ảnh sau khi đã thay đổi ảnh nhóm
            });
        });

        writer.on('error', (err) => {
            console.error("Có lỗi xảy ra khi tải ảnh:", err);
        });
    } catch (error) {
        console.error("Có lỗi xảy ra:", error);
        api.sendMessage("➜ Đã có lỗi xảy ra khi thực hiện thay đổi ảnh nhóm.", threadID, messageID);
    }
};
