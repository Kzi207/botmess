const fs = require('fs');
const ytdl = require('ytdl-core');
const { resolve } = require('path');
async function downloadMusicFromYoutube(link, path) {
  var timestart = Date.now();
  if(!link) return 'Thiếu link'
  var resolveFunc = function () { };
  var rejectFunc = function () { };
  var returnPromise = new Promise(function (resolve, reject) {
    resolveFunc = resolve;
    rejectFunc = reject;
  });
    ytdl(link, {
            filter: format =>
                format.quality == 'tiny' && format.audioBitrate == 128 && format.hasAudio == true
        }).pipe(fs.createWriteStream(path))
        .on("close", async () => {
            var data = await ytdl.getInfo(link)
            var result = {
                title: data.videoDetails.title,
                dur: Number(data.videoDetails.lengthSeconds),
                sub: data.videoDetails.author.subscriber_count,
                viewCount: data.videoDetails.viewCount,

                author: data.videoDetails.author.name,
                timestart: timestart
            }
            resolveFunc(result)
        })
  return returnPromise
}
module.exports.config = {
    name: "sing",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "D-Jukie",//mod by tkiendz
    description: "Phát nhạc thông qua link YouTube hoặc từ khoá tìm kiếm",
    commandCategory: "Tiện ích",
    usages: "[searchMusic]",
    cooldowns: 0
}

module.exports.handleReply = async function ({ api, event, handleReply, Users }) {
    const axios = require('axios')

   const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || D/MM/YYYY");
    var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
    if (thu == 'Sunday') thu = 'Chủ Nhật'
    if (thu == 'Monday') thu = 'Thứ Hai'
    if (thu == 'Tuesday') thu = 'Thứ Ba'
    if (thu == 'Wednesday') thu = 'Thứ Tư'
    if (thu == "Thursday") thu = 'Thứ Năm'
    if (thu == 'Friday') thu = 'Thứ Sáu'
    if (thu == 'Saturday') thu = 'Thứ Bảy'
    let name = await Users.getNameUser(event.senderID);


    const { createReadStream, unlinkSync, statSync } = require("fs-extra")
    try {
        var path = `${__dirname}/cache/sing-${event.senderID}.mp3`
        var data = await downloadMusicFromYoutube('https://www.youtube.com/watch?v=' + handleReply.link[event.body -1], path);
        if (fs.statSync(path).size > 26214400) return api.sendMessage('𝐁𝐚̀𝐢 𝐠𝐢̀ 𝐦𝐚̀ 𝐝𝐚̀𝐢 𝐝𝐮̛̃ 𝐯𝐚̣̂𝐲, đ𝐨̂̉𝐢 𝐛𝐚̀𝐢 đ𝐢 😠', event.threadID, () => fs.unlinkSync(path), event.messageID);
        api.unsendMessage(handleReply.messageID)
        return api.sendMessage({ 
body: `🎶===== [ 𝐀̂𝗠 𝗡𝗛𝗔̣𝗖 ] =====🎶\n━━━━━━━━━━━━━━━━━━\n🎼 𝗕𝗮̀𝗶 𝗵𝗮́𝘁: ${data.title} ( ${this.convertHMS(data.dur)} )`,
            attachment: fs.createReadStream(path)}, event.threadID, ()=> fs.unlinkSync(path), 
         event.messageID)

    }
    catch (e) { return console.log(e) }
}
module.exports.convertHMS = function(value) {
    const sec = parseInt(value, 10); 
    let hours   = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60); 
    let seconds = sec - (hours * 3600) - (minutes * 60); 
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return (hours != '00' ? hours +':': '') + minutes+':'+seconds;
}
module.exports.run = async function ({ api, event, args, Users}) {
  let axios = require('axios');

  const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || D/MM/YYYY");
    var thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
    if (thu == 'Sunday') thu = 'Chủ Nhật'
    if (thu == 'Monday') thu = 'Thứ Hai'
    if (thu == 'Tuesday') thu = 'Thứ Ba'
    if (thu == 'Wednesday') thu = 'Thứ Tư'
    if (thu == "Thursday") thu = 'Thứ Năm'
    if (thu == 'Friday') thu = 'Thứ Sáu'
    if (thu == 'Saturday') thu = 'Thứ Bảy'
    let name = await Users.getNameUser(event.senderID);
    if (args.length == 0 || !args) return api.sendMessage('𝗣𝗵𝗮̂̀𝗻 𝘁𝗶̀𝗺 𝗸𝗶𝗲̂́𝗺 𝗸𝗵𝗼̂𝗻𝗴 đ𝘂̛𝗼̛̣𝗰 đ𝗲̂̉ 𝘁𝗿𝗼̂́𝗻𝗴!', event.threadID, event.messageID);
    const keywordSearch = args.join(" ");
    var path = `${__dirname}/cache/sing-${event.senderID}.mp3`
    if (fs.existsSync(path)) { 
        fs.unlinkSync(path)
    }
    if (args.join(" ").indexOf("https://") == 0) { 
        try {
            return api.sendMessage({ 
                body: `có cc`}, event.threadID, ()=> fs.unlinkSync(path), 
            event.messageID)       
        }
        catch (e) { return console.log(e) }
    } else {
          try {
            var link = [],
                msg = "",
                num = 0
            const Youtube = require('youtube-search-api');
            var data = (await Youtube.GetListByKeyword(keywordSearch, false,6)).items;
            for (let value of data) {
              link.push(value.id);
              num = num+=1
              msg += (`${num} - ${value.title}\n[⏰] 𝗧𝗶𝗺𝗲:${value.length.simpleText}\n[📻] 𝗞𝗲̂𝗻𝗵: ${value.channelTitle}\n━━━━━━━━━━━━━━━━━━\n`);
            }
            var body = `🔎===== [ 𝗦𝗜𝗡𝗚 𝗦𝗘𝗔𝗥𝗖𝗛 ] =====🔍\n━━━━━━━━━━━━━━━━━━\n➝ 𝗖𝗼́ ${link.length} 𝗸𝗲̂́𝘁 𝗾𝘂𝗮̉ 𝘁𝗿𝘂̀𝗻𝗴 𝘃𝗼̛́𝗶 𝘁𝘂̛̀ 𝗸𝗵𝗼𝗮́ 𝘁𝗶̀𝗺 𝗸𝗶𝗲̂́𝗺 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻:\n━━━━━━━━━━━━━━━━━━\n${msg}➝ 𝗛𝗮̃𝘆 𝗿𝗲𝗽𝗹𝘆(𝗽𝗵𝗮̉𝗻 𝗵𝗼̂̀𝗶) 𝗰𝗵𝗼̣𝗻 𝗺𝗼̣̂𝘁 𝘁𝗿𝗼𝗻𝗴 𝗻𝗵𝘂̛̃𝗻𝗴 𝘁𝗶̀𝗺 𝗸𝗶𝗲̂́𝗺 𝘁𝗿𝗲̂𝗻`
            return api.sendMessage({
              body: body
            }, event.threadID, (error, info) => global.client.handleReply.push({
              type: 'reply',
              name: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              link
            }), event.messageID);
          } catch(e) {
            return api.sendMessage('Đã xảy ra lỗi, vui lòng thử lại trong giây lát!!\n' + e, event.threadID, event.messageID);
        } // đêm qua em tuyệt lắm
    } // thần la thiên đinhhh
      } // cục xì lầu ông bê lăc