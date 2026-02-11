# 24/7 Free Hosting with Repl.it
How do I get free 24/7 hosting with replit? Here's how.

*If this repository helps you in any way, give it a* :star:\
![](https://user-images.githubusercontent.com/69215413/146993173-a8bede48-c001-4028-bf77-626113d599a6.png)

> :warning: **Warning:** This only works for `Node.JS` or `HTML, CSS, JS` repls.

> 💡 **Tip:** repl.it is great for testing out projects before lauching to the masses.

## Index
- [Creating a Repl](#creating-a-repl)
- [Hosting](#hosting)
    - [Install Packages](#install-packages)
    - [index.js](#indexjs)
    - [server.js](#serverjs)
    - [Run It](#run-it)
    - [UptimeRobot](#uptimerobot)
    - [Profit](#profit)
- [OPTC Parallel Seas Simulator](#optc-parallel-seas-simulator)

## Creating a Repl
Assuming you've already [created a replit account](https://replit.com/signup), let's make a repl:
> 💡 **Tip:** If you already have a repl, go to the [next section](#hosting).

1. Go to [replit.com/~](https://replit.com/~)
2. Create a *repl* by clicking the ➕ sign under the 'Create' section:
3. Select Node.JS as your template *(or HTML, CSS, JS for a site)*.
4. Give it a name, or stick with the one that is auto generated.
5. Click "Create Repl".

## Hosting
### Install Packages
1. Run `npm init -y` in the Shell
2. Run this in the Shell to install the dependencies:
```sh-session
npm install express ping-monitor
```

### index.js
Put this code in your `index.js` file for the Node.JS template, or `script.js` for the HTML, CSS, JS template:
```js
const keepAlive = require('./server');
const Monitor = require('ping-monitor');

keepAlive();
const monitor = new Monitor({
    website: '',
    title: 'NAME',
    interval: 2
});

monitor.on('up', (res) => console.log(`${res.website} its on.`));
monitor.on('down', (res) => console.log(`${res.website} it has died - ${res.statusMessage}`));
monitor.on('stop', (website) => console.log(`${website} has stopped.`) );
monitor.on('error', (error) => console.log(error));
```

### server.js
```js
const express = require('express');
const server = express();

server.all('/', (req, res) => {
    res.send('<h2>Server is ready!</h2>');
});

module.exports = () => {
    server.listen(4000, () => {
        console.log('Server Ready.');
    });
    return true;
}
```

### Run It
Click the 'Run' button.

### UptimeRobot
Use [UptimeRobot](https://uptimerobot.com/) to ping your Repl URL every few minutes.

### Profit
Run your repl, and now your bot/website/project will be hosted 24/7.

---

## OPTC Parallel Seas Simulator
A complete responsive web tool is now included in this repo:
- `index.html`
- `styles.css`
- `script.js`

### What it does
- Crew builder for captain/friend/units.
- Boost + quest input controls.
- Local simulation run with estimated damage result.
- OTA-style content pack update flow (manifest check/apply) for presets and multipliers.
- Optional auto-check timer for OTA manifests (every 60 seconds).
- Save/load strategy plans with `localStorage`.
- Export plan as JSON.
- Import saved plan JSON files back into the simulator.
- Recent simulation history (latest 10 runs) saved locally.
- Responsive mobile/tablet/desktop layout.
- Light/dark mode and keyboard-friendly navigation.

### Important note
This is a **strategy sandbox/simulation planner only**. It does **not** provide or include game hacking, injection, spoofing, cheating, account tampering, or modding features.

OTA updates here are for simulator data/content packs only (captain presets and quest multipliers), not for altering any live game client.

### Run locally
```bash
python -m http.server 8080
```
Then open `http://localhost:8080`.

Default local OTA manifest source: `./data.json`.
