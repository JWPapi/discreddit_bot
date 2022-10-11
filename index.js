require('dotenv').config();
const Bot = require('./Modules/Bot');
const Debug = require('./Modules/Debug');
const Reddit = require('./Modules/Reddit');

(async function() {

	process.on('uncaughtException', async function(err) {
		await Debug.log(err);
		await Debug.restart();
	});

	await Bot.setup();
	await Reddit.setup();
	await Bot.start();
	await Bot.registerEvent('VerificationLoop', Reddit.verificationLoop, 5 / 60, true, Reddit);
})();
