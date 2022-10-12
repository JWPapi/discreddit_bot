const { SlashCommandBuilder } = require('discord.js');
const Debug = require('../Modules/Debug');
const Reddit = require('../Modules/Reddit');
module.exports = {
	data: new SlashCommandBuilder()
		.setDefaultMemberPermissions(2048)
		.setDMPermission(false)
		.setName('verify')
		.setDescription('Verify your Reddit username.')
		.addStringOption(option =>
			option.setName('reddit_username')
				.setDescription('The Reddit username to be verified.')
				.setRequired(true)),

	/** @param {Interaction} interaction*/
	async execute(interaction) {
		const reddit_username = interaction.options.getString('reddit_username');
		try {
			await Reddit.startVerification(reddit_username, interaction);
		}
		catch (err) {
			await Debug.log(err);
			await interaction.reply({ content: 'Sorry. Something went wrong with that request. Please try again.', ephemeral: false });
		}
	},
};
