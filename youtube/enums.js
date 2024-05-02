const ChatEvent = {
	ChatEnded: 'chatEndedEvent',
	MessageDeleted: 'messageDeletedEvent',
	SponsorOnlyOff: 'sponsorOnlyModeEndedEvent',
	SponsorOnlyOn: 'sponsorOnlyModeStartedEvent',
	NewSponsor: 'newSponsorEvent',
	MemberMilestone: 'memberMilestoneChatEvent',
	SuperChat: 'superChatEvent',
	SuperSticker: 'superStickerEvent',
	Chat: 'textMessageEvent',
	Tombstone: 'tombstone', // Represents a delete message (no-op)
	UserBanned: 'userBannedEvent',
	MembershipGift: 'membershipGiftingEvent', // User gifted a membership for others
	GiftedMembership: 'giftMembershipReceivedEvent' // User recived a gifted membership
};

const ConnectStatus = {
	AlreadyConnected: -1,
	Connected: 0,
	VideoNotFound: 1,
	VideoNotLive: 2,
	NoLiveChat: 3
};

const ClientEvent = {
	MessageDeleted: 'delete',
	SponsorOnlyOff: 'sponsoroff',
	SponsorOnlyOn: 'sponsoron',
	NewSponsor: 'sponsor',
	MemberMilestone: 'milestone',
	SuperChat: 'superchat',
	SuperSticker: 'supersticker',
	Message: 'message',
	Ban: 'ban',
	MembershipGift: 'membershipgift',
	GiftedMembership: 'membershipgifted'
}

module.exports = {
	ChatEvent,
	ConnectStatus,
	ClientEvent
};