let io;

const pInsts = {
    0: null,
    1: null,
    2: null,
    3: null,
};

let clientConnected = 0;

const registerIo = (ioObj) => {
    io = ioObj;
  
    io.on('connection', (socket) => {
        socket.on('connectClient', () => {
            console.log('client connected');
            clientConnected += 1;
            console.log('client count: ' + clientConnected);
            io.emit('clientConnected', pInsts, clientConnected);
        });
        socket.on('disconnectClient', () => {
            console.log('client disconnected');
            clientConnected -= 1;
            if (clientConnected < 0) {
                clientConnected = 0;
            }
            console.log('client count: ' + clientConnected);
            if (clientConnected <= 0) {
                for (let i = 0; i < Object.keys(pInsts).length; i++) {
                    pInsts[i] = null;
                }
            }
            io.emit('clientDisconnected', clientConnected);
        });
        socket.on('controls', (msg) => {
            if (clientConnected <= 0) {
                io.emit('noClients');
                return;
            };
            console.log('input received: ' + msg);
            io.emit('inputFromController', msg);
        });
        socket.on('connectPlayer', (msg) => {
            if (clientConnected <= 0) {
                io.emit('noClients');
                return;
            };
            if (pInsts[0] !== null && pInsts[1] !== null && pInsts[2] !== null && pInsts[3] !== null) {
                console.log('all players connected, cannot connect more players');
                io.emit('connectionRefused', msg);
                return;
            }
            console.log('player connected: ' + msg);
            io.emit('playerConnected', msg);
        });
        socket.on('disconnectPlayer', (id, msg) => {
            if (clientConnected <= 0) {
                io.emit('noClients');
                return;
            };
            console.log('player disconnected: ' + msg);
            pInsts[id] = null;
            io.emit('playerDisconnected', id, msg);
            io.emit('updatePlayerInstances', pInsts);
        });
        socket.on('validatePlayer', (id, msg) => {
            if (clientConnected <= 0) {
                io.emit('noClients');
                return;
            };
            console.log('player validated: ' + msg + ' (socket id: ' + id + ')');
            pInsts[msg] = id;
            io.emit('playerValidated', id, msg, pInsts);
            io.emit('updatePlayerInstances', pInsts);
        });
        socket.on("killPlayer", (id, msg) => {
            if (clientConnected <= 0) {
                io.emit('noClients');
                return;
            };
            console.log('player killed: ' + id);
            pInsts[id] = null;
            io.emit('playerKilled', id, msg);
            io.emit('updatePlayerInstances', pInsts);
        });
        socket.on('activateButtons', (id, msg) => {
            if (clientConnected <= 0) {
                io.emit('noClients');
                return;
            };
            io.emit('buttonsActivated', id, msg);
        })
        socket.on('activateButtonsUnconditional', () => {
            if (clientConnected <= 0) {
                io.emit('noClients');
                return;
            };
            io.emit('buttonsActivatedUnconditional');
        })
    });
};

module.exports = {
    registerIo,
};