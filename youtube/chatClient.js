const EventEmitter = require("node:events");
const logger = require("@ericw9079/logger");
const service = require('./service.js');
const { ChatEvent, ConnectStatus, ClientEvent } = require('./enums.js');

class ChatClient extends EventEmitter {
	#chatId;
	#nextPoll;
	#pageToken;
	#remainInChat = false;
	#userId;
	#name;
	#membershipGifts = {};
	
	constructor() {
		super();
	}
	
	get name() {
		return this.#name;
	}
	
	async #fetchId() {
		const { data: channels } = await service.channels.list({
			mine: true,
			part: 'id,snippet'
		});
		if (channels) {
			this.#userId = channels.items?.[0]?.id;
			this.#name = channels.items?.[0]?.snippet.title;
		}
		if (this.#userId && this.#name) {
			logger.log(`Connected to chat as ${this.#name}`);
		} else if (this.#userId) {
			logger.log(`Connected to chat as ${this.#userId} (name unknown)`);
		} else {
			logger.log('Connected to chat as an unknown user');
		}
	}
	
	async #fetchMessages() {
		if (!this.#chatId) {
			return null;
		}
		const reqOptions = {
			liveChatId: this.#chatId,
			part: "snippet,authorDetails"
		};
		if (this.#pageToken) {
			reqOptions.pageToken = this.#pageToken;
		}
		const { data: messageData } = await service.liveChatMessages.list(reqOptions);
		if (!messageData) {
			return null;
		}
		this.#pageToken = messageData.nextPageToken;
		
		return {
			pollingIntervalMillis: messageData.pollingIntervalMillis,
			messages: messageData.items ?? []
		};
	}
	
	async #processMessages() {
		const messageData = await this.#fetchMessages();
		if (!messageData) {
			this.remainInChat = false;
		} else {
			for (const message of messageData.messages) {
				const { snippet, authorDetails } = message;
				
				const authorName = authorDetails.displayName;
				const authorId = authorDetails.channelId;
				
				if (authorId == this.#userId) {
					// Skip messages sent by the bot
					continue;
				}
				
				const messageType = snippet.type;
				switch (messageType) {
					case ChatEvent.ChatEnded:
						this.#remainInChat = false;
						break;
					case ChatEvent.MessageDeleted:
						const { messageDeletedDetails: { deletedMessageId } } = snippet;
						if (this.#MembershipGifts[deletedMessageId]) {
							delete this.#MembershipGifts[deleteMessageId];
						}
						this.emit(ClientEvent.MessageDeleted, deletedMessageId, authorDetails, message);
						break;
					case ChatEvent.SponsorOnlyOff:
						this.emit(ClientEvent.SponsorOnlyOff, authorDetails, message);
						break;
					case ChatEvent.SponsorOnlyOn:
						this.emit(ClientEvent.SponsorOnlyOn, authorDetails, message);
						break;
					case ChatEvent.NewSponsor:
						const { newSponsorDetails: { memberLevelName, isUpgrade } } = snippet;
						this.emit(ClientEvent.NewSponsor, memberLevelName ?? '', isUpgrade, authorDetails, message);
						break;
					case ChatEvent.MemberMilestone:
						const { memberMilestoneChatDetails: { userComment, memberMonth, memberLevelName } } = snippet;
						this.emit(ClientEvent.MemberMilestone, userComment ?? '', memberMonth, memberLevelName ?? '', authorDetails, message);
						break;
					case ChatEvent.SuperChat:
						const { superChatDetails } = snippet;
						const { amountDisplayString: amount, userComment } = superChatDetails;
						this.emit(ClientEvent.SuperChat, userComment, amount, superChatDetails, authorDetails, message);
						break;
					case ChatEvent.SuperSticker:
						const { superStickerDetails } = snippet;
						const { superStickerMetadata: { altText }, amountDisplayString: amount } = superStickerDetails;
						this.emit(ClientEvent.SuperSticker, altText, amount, superStickerDetails, authorDetails, message);
						break;
					case ChatEvent.Chat:
						const { textMessageDetails: { messageText } } = snippet;
						logger.log(`Received Message: ${authorName}: ${messageText}`);
						this.emit(ClientEvent.Message, messageText, authorDetails, message);
						break;
					case ChatEvent.Tombstone:
						// Represents a delete message (no-op)
						break;
					case ChatEvent.UserBanned:
						const { userBannedDetails: { bannedUserDetails, banDurationSeconds } } = snippet;
						this.emit(ClientEvent.Ban, bannedUserDetails, banDurationSeconds, authorDetails, message);
						break;
					case ChatEvent.MembershipGift:
						// User gifted a membership for others
						const { membershipGiftingDetails: { giftMembershipsCount, giftMembershipsLevelName } } = snippet;
						const messageId = message.id;
						this.#membershipGifts[messageId] = {
							count: 0,
							totalCount: giftMembershipsCount,
							message
						};
						this.emit(ClientEvent.MembershipGift, giftMembershipsCount, giftMembershipsLevelName ?? '', authorDetails, message);
						break;
					case ChatEvent.GiftedMembership:
						const { giftMembershipReceivedDetails: { memberLevelName, associatedMembershipGiftingMessageId } } = snippet;
						this.#membershipGiftingDetails[associatedMembershipGiftingMessageId].count++;
						const giftingMessage = this.#membershipGiftingDetails[associatedMembershipGiftingMessageId];
						if (giftingMessage.count >= giftingMessage.totalCount) {
							// All gifted membership events accounted for, remove membership gifting message
							delete this.#MembershipGifts[associatedMembershipGiftingMessageId];
						}
						this.emit(ClientEvent.GiftedMembership, memberLevelName, giftingMessage, authorDetails, message);
						break;
					default:
						logger.log(`Unknown type: ${messageType}`);
						break;
				}
			}
		}
		if (this.#remainInChat) {
			this.#nextPoll = setTimeout(this.#processMessages.bind(this), messageData.pollingIntervalMillis);
		}
	}
	
	async send(message) {
		await service.liveChatMessages.insert({
			part: 'snippet',
			requestBody: {
				snippet: {
					liveChatId: this.#chatId,
					type: textMessageEvent,
					textMessageDetails: {
						messageText: message
					}
				}
			}
		});
	}
	
	async connect(videoId) {
		// Lookup the Chat Id for the video
		const { data:videos } = await service.videos.list({
			id: videoId,
			part: "liveStreamingDetails"
		});
		const video = videos?.items?.[0];
		if (!video) {
			return ConnectStatus.VideoNotFound;
		}
		const chatId = video?.liveStreamingDetails?.activeLiveChatId;
		if (!chatId) {
			return ConnectStatus.VideoNotLive;
		}
		if (chatId == this.#chatId) {
			return ConnectStatus.AlreadyConnected;
		}
		clearTimeout(this.#nextPoll);
		this.#chatId = chatId;
		
		await this.#fetchId();
		
		const messageData = await this.#fetchMessages();
		
		if (!messageData) {
			return ConnectStatus.NoLiveChat;
		}
		this.#remainInChat = true;
		
		this.#nextPoll = setTimeout(this.#processMessages.bind(this), messageData.pollingIntervalMillis);
		
		return ConnectStatus.Connected;
	}
	
	disconnect = () => {
		this.#remainInChat = false;
		clearTimeout(this.#nextPoll);
		this.#chatId = undefined;
	}
}

module.exports = ChatClient;