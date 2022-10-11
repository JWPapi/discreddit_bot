const shell = require('shelljs');

module.exports = class Debug {
	static busyEvents = {};
	static closeEvents = [];

	static async installDependencies() {
		if (process.env.RAILWAY_ENVIRONMENT && shell.exec('ldconfig -p | grep libnss3', { silent: true }).stdout.length == 0) {
			shell.exec('sudo sh /tmp/apt-install-chrome-dependencies.sh', { silent: true });
		}
	}

	static async log(err) {
		console.log(err);
	}

	static async restart(errorEvent) {
		if (errorEvent) {
			Debug.busyEvents[errorEvent] = false;
		}
		await this.checkBusy();
		for (const obj of this.closeEvents) {
			try {
				await obj.fn.call(obj.th);
			}
			// eslint-disable-next-line no-empty
			catch (err) { }
		}
		console.log('Restarting...');
		process.exit();
	}

	static async registerCloseEvent(fn, th) {
		this.closeEvents.push({
			fn, th,
		});
	}

	static async checkBusy() {
		//TODO: WAIT UNTIL ALL EVENTS ARE IDLE
		return true;
	}
};