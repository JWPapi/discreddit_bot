const { SlashCommandBuilder, Interaction } = require('discord.js');
const Bot = require('../Modules/Bot');
const Debug = require('../Modules/Debug');

module.exports = {
	data: new SlashCommandBuilder()
		.setDefaultMemberPermissions(16)
		.setDMPermission(false)
		.setName('setchannel')
		.setDescription('Set the channel to use for verification confirmation messages.')
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('The channel where verification confirmation messages are sent.')
				.setRequired(true)),

	/** @param {Interaction} interaction*/
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel') ?? interaction.channel;
		try {
			await Bot.setGuildValue(interaction.guildId, 'verificationChannelId', channel.id);
			await interaction.reply({ content: `${channel.name} has been set as the channel for verification confirmation messages.`, ephemeral: false });
		}
		catch (err) {
			await Debug.log(err);
			await interaction.reply({ content: 'Something went wrong...', ephemeral: false });
		}
	},
};
