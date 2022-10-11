const { SlashCommandBuilder } = require('discord.js');
const Debug = require('../Modules/Debug');
const Reddit = require('../Modules/Reddit');
module.exports = {
	data: new SlashCommandBuilder()
		.setDefaultMemberPermissions(2048)
		.setDMPermission(false)
		.setName('verify')
		.setDescription('Start the verification process. To access this server, you must verify a Reddit account.')
		.addStringOption(option =>
			option.setName('reddit_username')
				.setDescription('Your Reddit username to be verified.')
				.setRequired(true)),

	/** @param {Interaction} interaction*/
	async execute(interaction) {
		const reddit_username = interaction.options.getString('reddit_username');
		try {
			await Reddit.startVerification(reddit_username, interaction);
		}
		catch (err) {
			await Debug.log(err);
			await interaction.reply({ content: 'Something went wrong...', ephemeral: false });
		}
	},
};
