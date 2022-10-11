module.exports = class Debug {
	static busyEvents = {};

	static async log(err) {
		console.log(err);
	}

	static async restart() {
		console.log('Restarting...');
		process.exit(2);
	}
};