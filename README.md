# Wayland Discord Push To Talk

> This is a workaround to mimic the push-to-talk functionality of Discord on Wayland.

Since Wayland does not allow global keybindings, this plugin spins up a Node.js server in the background and listen on port `3030`. Once received a request, it then change the mute state of Discord accordingly.

## Installation

1. Install [BetterDiscord](https://github.com/BetterDiscord/Installer).
2. Download `PTTServer.plugin.js` and put it in the `plugins` folder.
3. Enable the plugin.
4. Setup a keybinding in your compositor to send a request to the server.

   e.g. This is my setup in KDE, I mapped one of my mouse buttons to the `F14` key, and then map `F14` to send a `curl` request to `localhost:3000/smart`.
   ![](./img/kde_shortcuts.png)
   KDE does not allow bindings on `keydown` and `keyup`, so I have to do it like this, press and hold the button will cause the action to be run repeatedly. In this case, it will cause repeating `curl` requests to the server, the `/smart` endpoint is designed specifically to handle this.
   
   *Update:* Now I included a debounce script, setup an action on keypress to run the script will also do the job.

5. Finally, make sure your Discord is in **Voice Activity** mode.

## API

- `/smart` - The recommended way to push-to-talk, this endpoint needs to be called repeatedly during speaking to keep the client unmute, and will switch to mute state automatically after stopped requesting.
- `/toggle` - Toggle the mute state.
- `/start` - Unmute.
- `/stop` - Mute.
