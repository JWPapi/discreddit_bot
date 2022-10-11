const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, IntentsBitField, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const Debug = require('./Debug');
module.exports = class Bot {
	/**
	 * @type {Client}
	 */
	static client = null;
	static db = null;
	static commands = new Collection();
	static async setup() {
		const intents = new IntentsBitField();
		intents.add(IntentsBitField.Flags.GuildPresences, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.MessageContent);
		this.client = new Client({ intents });
		await this.setupDatabase();
		await this.setupCommands();
		await this.setupEvents();
		await this.registerCommands(false);
	}

	static async setupDatabase() {
		const lowdb = await import('lowdb');
		this.db = new lowdb.Low(new lowdb.JSONFile('database.db'));
		await this.db.read();
		this.db.data = this.db.data ?? {};
	}

	static getGuildValue(guildId, name) {
		if (!this.db.data[guildId]) { this.db.data[guildId] = { config: {}, members: {} }; }
		if (!this.db.data[guildId].config) { this.db.data[guildId].config = {}; }
		return this.db.data[guildId].config[name];
	}

	static async setGuildValue(guildId, name, value) {
		if (!this.db.data[guildId]) { this.db.data[guildId] = { config: {}, members: {} }; }
		if (!this.db.data[guildId].config) { this.db.data[guildId].config = {}; }
		this.db.data[guildId].config[name] = value;
		await this.db.write();
	}

	static async setupEvents() {
		const eventsPath = path.join(__dirname, '../Events');
		const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
		for (const file of eventFiles) {
			const filePath = path.join(eventsPath, file);
			const event = require(filePath);
			if (event.once) {
				Bot.client.once(event.name, (...args) => event.execute(...args, Bot));
			}
			else {
				Bot.client.on(event.name, (...args) => event.execute(...args, Bot));
			}
		}
	}
	static async setupCommands() {
		const commandsPath = path.join(__dirname, '../Commands');
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			this.commands.set(command.data.name, command);
		}
		this.client.once('ready', () => {
			console.log('Bot Started.');
		});
		this.client.on('interactionCreate', async interaction => {
			try {
				if (interaction.isChatInputCommand()) {
					const command = this.commands.get(interaction.commandName);
					if (!command) return;
					await command.execute(interaction, this);
				}
			}
			catch (error) {
				await Debug.log(error);
				await interaction.reply({ content: 'Something went wrong...', ephemeral: false });
			}
		});
	}

	static async registerCommands(force) {
		let exists = true;
		try {
			fs.statSync(path.join(__dirname, '../.ok'));
		}
		catch (err) {
			exists = false;
		}
		if (exists && !force) { return; }
		const commands = [];
		for (const command of this.commands) {
			commands.push(command[1].data.toJSON());
		}
		const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
		try {
			await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands });
			console.log('Successfully registered application commands.');
		}
		catch (err) {
			await Debug.log(err);
		}
		if (!exists) {
			fs.writeFileSync(path.join(__dirname, '../.ok'), '');
		}
	}
	static async start() {
		try {
			await this.client.login(process.env.DISCORD_TOKEN);
			await this.waitForReady();
		}
		catch (err) {
			await Debug.log(err);
			await Debug.restart();
		}
	}
	static async waitForReady() {
		return new Promise((resolve) => {
			(async function w() {
				if (module.exports.client.isReady()) return resolve();
				setTimeout(w, 100);
			})();
		});
	}

	static async registerEvent(name, fn, minutes, runOnRegister, th) {
		minutes = Number(minutes);
		if (isNaN(minutes) || minutes <= 0) { return; }
		setInterval(async () => {
			Debug.busyEvents[name] = true;
			await fn.call(th);
			Debug.busyEvents[name] = false;
		}, Math.max(minutes * 60 * 1000));
		if (runOnRegister) {
			Debug.busyEvents[name] = true;
			await fn.call(th);
			Debug.busyEvents[name] = false;
		}
	}
};
