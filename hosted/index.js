const Player = (id) => {
    let color;
    switch (id) {
        case 0:
            color = 0xFF0000; // Red
            break;
        case 1:
            color = 0x00FF00; // Green
            break;
        case 2:
            color = 0x0000FF; // Blue
            break;
        case 3:
            color = 0xFFFF00; // Yellow
            break;
        default:
            color = 0xFFFFFF; // White
    }
    return {
        id: id,
        color: color,
        target: (id + 1) % 4,
        targetX: 0,
        targetY: 0,
        shootPrefire: 0,
        shootPrefireMax: 50,
        shootCooldown: 0,
        shootCooldownMax: 250,
        evasionWindow: 0,
        evasionWindowMax: 50,
        evadeCooldown: 0,
        evadeCooldownMax: 150,
        alive: true,
        vis: null,
        gun: null,
    }
}

(async () =>
{
    let playerInstances = {
        0: null,
        1: null,
        2: null,
        3: null,
    }

    let connectedPlayers = {
        0: null,
        1: null,
        2: null,
        3: null,
    };

    const socket = io();

    let initialized = false;

    socket.on('clientConnected', (pInsts, cCount) => {
        if (initialized) return;
        playerInstances = pInsts;
        console.log(playerInstances)
        for (let i = 0; i < Object.keys(playerInstances).length; i++)
            {
                if (playerInstances[i] !== null) {
                    connectedPlayers[i] = Player(i);
                    let gun = new PIXI.Graphics()
                    // .rect(50, 25, 20, 10)
                    // .fill('white')
                    // .stroke({color: 'white', width: 5})
                    connectedPlayers[i].gun = app.stage.addChild(gun);
                    let box = new PIXI.Graphics()
                        .rect(0, 0, 50, 50)
                        .stroke({color: connectedPlayers[i].color, width: 5})
                        .fill('black')
                    connectedPlayers[i].vis = app.stage.addChild(box);
                    switch (connectedPlayers[i].id) {
                        case 0:
                            box.x = app.screen.width / 4
                            // gun.x = app.screen.width / 4;
                            box.y = app.screen.height / 2
                            // gun.y = app.screen.height / 2;
                            break;
                        case 1:
                            box.x = app.screen.width / 2
                            // gun.x = app.screen.width / 2;
                            box.y = app.screen.height / 4
                            // gun.y = app.screen.height / 4;
                            break;
                        case 2:
                            box.x = app.screen.width / 4 * 3
                            // gun.x = app.screen.width / 4 * 3;
                            box.y = app.screen.height / 2
                            // gun.y = app.screen.height / 2;
                            break;
                        case 3:
                            box.x = app.screen.width / 2
                            // gun.x = app.screen.width / 2;
                            box.y = app.screen.height / 4 * 3
                            // gun.y = app.screen.height / 4 * 3;
                            break;
                    }
                }
            }
        initialized = true;
    })

    function killPlayer(id) {
        if (!connectedPlayers[id]) return;
        if (connectedPlayers[id].evasionWindow > 0) return;
        connectedPlayers[id].alive = false;
        playerInstances[id] = null;
        socket.emit('killPlayer', id, socket.id);
    }

    socket.on('inputFromController', (msg) => {
        console.log(msg);
        const breakdown = msg.split('-');

        if (breakdown[1] === 'dodge') {
            const actor = connectedPlayers[Number(breakdown[0].substring(1)) - 1];
            if (actor.evadeCooldown > 0 || actor.evasionWindow > 0) return;
            actor.evadeCooldown = actor.evadeCooldownMax;
            actor.evasionWindow = actor.evasionWindowMax;
            return;
        }

        const instigator = connectedPlayers[Number(breakdown[0].substring(1)) - 1];
        const target = connectedPlayers[Number(breakdown[1].substring(1)) - 1];

        if (instigator.shootCooldown > 0 || instigator.shootPrefire > 0) return;

        const charge = new Howl({
            src: ['./sound/gun_charge.wav'],
            volume: 0.25,
        })

        charge.play()

        instigator.shootPrefire = instigator.shootPrefireMax;
        instigator.target = target.id;
        instigator.targetX = target.vis.x;
        instigator.targetY = target.vis.y;
    })
    socket.on('playerConnected', (id) => {
        for (let i = 0; i < Object.keys(playerInstances).length; i++)
        {
            if (playerInstances[i] === null) {
                playerInstances[i] = id;
                console.log('Player ' + i + ' connected (socket id: ' + id + ')');
                socket.emit('validatePlayer', id, i)
                connectedPlayers[i] = Player(i);
                let gun = new PIXI.Graphics()
                // .rect(50, 25, 20, 10)
                // .fill('white')
                // .stroke({color: 'white', width: 5})
                connectedPlayers[i].gun = app.stage.addChild(gun);
                let box = new PIXI.Graphics()
                    .rect(0, 0, 50, 50)
                    .stroke({color: connectedPlayers[i].color, width: 5})
                    .fill('black')
                box.pivot.set(25, 25);
                connectedPlayers[i].vis = app.stage.addChild(box);
                switch (connectedPlayers[i].id) {
                    case 0:
                        box.x = app.screen.width / 4
                        // gun.x = app.screen.width / 4;
                        box.y = app.screen.height / 2
                        // gun.y = app.screen.height / 2;
                        break;
                    case 1:
                        box.x = app.screen.width / 2
                        // gun.x = app.screen.width / 2;
                        box.y = app.screen.height / 4
                        // gun.y = app.screen.height / 4;
                        break;
                    case 2:
                        box.x = app.screen.width / 4 * 3
                        // gun.x = app.screen.width / 4 * 3;
                        box.y = app.screen.height / 2
                        // gun.y = app.screen.height / 2;
                        break;
                    case 3:
                        box.x = app.screen.width / 2
                        // gun.x = app.screen.width / 2;
                        box.y = app.screen.height / 4 * 3
                        // gun.y = app.screen.height / 4 * 3;
                        break;
                }
                break;
            }
            socket.emit('refuseConnection');
        }
    });
    socket.on('playerDisconnected', (id, msg) => {
            if (playerInstances[id] === msg) {
                connectedPlayers[id].alive = false;
                console.log('Player ' + id + ' disconnected (socket id: ' + msg + ')');
                playerInstances[id] = null;
            }
    });

    // Create a new application
    const app = new PIXI.Application();

    // Initialize the application
    await app.init({ background: '#000000', width: 800, height: 800 });

    app.ticker.add(update)

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    let creditsButton = document.createElement('a');
    creditsButton.innerHTML = '<a href="credits.html">Who\'s the owner of this fine establishment?</a>'
    document.body.appendChild(creditsButton);

    function update() {
        let shaky = false;

        for (let i = 0; i < Object.keys(connectedPlayers).length;)
        {
            let player = connectedPlayers[i];
            if (player === null) {
                i++;
                continue;
            }

            if (player.shootPrefire > 0) {
                player.shootPrefire -= 1;
                player.gun.clear().moveTo(player.vis.x , player.vis.y).lineTo(player.targetX, player.targetY).stroke({color: player.color, width: 1 - Number(player.shootPrefire / player.shootPrefireMax) * 25, cap: 'round'})
                console.log("shootPrefire: " + player.shootPrefire)
                player.gun.alpha = 1 - Number(player.shootPrefire / player.shootPrefireMax);
                if (player.shootPrefire <= 0) {
                    player.shootCooldown = player.shootCooldownMax;

                    const shoot = new Howl({
                        src: ['./sound/gun_fire.wav'],
                        volume: 0.75,
                    })
            
                    shoot.play()

                    if (connectedPlayers[player.target]) killPlayer(player.target);
                }
            }

            if (player.shootCooldown > 0) {
                player.shootCooldown -= 1;
                console.log("shootCooldown: " + player.shootCooldown)
                player.gun.clear().moveTo(player.vis.x, player.vis.y).lineTo(player.targetX, player.targetY).stroke({color: 'white', width: 50 * Number(player.shootCooldown / player.shootCooldownMax), cap: 'round'})
                player.gun.alpha = Number(player.shootCooldown / player.shootCooldownMax);
                shaky = true;
                app.stage.x = (Math.random() * 50 - 25) * Number(player.shootCooldown / player.shootCooldownMax);
                app.stage.y = (Math.random() * 50 - 25) * Number(player.shootCooldown / player.shootCooldownMax);
                if (player.shootCooldown <= 0) {
                    socket.emit("activateButtons", player.id, playerInstances[player.id]);
                }
            }

            if (!shaky) {
                app.stage.x = 0
                app.stage.y = 0
            }

            if (player.evasionWindow > 0) {
                player.vis.alpha = 1 - Number(player.evasionWindow / player.evasionWindowMax);
                if (player.vis.alpha < 0.25) {
                    player.vis.alpha = 0.25;
                }
                if (player.vis.alpha > 0.5) {
                    player.vis.alpha = 0.5;
                }
                player.vis.angle = Number(player.evasionWindow / player.evasionWindowMax) * 75;
                player.evasionWindow -= 1;
            }

            if (player.evadeCooldown > 0) {
                player.evadeCooldown -= 1;
                if (player.evasionWindow <= 0) {
                    player.vis.alpha = 0.5;
                }
                if (player.evadeCooldown <= 0) {
                    socket.emit("activateButtons", player.id, playerInstances[player.id]);
                }
            }

            if (player.evadeCooldown <= 0 && player.evasionWindow <= 0) {
                player.vis.alpha = 1.0;
                player.vis.angle = 0;
            }

            if (!player.alive)
            {
                connectedPlayers[i].vis.destroy();
                connectedPlayers[i].gun.destroy();
                connectedPlayers[i] = null;
            }
            else
            {
                i++;
            }
        }
    }

    window.onload = () => {
        socket.emit('connectClient');
    }
    window.onbeforeunload = () => {
        socket.emit('disconnectClient');
    }
})();