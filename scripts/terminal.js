document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("txtTerminalInput").focus();

  const objCmd_aCommands = {
    help: `
Available commands:
about
classes
clear
contact
help
projects
typefinity
welcome_protocol
`,
    about: `Howdy! I'm Josie. :D

I'm a triple-major honors student studying:
- Software Engineering Technologies
- Software Development
- Computer Support Administration

I love learning—especially when it comes to programming, AI, and databases.`,
    projects: `Check out my GitHub for projects in web development, automation, and game design:
<a href="https://github.com/josieisnotarat" target="_blank">github.com/josieisnotarat</a>`,
    contact: `Email: josephinewooldridge05@gmail.com
Phone: +1 (513) 802-8322`,
    classes: `In-Progress Classes:
- Web development using C#
- C Programming
- Calculus II`,
    clear: " ",
    welcome_protocol: `
  ⣴⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀        
 ⣼⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀       Welcome to josieisnotarat.github.io! :D
⣼⣿⣿⣿⣿⣿⣿⣿⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀      
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣤⣤⣶⣶⣿⣿⡗     OS: Student v4.00
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟       Uptime: 19yrs, 11mo
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀     Majors: SE Tech / Dev / Support & Admin
⣿⣿⡇⠜⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿          Occupation: Intern\\Dev\\IT_Technician.py
⣿⣿⣿⣶⣿⣿⣿⣿⣿⠋⡹⠙⣿⣿⣿⡇⠀⠀        Location: Cincinnati, OH, USA
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣾⣿⣿⠛⠀⠀⠀⠀⠀      Expected Grad: Spring_2026
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠛⠁⠀⠀⠀⠀⠀⠀
⣿⣿⡿⠻⠿⠿⠿⠿⠛⠹⠑⠀⠀               Type "help" for a list of commands. :)
⠟
`
  };

  let inTypefinity = false;
  let wordBank = ["fire", "water", "wind", "earth"];
  let explanationBank = {};
  let overItFlag = false;

  const comboMap = {
  "fire water": "steam",
  "water fire": "steam",
  "wind earth": "dust",
  "earth wind": "dust",
  "fire fire": "inferno",
  "water water": "ocean",
  "earth fire": "lava",
  "fire earth": "lava",
  "wind fire": "wildfire",
  "fire wind": "wildfire",
  "earth water": "mud",
  "water earth": "mud",
  "wind wind": "tornado",
  "earth earth": "mountain",
  "wind water": "storm",
  "water wind": "storm",
  "fire mud": "brick",
  "mud fire": "brick",
  "water dust": "clay",
  "dust water": "clay",
  "earth steam": "geyser",
  "steam earth": "geyser",
  "fire storm": "lightning",
  "storm fire": "lightning",
  "wind steam": "cloud",
  "steam wind": "cloud",
  "earth cloud": "fog",
  "cloud earth": "fog",
  "water lava": "obsidian",
  "lava water": "obsidian",
  "wind lava": "glass",
  "lava wind": "glass",
  "mud wind": "erosion",
  "wind mud": "erosion",
  "dust fire": "ash",
  "fire dust": "ash",
  "ocean fire": "boil",
  "fire ocean": "boil",
  "steam steam": "pressure",
  "lava steam": "volcano",
  "steam lava": "volcano",
  "mountain wind": "avalanche",
  "wind mountain": "avalanche",
  "mud pressure": "fossil",
  "pressure mud": "fossil",
  "storm dust": "sandstorm",
  "dust storm": "sandstorm",
  "ocean earth": "island",
  "earth ocean": "island",
  "mountain ocean": "cliff",
  "ocean mountain": "cliff",
  "mud ocean": "swamp",
  "ocean mud": "swamp",
  "fire tornado": "firestorm",
  "tornado fire": "firestorm",
  "fire cloud": "smoke",
  "cloud fire": "smoke",
  "lava mountain": "volcano",
  "mountain lava": "volcano",
  "cloud storm": "thunderhead",
  "storm cloud": "thunderhead",
  "cloud pressure": "thunderstorm",
  "pressure cloud": "thunderstorm",
  "cloud lava": "plume",
  "lava cloud": "plume",
  "mountain storm": "blizzard",
  "storm mountain": "blizzard",
  "pressure tornado": "rupture",
  "tornado pressure": "rupture",
  "dust mud": "silt",
  "mud dust": "silt",
  "geyser wind": "mist",
  "wind geyser": "mist",
  "fog fire": "smog",
  "fire fog": "smog",
  "clay fire": "ceramic",
  "fire clay": "ceramic",
  "cloud clay": "porcelain",
  "clay cloud": "porcelain",
  "obsidian wind": "shard",
  "wind obsidian": "shard",
  "glass steam": "lens",
  "steam glass": "lens",
  "fog lightning": "static",
  "lightning fog": "static",
  "lava dust": "scoria",
  "dust lava": "scoria",
  "storm ash": "soot",
  "ash storm": "soot",
  "pressure smoke": "choke",
  "smoke pressure": "choke",
  "volcano ocean": "tsunami",
  "ocean volcano": "tsunami",
  "fire fossil": "charcoal",
  "fossil fire": "charcoal"
};


  const terminalInput = document.getElementById("txtTerminalInput");
  const terminalOutput = document.getElementById("divTerminalOutput");

  terminalInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const rawInput = terminalInput.value.trim();
      const input = rawInput.toLowerCase();
      terminalInput.value = "";

      printLine(`PC C:\\Users\\Josephine> ${rawInput} \n`, "user-input");

      if (inTypefinity) {
        handleTypefinityCommand(rawInput);
        return;
      }

      if (input === "typefinity") {
        inTypefinity = true;
        printLine("WELCOME TO TYPEFINITY: DEMO!\n-----------------------------------------------------");
        printLine("This is the DEMO VERSION (and js port) of a python project using OpenAI's API. All combinations in this version are hard-coded, !logic explanations are disabled, and you cannot save your progress.");
        printLine("To play the full version, visit <a href=\"https://github.com/josieisnotarat/Typefinity\" target=\"_blank\">github.com/josieisnotarat/Typefinity</a> and follow setup instructions.");
        printLine("That being said, there are a total of 50 unique words to find. Can you find them all?");    
        printLine("\nInstructions:\nEnter a combination of two words from the word bank, separated by spaces.\nFor example: typing in \"fire water\" might result in \"steam\"");
        printLine("\nAvailable Commands:\n!logic         - Get a snarky explanation of your combo (disabled)\n!load          - Save your current game state (disabled)\n!save          - Load your previously saved demo session (disabled)\n!instructions  - Show command list\n!endgame    - Exit the game");
        printLine(`\nWord bank: ${wordBank.join(", ")}`);
        return;
      }

      if (input in objCmd_aCommands) {
        if (input === "clear") {
          terminalOutput.innerHTML = "";
        } else {
          printLine(objCmd_aCommands[input], "output");
        }
      } else {
        printLine("Command not recognized. Type 'help' for a list of commands.", "error");
      }
    }
  });

  function handleTypefinityCommand(input) {
  const lowerInput = input.toLowerCase();

  if (lowerInput === "!endgame") {
    inTypefinity = false;
    printLine("Exiting TypeFinity. Welcome back to the main terminal.");
    return;
  }

  if (lowerInput === "!instructions") {    
    printLine("\nInstructions:\nEnter a combination of two words from the word bank, separated by spaces.\nFor example: typing in \"fire water\" might result in \"steam\"");
    printLine("\nAvailable Commands:\n!logic         - Get a snarky explanation of your combo (disabled)\n!load          - Save your current game state (disabled)\n!save          - Load your previously saved demo session (disabled)\n!instructions  - Show command list\n!endgame    - Exit the game");
    return;
  }

  if (lowerInput === "!logic") {
    printLine("Snarky explanations disabled in demo mode. Visit <a href=\"https://github.com/josieisnotarat/Typefinity\" target=\"_blank\">github.com/josieisnotarat/Typefinity</a> and follow the setup instructions to play the full game.");
    return;
  }

  if (lowerInput === "!save") {
    printLine("Saving is disabled in the DEMO VERSION.");
    printLine("To enable save/load functionality, visit <a href=\"https://github.com/josieisnotarat/Typefinity\" target=\"_blank\">github.com/josieisnotarat/Typefinity</a> and follow the setup instructions.");
    return;
  }

  if (lowerInput === "!load") {
    printLine("Loading is disabled in the DEMO VERSION.");
    printLine("To enable save/load functionality, visit <a href=\"https://github.com/josieisnotarat/Typefinity\" target=\"_blank\">github.com/josieisnotarat/Typefinity</a> and follow the setup instructions.");
    return;
  }

  const words = lowerInput.split(/\s+/);
  if (words.length === 2 && words.every(w => wordBank.includes(w))) {
    const comboKey = `${words[0]} ${words[1]}`;
    const combo = comboMap[comboKey];

    if (combo) {
      printLine(`${combo}`);
      if (!wordBank.includes(combo)) {
        wordBank.push(combo);
        printLine(`Updated word bank: ${wordBank.join(", ")}`);

        const allCombos = new Set(Object.values(comboMap));
        const allWordsDiscovered = [...allCombos].every(word => wordBank.includes(word));
        if (allWordsDiscovered) {
          printLine("You've discovered all possible combos in the demo!");
          printLine("Want unlimited fusion and snark? Visit <a href=\"https://github.com/josieisnotarat/Typefinity\" target=\"_blank\">github.com/josieisnotarat/Typefinity</a> and follow the setup instructions!");
        }
      }
    } else {
      printLine("No known combo for that pair in demo mode.");
    }
  } else {
    printLine("Invalid input. Try two valid words from the word bank.");
  }
}


  function printLine(text, type = "") {
    const line = document.createElement("div");
    line.className = type;
    line.innerHTML = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  window.addEventListener("DOMContentLoaded", () => {
    printLine("PC C:\\Users\\Josephine> welcome_protocol");
    printLine(objCmd_aCommands["welcome_protocol"], "output");
  });
});
