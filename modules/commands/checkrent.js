module.exports.config = {
  name: "checkrent",
  version: "1.0.1",
  hasPermssion: 0,
  Rent: 1,
  credits: "Vtuan",
  description: "Hướng dẫn cho người mới",
  commandCategory: "Admin-Hệ Thống",
  usages: "[Tên module]",
  cooldowns: 5
};


module.exports.run = function({ api, event, args }) {
  const { commands } = global.client;
  const { threadID, messageID } = event;
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};

  const checkRent = parseInt(args[0]);

  let filteredCommands;
  let msg = "";

  if (checkRent === 1) {
    filteredCommands = Array.from(commands.values()).filter(command => command.config.Rent === 1);
  } else if (checkRent === 2) {
    filteredCommands = Array.from(commands.values()).filter(command => command.config.Rent === 2);
  } else {
    const rent1Commands = Array.from(commands.values()).filter(command => command.config.Rent === 1);
    if (rent1Commands.length > 0) {
      msg += `🔰 Các lệnh có thuộc tính Rent bằng 1 🔰\n`;
      rent1Commands.forEach(command => {
        msg += `${command.config.name} , `;
      });
    }

    const rent2Commands = Array.from(commands.values()).filter(command => command.config.Rent === 2);
    if (rent2Commands.length > 0) {
      msg += `\n\n🔰 Các lệnh có thuộc tính Rent bằng 2 🔰\n`;
      rent2Commands.forEach(command => {
        msg += `${command.config.name} , `;
      });
      
    }

    const nonRentCommands = Array.from(commands.values()).filter(command => !command.config.Rent);
    if (nonRentCommands.length > 0) {
      msg += `\n🔰 Các lệnh không có thuộc tính Rent 🔰\n`;
      nonRentCommands.forEach(command => {
        msg += `${command.config.name}\n`;
      });
     
    }

    const totalRent1Commands = rent1Commands.length;
    const totalRent2Commands = rent2Commands.length;
    msg += `\n🔰 Tổng số lệnh có thuộc tính Rent bằng 1: ${totalRent1Commands}\n`;
    msg += `🔰 Tổng số lệnh có thuộc tính Rent bằng 2: ${totalRent2Commands}\n`;
    msg += `Tổng: ${totalRent1Commands + totalRent2Commands}`
  }

  if (msg === "") {
    msg = "Không có lệnh nào phù hợp.";
  }

  return api.sendMessage(msg, threadID, messageID);
}



