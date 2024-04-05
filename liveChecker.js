const EventEmitter = require("node:events");
const api = require('@ericw9079/twitch-api');
const logger = require("@ericw9079/logger");

const DELAY = 60000; // Time between Twitch fetches, in milliseconds
const MIN_CHANGE_COUNT = 3; // Must be consistently different from the previous state for this amount
const CHANGE_COUNT_RESET = 0;
const RETRY_NORMAL = 1;
const RETRY_MAXED = 10;

class LiveChecker extends EventEmitter {
	init = () => {
		getLive();
	}

	cancel = () => {
		if (interval) {
			clearInterval(interval);
		}
		interval = undefined;
	}
}

const liveChecker = new LiveChecker();

let isLive = false;
let interval;
let channelId;
let changeCount = CHANGE_COUNT_RESET;
let retryCount = 1;

const getID = async () => {
	const channel = process.env.CHANNEL;
	if (!channel) {
		throw new Error("Missing CHANNEL Env variable");
	}
	channelId = undefined;
	const { data } = await api.get(`search/channels?query=${channel}&first=1`);
	if(data?.data[0] && data.data[0].broadcaster_login == channel.toLowerCase() && data.data[0].id){
		channelId = data.data[0].id;
	}
	if (!channelId) {
		throw new Error("Failed to fetch Id");
	}
}

const checkLive = async () => {
	if (!channelId) {
		await getID();
	}
	const { data } = await api.get(`streams?user_id=${channelId}&first=1`);
	if(!data?.data[0]){
		data.data[0] = {type:""};
	}
	const newLive = data.data[0].type == "live" ? true : false;
	if(isLive == true && newLive == false) {
		changeCount++;
		if (changeCount >= MIN_CHANGE_COUNT) {
			isLive = newLive;
			changeCount = CHANGE_COUNT_RESET;
			liveChecker.emit('offline');
			logger.log("Offline change detected");
		}
	}
	else if(isLive == false && newLive == true) {
		changeCount++;
		if (changeCount >= MIN_CHANGE_COUNT) {
			isLive = newLive;
			changeCount = CHANGE_COUNT_RESET;
			liveChecker.emit('online');
			logger.log("Online change detected");
		}
	} else {
		changeCount = CHANGE_COUNT_RESET;
	}
}

const getLive = async () => {
  try{
    await checkLive();
    retryCount = RETRY_NORMAL;
  }
  catch (e){
    logger.error(`Twitch ran into a problem\n${e}`);
    if(retryCount < RETRY_MAXED){
      retryCount++;
    }
  }
  interval = setTimeout(getLive,DELAY*retryCount);
}

module.exports = liveChecker;