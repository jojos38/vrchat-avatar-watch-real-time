const { Client, Server } = require('node-osc');

class WatchOSC {
	// VRChat sending port and IP
	#VRCHAT_PORT = 9000;
	#VRCHAT_HOST = '127.0.0.1';
	
	// OSC data receiving port and IP
	#THIS_PORT = 9001;
	#THIS_HOST = '0.0.0.0';
	
	// IO
	#client;
	#server;
	
	// OSC stuff
	#avatarId = 'avtr_bd2046ff-5206-44df-8bc1-1ed5e408ef64';
	#hoursPath = '/avatar/parameters/HandWatchHours';
	#minutesPath = '/avatar/parameters/HandWatchMinutes';
	
	// Auto shutdown
	#shutdownCheckTimer = 1000; // 1 second
	#stopSendingDataAfter = 3 * 60 * 1000; // 10 minutes
	#lastReceivedData = 0;
	#sendData = true;

	// Time
	// VRChat uses 8 bits tinyfloat (also called minifloat).
	// They go from -1 to 1. The first bit is used for the sign (- or +) and the 7 remaining bits are used for the decimals.
	// This leads to 256 total values and 127 values from 0 to 1. Each values increment is 0.0078125, hence the below multiplier.
	// For example, if I send MULTIPLIER * 14, the shader will receive very precisely 0.109375. It can then divide that number by
	// 0.0078125 to obtain 14 back.
	static #MULTIPLIER = 0.0078125;
	#lastHours;
	#lastMinutes;

	/**
	 * Opens server and prepare client
	 */
	constructor() {
		this.#reset();
		this.#client = new Client(this.#VRCHAT_HOST, this.#VRCHAT_PORT);
		this.#server = new Server(this.#THIS_PORT, this.#THIS_HOST, this.#onServerReady.bind(this));
		this.#server.on('message', this.#onMessageReceive.bind(this));
		setInterval(this.#sendTime.bind(this), 1000);
		setInterval(this.#checkShutdown.bind(this), this.#shutdownCheckTimer);
	}

	/**
	 * Resets minutes and hours effectively re-sending them
	 */
	#reset() {
		this.#lastHours = -1;
		this.#lastMinutes = -1;
	}

	/**
	 * Checks every x if a data was received from VRChat, if no data was received for more than 3 minutes
	 * We stop sending time packets because the game is likely not running anymore.
	 *
	 * Note: We do receive our own messages so SendTime() acts as a ping
	 */
	#checkShutdown() {
		this.#lastReceivedData += this.#shutdownCheckTimer;
		if (this.#lastReceivedData > this.#stopSendingDataAfter && this.#sendData) {
			console.log('No data received for 10 seconds, stopping data sending');
			this.#sendData = false;
		}
		else if (this.#lastReceivedData < this.#stopSendingDataAfter && !this.#sendData) {
			console.log('Data received, starting data sending');
			this.#sendData = true;
		}
	}

	/**
	 * Called when the OSC server is ready to receive data
	 */
	#onServerReady() {
		console.log('OSC server ready and listening on ' + this.#THIS_HOST + ':' + this.#THIS_PORT);
	}

	/**
	 * Called when VRChat sends a message
	 * @param {array.<String>} message The message sent from VRChat
	 */
	#onMessageReceive(message) {
		const path = message[0];
		const data = message[1];
		if (path === '/avatar/change' && data === this.#avatarId) {
			console.log('Avatar was loaded, re-sending watch time');
			this.#reset();
		}

		this.#lastReceivedData = 0;
	}

	/**
	 * Sends the hours and the minutes to the watch in VRChat using OSC
	 * This function is called regularly but only sends data when there was a change
	 */
	#sendTime() {
		if (!this.#sendData) return;

		const currentTime = new Date();
		const hours = currentTime.getHours();
		const minutes = currentTime.getMinutes();

		// Check if hours needs to be sent
		if (hours !== this.#lastHours) {
			let floatValue = hours * WatchOSC.#MULTIPLIER;
			if (floatValue <= 0.001) floatValue = 0.001; // VRChat considers 0 as an int and refuses it, this is a workaround
			this.#client.send(this.#hoursPath, floatValue);
			console.log('Hours set to ' + hours.toString().padStart(2, '0'));
		}

		// Check if minutes needs to be sent
		if (minutes !== this.#lastMinutes) {
			let floatValue = minutes * WatchOSC.#MULTIPLIER;
			if (floatValue <= 0.001) floatValue = 0.001; // VRChat considers 0 as an int and refuses it, this is a workaround
			this.#client.send(this.#minutesPath, floatValue);
			console.log('Minutes set to ' + minutes.toString().padStart(2, '0'));
		}

		this.#lastHours = hours;
		this.#lastMinutes = minutes;
	}
}

WatchOSC = new WatchOSC();
