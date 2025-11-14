import { io } from 'socket.io-client';

const URL = 'https://final-project-2-appdevt.onrender.com';
export const socket = io(URL, {
    autoConnect: false
});