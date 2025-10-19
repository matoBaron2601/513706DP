import { writable } from 'svelte/store';

export const userDataStore = writable({
    userId: '',
    userEmail: '',
    userName: '',
    profilePicture: ''
});
