const { GuildMember } = require('discord.js');
const Debug = require('../Modules/Debug');

module.exports = {
	name: 'guildMemberAdd',
	/** @param {GuildMember} member*/
	async execute(member) {
		try {
			if (process.env.UNVERIFIED_ROLE) {
				const guild = await member.guild.fetch();
				const role = (await guild.roles.fetch()).find((r) => { return r.name == process.env.UNVERIFIED_ROLE; });
				if (role) {
					await guild.members.addRole({ user: member, role: role });
				}
			}
		}
		catch (err) {
			await Debug.log(err);
		}
	},
};