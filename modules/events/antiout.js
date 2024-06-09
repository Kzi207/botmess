module.exports.config = {
    name: "antiout",
    eventType: ["log:unsubscribe"],
    version: "0.0.1",
    credits: "DungUwU",
    description: "Listen events"
};

module.exports.run = async({ event, api, Threads, Users }) => {
    let data = (await Threads.getData(event.threadID)).data || {};
    if (!data.antiout) return;

    const leftParticipantFbId = event.logMessageData.leftParticipantFbId;
    const currentUserID = api.getCurrentUserID();

    if (leftParticipantFbId == currentUserID) return;

    const name = global.data.userName.get(leftParticipantFbId) || await Users.getNameUser(leftParticipantFbId);
    const type = (event.author == leftParticipantFbId) ? "tự rời" : "bị quản trị viên đuổi";

    if (type == "tự rời") {
        api.addUserToGroup(leftParticipantFbId, event.threadID, (error, info) => {
            if (error) {
                api.sendMessage(`Không thể thêm ${name} vào nhóm :( `, event.threadID)
            } else {
                api.sendMessage(`Đã thêm thành viên ${name} vừa rời vào lại nhóm`, event.threadID);
            }
        });
    }
}
