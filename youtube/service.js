/**
 * All in one module for handling authentication with the youtube API.
 * Provides an authentication server should users need to login to grant access
 * This module exports an authenticated youtube API service, but does not check if the actual authentication is valid
 * © ericw9079 2024
 */

const { readFileSync, writeFileSync, existsSync } = require('fs');
const youtube = require('@googleapis/youtube');
const OAuth2 = youtube.auth.OAuth2;
const express = require('express');
const app = express();

const SCOPES = ['https://www.googleapis.com/auth/youtube'];
const TOKEN_PATH = 'token.json';

let oauth2Client;

const getAuthClient = () => {
	if (!oauth2Client) {
		// Load client secrets from a local file.
		const data = readFileSync('client_secret.json');
		const credentials = JSON.parse(data);
		const clientSecret = credentials.web.client_secret;
		const clientId = credentials.web.client_id;
		const redirectUrl = credentials.web.redirect_uris[0];
		oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
		if (existsSync(TOKEN_PATH)) {
			const tokenData = readFileSync(TOKEN_PATH);
			const tokens = JSON.parse(tokenData);
			oauth2Client.setCredentials(tokens);
		}
	}
	return oauth2Client;
};

const authorize = (req, res) => {
	const oauth2Client = getAuthClient();

    const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  return res.redirect(301, authUrl);
};

const getTokens = async (req, res) => {
	if (!req?.query?.code || req?.query?.error) {
		return res.redirect(301, 'unauthorized');
	}
	const code = req.query.code;
	const oauth2Client = getAuthClient()
	const { tokens } = await oauth2Client.getToken(code);
	writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
	oauth2Client.setCredentials(tokens);
	return res.redirect(301, 'authorized');
};

app.get('/login', authorize);
app.get('/auth', getTokens);
app.get('/unauthorized', (req, res) => {
	res.status(200).send("Error authorizing PuzzleDeck");
});
app.get('/authorized', (req, res) => {
	res.status(200).send("Authorization successful, you can close this tab");
});

// Start a server to handle any necessary authentication
app.listen(3200, () => {
	console.log("Auth server listening on port 3200");
});

// Export an authenticated api service
module.exports = youtube.youtube({
	version: 'v3',
	auth: getAuthClient()
});