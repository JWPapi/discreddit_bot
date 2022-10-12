module.exports = class Debug {
	static busyEvents = {};

	static async log(err) {
		console.log(err);
	}

	static async restart() {
		console.log('u/discreddit_bot is restarting...');
		process.exit(2);
	}
};
