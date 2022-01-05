// https://auth0.com/blog/authenticating-svelte-apps/
// Use this guide to add auth0 authentication
import createAuth0Client from '@auth0/auth0-spa-js';
import { user, isAuthenticated, popupOpen, token } from './store';
import config from './auth_config';

async function createClient() {
	return await createAuth0Client({
		domain: config.domain,
		client_id: config.clientId,
	});
}

async function loginWithPopup(client, options) {
	popupOpen.set(true);
	try {
		await client.loginWithPopup(options);

		user.set(await client.getUser());
		const accessToken = await client.getIdTokenClaims();
		token.set(accessToken.__raw);
		console.log(accessToken);
		isAuthenticated.set(true);
	} catch (e) {
		// eslint-disable-next-line
		console.error(e);
	} finally {
		popupOpen.set(false);
	}
}

function logout(client) {
	return client.logout();
}

const auth = {
	createClient,
	loginWithPopup,
	logout,
};

export default auth;
