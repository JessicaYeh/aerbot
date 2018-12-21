const CoreUtil = require("./utils/Util.js");
const MemberUtil = require("./utils/MemberUtil.js");

function handleActivity(client, id, message, reaction, userData, lottery) {
    if (userData && id !== client.user.id) {
		let date = new Date();

		newUserData = {
			last_online: date,
			last_active: date
		};

		//handle exp
		var exp = userData.exp;

		//give activity points
		userData.activity_points++;
		exp = MemberUtil.calculateNewExp("activity", exp);

		if(message) {
			newUserData.last_message = date;
			userData.messages++;
			exp = MemberUtil.calculateNewExp("message", exp);

			//Fix username
			if(message.member.displayName) {
				if(message.member.displayName !== userData.username) {
					newUserData.username = message.member.displayName;
				}
			}
		}

		if(reaction) {
			newUserData.last_reaction = date;
			userData.reactions++;
			exp = MemberUtil.calculateNewExp("reaction", exp);
		}

		newUserData.exp = exp;
		newUserData.level = calculateLevel(exp);

		//CoreUtil.dateLog(`Registering Activity ${id} - ${newUserData}`);

		Object.assign(userData, newUserData);

        userData.save();
	}
}

function calculateLevel(exp) {
	//CoreUtil.dateLog(`New Level: ${Math.round(0.25 * Math.sqrt(exp))} | Exp: ${exp} | Sqrt(exp): ${Math.sqrt(exp)}`);
	return Math.max(1,Math.round(0.25 * Math.sqrt(exp)));
}

module.exports = handleActivity;