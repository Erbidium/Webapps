import { writable } from 'svelte/store';

export const isAuthenticated = writable(false);
export const popupOpen = writable(false);
export const error = writable();
export const token = writable('');
export const offline = writable(false);
export const popUpMessage = writable('');
