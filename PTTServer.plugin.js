/**
 * @name PTTServer
 * @invite undefined
 * @authorLink undefined
 * @donate undefined
 * @patreon undefined
 * @website https://github.com/stanley2058/wayland-discord-push-to-talk
 * @source https://github.com/stanley2058/wayland-discord-push-to-talk/blob/main/PTTServer.plugin.js
 */
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

module.exports = (() => {
  const config = {
    main: "index.js",
    info: {
      name: "PTTServer",
      authors: [
        {
          name: "stanley2058",
          discord_id: "194799696990961664",
          github_username: "stanley2058",
        },
      ],
      version: "1.0.0",
      description: "A dirty workaround to achieve PTT on wayland",
      github: "https://github.com/stanley2058/wayland-discord-push-to-talk",
      github_raw: "https://raw.githubusercontent.com/stanley2058/wayland-discord-push-to-talk/main/PTTServer.plugin.js",
    },
    changelog: [],
  };
  
  // these two function are copied from Arashiryuu's plugin
  // check it out: https://github.com/Arashiryuu/crap/blob/master/ToastIntegrated/HideServersChannelsRedux/HideServersChannelsRedux.plugin.js
  const log = function () {
    const parts = [
      `%c[${config.info.name}]%c \u2014 %s`,
      "color: #3A71C1; font-weight: 700;",
      "",
      new Date().toUTCString(),
    ];
    console.group.apply(null, parts);
    console.log.apply(null, arguments);
    console.groupEnd();
  };
  const error = function () {
    const parts = [
      `%c[${config.info.name}]%c \u2014 %s`,
      "color: #3A71C1; font-weight: 700;",
      "",
      new Date().toUTCString(),
    ];
    console.group.apply(null, parts);
    console.error.apply(null, arguments);
    console.groupEnd();
  };

  return !global.ZeresPluginLibrary
    ? class {
        constructor() {
          this._config = config;
        }
        getName = () => config.info.name;
        getAuthor = () => config.info.authors.map((a) => a.name).join(", ");
        getDescription = () => config.info.description;
        getVersion = () => config.info.version;
        load() {
          BdApi.showConfirmationModal(
            "Library Missing",
            `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
            {
              confirmText: "Download Now",
              cancelText: "Cancel",
              onConfirm: () => {
                require("request").get(
                  "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                  async (error, response, body) => {
                    if (error)
                      return require("electron").shell.openExternal(
                        "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                      );
                    await new Promise((r) =>
                      require("fs").writeFile(
                        require("path").join(
                          BdApi.Plugins.folder,
                          "0PluginLibrary.plugin.js"
                        ),
                        body,
                        r
                      )
                    );
                  }
                );
              },
            }
          );
        }
        start() {}
        stop() {}
      }
    : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
          const http = require("http");
          const PORT = 3030;
          const btnSelector = "section[class^='panels'] button[role='switch']";

          return class PTTServer extends Plugin {
            server = null;
            timer = null;
            dirtiness = 0;
            
            getMuteBtn() {
              return document.querySelector(btnSelector);
            }
            
            onStart() {
              this.timer = setInterval(() => {
                if (this.dirtiness > 0) {
                  this.dirtiness--;
                  if (this.dirtiness === 0) {
                    const btn = this.getMuteBtn();
                    if (btn && btn.ariaChecked === "false") {
                      btn.click();
                    }
                  }
                }
              }, 50);
              this.server = http.createServer((req, res) => {
                const muteBtn = this.getMuteBtn();
                switch (req.url) {
                  case "/start":
                    if (muteBtn && muteBtn.ariaChecked === "true") {
                      muteBtn.click();
                    }
                    res.writeHead(200);
                    break;
                  case "/stop":
                    if (muteBtn && muteBtn.ariaChecked === "false") {
                      muteBtn.click();
                    }
                    res.writeHead(200);
                    break;
                  case "/toggle":
                    if (muteBtn) muteBtn.click();
                    res.writeHead(200);
                    break;
                  case "/smart":
                    // initially set dirtiness higher because mouse event takes time to ramp up
                    if (this.dirtiness === 0) this.dirtiness = 15;
                    else this.dirtiness = 5;

                    if (muteBtn && muteBtn.ariaChecked === "true") {
                      muteBtn.click();
                    }
                    res.writeHead(200);
                    break;
                  default:
                    res.writeHead(404);
                    break;
                }
                res.end();
              });

              this.server.listen(PORT, () => {
                log(`PTT server listening on port: ${PORT}`);
              });
            }

            onStop() {
              clearInterval(this.timer);
              this.server.close(() => {
                log("PTT server stopped");
              });
            }
          };
        };
        return plugin(Plugin, Api);
      })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
