const readline = require('readline');
const tmi = require('tmi.js');
const keypress = require('keypress');
const robot = require('robotjs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: [],
});

const keys = [
  'haut', 'bas', 'gauche', 'droite',
  'Haut', 'Bas', 'Gauche', 'Droite',
  'b', 'a', 'l', 'r', 'start', 'select',
  'B', 'A', 'L', 'R', 'Start', 'Select',
  'starts', 'Starts', 'selects'
];

class KeysBind {
  executeKeyAction(keyCmd) {
    keyCmd = keyCmd.toLowerCase();
    if (keyCmd === 'haut') {
      simulateKeyPress('w');
    } else if (keyCmd === 'bas') {
      simulateKeyPress('s');
    } else if (keyCmd === 'gauche') {
      simulateKeyPress('a');
    } else if (keyCmd === 'droite') {
      simulateKeyPress('d');
    } else if (keyCmd === 'b') {
      simulateKeyPress('b');
    } else if (keyCmd === 'a') {
      simulateKeyPress('v');
    } else if (keyCmd === 'l') {
      simulateKeyPress('f');
    } else if (keyCmd === 'r') {
      simulateKeyPress('g');
    } else if (keyCmd === 'start') {
      simulateKeyPress('enter');
    } else if (keyCmd === 'select') {
      simulateKeyPress('n');
    }
  }
}

function simulateKeyPress(key) {
  // Utilisation de robotjs pour simuler l'appui sur la touche
  robot.keyTap(key);
  console.log(`Touche simulée : ${key}`);
}

keypress(process.stdin);

process.stdin.on('keypress', (ch, key) => {
  if (key && key.name === 'escape') {
    process.stdin.pause();
  }
});

async function getLiveMessages(channelName) {
  try {
    await client.connect();
    client.on('message', (channel, tags, message, self) => {
      console.log(`${tags['display-name']}: ${message}`);
      if (keys.includes(message.toLowerCase())) {
        const keysBind = new KeysBind();
        keysBind.executeKeyAction(message);
      }
    });

    client.join(channelName);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages en direct :', error.message);
    client.disconnect();
  }
}

async function main() {
  try {
    const pseudo = await new Promise((resolve) => {
      rl.question("Entrez le pseudo de l'utilisateur Twitch : ", (pseudo) => {
        resolve(pseudo);
      });
    });

    client.channels.push(pseudo.toLowerCase());

    console.log(`Recherche de messages en direct pour ${pseudo}...`);
    await getLiveMessages(pseudo.toLowerCase());
  } catch (error) {
    console.error('Une erreur est survenue :', error.message);
  } finally {
    rl.close();
  }
}

main();
