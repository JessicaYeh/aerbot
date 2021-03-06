/**
 * Construct a new Discord.Client with some added functionality
 * NEEDS TO BE CLEANED UP. NEEDS TO BE COMBINED WITH Client.js. BASED ON index.js FROM OLD AERBOT v1. BASED ON index.js FROM SOME TUTORIAL BOT.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
// @ts-ignore
const Client = require("./Client.js");
const Config = require("./config.json");
const CoreUtil = require("./utils/Util.js");
const mongoose = require('mongoose');
const HandleActivity = require("./HandleActivity");
require('./models/guild.js')();
require('./models/group.js')();
require('./models/user.js')();
const GuildModel = mongoose.model('Guild');
const UserModel = mongoose.model('User');
const GachaGameService = require("./services/GachaGameService");

// @ts-ignore
const client = new Client(require("../token.json"), __dirname + "/commands", GuildModel);

client.on("beforeLogin", () => {
	setInterval(doGuildIteration, Config.onlineIterationInterval);
});
client.on("message", message => {
	if (message.guild && message.member && !message.member.user.bot)
		UserModel.findById(message.member.id).exec()
        	.then(userData => HandleActivity(
				client,
				message.member.id, 
				message,
				false,
				userData || newUser(message.member.id, message.member.displayName)
			)
		);
});

client.on("messageReactionAdd", (messageReaction, user) => {
	CoreUtil.dateLog(`Reaction Added: ${messageReaction} - ${user.id}`);
	if (messageReaction && user && !user.bot)
		UserModel.findById(user.id).exec()
        	.then(userData => HandleActivity(
				client,
				user.id, 
				false,
				messageReaction,
				userData || newUser(message.member.id, message.member.displayName)
			)
		);
});

client.on("ready", () => {
	CoreUtil.dateLog('ready');
	var ggs = new GachaGameService();
	client.guilds.forEach(guild => {
		//CoreUtil.dateLog(guild);
		let doc = GuildModel.upsert({_id: guild.id})
	});
});

client.on("voiceStateUpdate", member => {

});

client.on("guildMemberAdd", (member) => {
	if(!member.user.bot) {
		CoreUtil.dateLog("Sending welcome message to " + member.user.username);
		//Need to make this a command or configuration
		member.send("Welcome to the Dauntless gaming server! Please read the `welcome-readme` channel at the top of our Discord server. It will explain everything you need to get started in Dauntless!");
		CoreUtil.dateLog("Sent welcome message to " + member.user.username);
		client.guildModel.findById(member.guild.id).exec().then(guild =>{
			CoreUtil.dateLog("Adding welcome role to " + member.user.username);
			CoreUtil.dateLog(guild.welcomeRole);
			member.addRole(guild.welcomeRole);
			CoreUtil.dateLog("Role added to " + member.user.username);
		});
	}
});

client.bootstrap();

function doGuildIteration() {
	CoreUtil.dateLog(`[Online Interval]`);
	client.guilds.forEach(guild => {
		//checkOnlineStatus(guild);
		guild.members.forEach(member =>{
			if(member.presence.status != "offline" && !member.user.bot) {
				CoreUtil.dateLog(`Updating ${member.displayName} - ${member.presence.status}`);
				UserModel.findById(member.id).exec()
				.then(userData => HandleActivity(
					client,
					member.id, 
					false,
					false,
					userData || newUser(member.id, member.displayName)
				));
			}
		});
	})
}

function checkOnlineStatus(guild) {
	//Need to move stuff from doGuildIteration into here
}

function newUser(uid, name) {
    CoreUtil.dateLog(`Creating ${uid} - ${name}`);
    return UserModel.create({ _id: uid, username: name });
}