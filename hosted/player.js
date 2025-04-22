const socket = io();

let playerId;

let playerInstances = {
    0: null,
    1: null,
    2: null,
    3: null,
};

const emitControl = (ctrl) => {
    socket.emit('controls', ctrl);
    const dodgeButton = document.getElementById('dodge');
    dodgeButton.classList.add('disabled');
    for (let i = 0; i < Object.keys(playerInstances).length; i++) {
        const player = document.getElementById(`p${i + 1}Shoot`);
        player.classList.add('disabled');
    }
}

socket.on('buttonsActivated', (id, msg) => {
    if (playerId === id) {
        console.log('match found')
        const dodgeButton = document.getElementById('dodge');
        dodgeButton.classList.remove('disabled');
        for (let i = 0; i < Object.keys(playerInstances).length; i++) {
            const player = document.getElementById(`p${i + 1}Shoot`);
            player.classList.remove('disabled');
        }
    }
})

socket.on('buttonsActivatedUnconditional', () => {
    const dodgeButton = document.getElementById('dodge');
    dodgeButton.classList.remove('disabled');
    for (let i = 0; i < Object.keys(playerInstances).length; i++) {
        const player = document.getElementById(`p${i + 1}Shoot`);
        player.classList.remove('disabled');
    }
})

socket.on('clientConnected', (pInsts, cCount) => {
    playerInstances = pInsts;
    const noClients = document.getElementById('noClients');
    if (noClients.classList.contains('visible')) {
        noClients.classList.remove('visible');
        noClients.classList.add('hidden');
    }
    const dodgeButton = document.getElementById('dodge');
    dodgeButton.classList.remove('hidden');
    dodgeButton.classList.add('visible');
    for (let i = 0; i < Object.keys(playerInstances).length; i++) {
        const player = document.getElementById(`p${i + 1}Shoot`);
        player.classList.remove('visible');
        player.classList.add('hidden');
        if (player && i !== playerId && playerInstances[i] !== null) {
            player.classList.remove('hidden');
            player.classList.add('visible');
        }
    }
})

socket.on('clientDisconnected', (cCount) => {
    const noClients = document.getElementById('noClients');
    if (noClients.classList.contains('hidden') && cCount <= 0) {
        noClients.classList.remove('hidden');
        noClients.classList.add('visible');
        const dodgeButton = document.getElementById('dodge');
        dodgeButton.classList.remove('visible');
        dodgeButton.classList.add('hidden');
        for (let i = 0; i < Object.keys(playerInstances).length; i++) {
            const player = document.getElementById(`p${i + 1}Shoot`);
            player.classList.remove('visible');
            player.classList.add('hidden');
        }
        document.body.classList.remove('p1', 'p2', 'p3', 'p4');
        socket.close();
    }
})

socket.on("noClients", () => {
    const noClients = document.getElementById('noClients');
    if (noClients.classList.contains('hidden')) {
        noClients.classList.remove('hidden');
        noClients.classList.add('visible');
    }
    const dodgeButton = document.getElementById('dodge');
    dodgeButton.classList.remove('visible');
    dodgeButton.classList.add('hidden');
    for (let i = 0; i < Object.keys(playerInstances).length; i++) {
        const player = document.getElementById(`p${i + 1}Shoot`);
        player.classList.remove('visible');
        player.classList.add('hidden');
    }
    document.body.classList.remove('p1', 'p2', 'p3', 'p4');
    socket.close();
})

socket.on("connectionRefused", (msg) => {
    if (socket.id === msg) {
        const noSpace = document.getElementById('noSpace');
        if (noSpace.classList.contains('hidden')) {
            noSpace.classList.remove('hidden');
            noSpace.classList.add('visible');
        }
        socket.close();
    }
})

const emitConnect = () => {
    socket.emit('connectPlayer', socket.id);
}

const emitDisconnect = () => {
    socket.emit('disconnectPlayer', playerId, socket.id);
}

const setupButton = (elementId, ctrlIdentifier) => {
    const element = document.getElementById(elementId);

    element.addEventListener('mousedown', () => {
        if (element.classList.contains('disabled')) return;
        emitControl(`${ctrlIdentifier}`)
    });

    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (element.classList.contains('disabled')) return;
        emitControl(`${ctrlIdentifier}`);
    });
};

const init = () => {
    setTimeout(emitConnect, 1000)
}

socket.on('playerKilled', (id, msg) => {
    console.log(`Player ${id} killed (socket id: ${msg})`);
    if (playerId === id) {
        console.log('match found')
        const dodgeButton = document.getElementById('dodge');
        dodgeButton.classList.remove('visible');
        dodgeButton.classList.add('hidden');
        for (let i = 0; i < Object.keys(playerInstances).length; i++) {
            const player = document.getElementById(`p${i + 1}Shoot`);
            player.classList.remove('visible');
            player.classList.add('hidden');
        }
        document.body.classList.remove('p1', 'p2', 'p3', 'p4');
        const killScreen = document.getElementById('killScreen');
        killScreen.classList.remove('hidden');
        killScreen.classList.add('visible');
        socket.close();
        const bweew = new Howl({
            src: ['./sound/player_death.wav'],
            volume: 0.25,
        })

        const laugh = new Howl({
            src: ['./sound/player_death_laugh.wav'],
            volume: 0.25,
            loop: true,
        })

        laugh.play()

        bweew.play()
    }
    else {
        const dodgeButton = document.getElementById('dodge');
        dodgeButton.classList.add('disabled');
        for (let i = 0; i < Object.keys(playerInstances).length; i++) {
            const player = document.getElementById(`p${i + 1}Shoot`);
            player.classList.add('disabled');
        }
    }
})

socket.on('playerValidated', (id, msg, pInsts) => {
    if (id === socket.id) {
        playerId = msg;
        let color;
        switch (playerId) {
            case 0:
                color = 'p1';
                break;
            case 1:
                color = 'p2';
                break;
            case 2:
                color = 'p3';
                break;
            case 3:
                color = 'p4';
                break;
            default:
                color = 'oops';
        }
        document.body.classList.add(color);
        setupButton('p1Shoot', `p${playerId + 1}-p1`);
        setupButton('p2Shoot', `p${playerId + 1}-p2`);
        setupButton('p3Shoot', `p${playerId + 1}-p3`);
        setupButton('p4Shoot', `p${playerId + 1}-p4`);
        setupButton('dodge', `p${playerId + 1}-dodge`);
        playerInstances = pInsts
        const dodgeButton = document.getElementById('dodge');
        dodgeButton.classList.remove('hidden');
        dodgeButton.classList.add('visible');
        for (let i = 0; i < Object.keys(playerInstances).length; i++) {
            const player = document.getElementById(`p${i + 1}Shoot`);
            player.classList.remove('visible');
            player.classList.add('hidden');
            if (player && i !== playerId && playerInstances[i] !== null) {
                player.classList.remove('hidden');
                player.classList.add('visible');
            }
        }
        console.log(`Player ${msg} validated (socket id: ${id})`);
    }
});

socket.on('updatePlayerInstances', (pInsts) => {
    playerInstances = pInsts;
    const dodgeButton = document.getElementById('dodge');
    dodgeButton.classList.remove('hidden');
    dodgeButton.classList.add('visible');
    for (let i = 0; i < Object.keys(playerInstances).length; i++) {
        const player = document.getElementById(`p${i + 1}Shoot`);
        player.classList.remove('visible');
        player.classList.add('hidden');
        if (player && i !== playerId && playerInstances[i] !== null) {
            player.classList.remove('hidden');
            player.classList.add('visible');
        }
    }
})

window.onload = init;
window.onbeforeunload = emitDisconnect;