const objCmd_aCommands = {
    help: `
Available commands:
about
classes
clear
contact
help
projects
welcome_protocol
`,
    about: `
Howdy! I'm Josie. :D

I'm a triple-major honors student studying:
- Software Engineering Technologies
- Software Development
- Computer Support Administration

I love learning- especially when it comes to programming, AI, and databases.
`,
    projects: `
Check out my GitHub for projects in web development, automation, and game design:
<a href="https://github.com/josieisnotarat" target="_blank">github.com/josieisnotarat</a>
`,
    contact: `
Email: josephinewooldridge05@gmail.com
Phone: +1 (513) 802-8322
`,
    classes: `
In-Progress Classes:
- Web development using C#
- C Programming
- Calculus II
`,
    clear: " ",
    welcome_protocol: `<pre style="font-family: 'Courier New', monospace; color: var(--clr-text-main);">

⠀⣴⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀        
⠀⣼⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀       Welcome to josieisnotarat.github.io! :D
⣼⣿⣿⣿⣿⣿⣿⣿⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀      
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣤⣤⣶⣶⣿⣿⡗     OS: Student v4.00
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟       Uptime: 19yrs, 11mo
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀     Majors: SE Tech / Dev / Support & Admin
⣿⣿⡇⠜⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿          Occupation: Intern\Dev\IT_Technician.py
⣿⣿⣿⣶⣿⣿⣿⣿⣿⠋⡹⠙⣿⣿⣿⡇⠀⠀        Location: Cincinnati, OH, USA
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣾⣿⣿⠛⠀⠀⠀⠀⠀      Expected Grad: Spring_2026
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠛⠁⠀⠀⠀⠀⠀⠀
⣿⣿⡿⠻⠿⠿⠿⠿⠛⠹⠑⠀⠀               Type \"help\" for a list of commands. :)
⠟

</pre>`
  };
  
  const domTerminalBox = document.getElementById('divTerminalBox');
  const domProfileCard = document.getElementById('divProfileCard');
  const domSparkleContainer = document.getElementById('divSparkleContainer');
  const arrSparkleChars = ['｡', '･', '*', '˚', '✧', '｡'];
  const txtTerminalInput = document.getElementById("txtTerminalInput");
  const divTerminalOutput = document.getElementById("divTerminalOutput");
  
  document.addEventListener('mousemove', (evt) => {
    const sngX = (evt.clientX / window.innerWidth - 0.5) * 6;
    const sngY = (evt.clientY / window.innerHeight - 0.5) * -6;
    domTerminalBox.style.transform = `rotateX(${sngY}deg) rotateY(${sngX}deg)`;
    domProfileCard.style.transform = `rotateX(${sngY}deg) rotateY(${sngX}deg)`;
  
    const divSparkle = document.createElement("div");
    divSparkle.className = "sparkle";
    divSparkle.textContent = arrSparkleChars[Math.floor(Math.random() * arrSparkleChars.length)];
    divSparkle.style.left = `${evt.clientX}px`;
    divSparkle.style.top = `${evt.clientY}px`;
    domSparkleContainer.appendChild(divSparkle);
    setTimeout(() => divSparkle.remove(), 1000);
  });
  
  function fnAddTerminalLine(strText, blnIsCmd = false) {
    const divLine = document.createElement("div");
    divLine.innerHTML = blnIsCmd
      ? `<span class="terminal-prefix">PC C:\Users\Josephine&gt; </span> ${strText}`
      : strText;
    divTerminalOutput.appendChild(divLine);
    divTerminalOutput.scrollTop = divTerminalOutput.scrollHeight;
  }
  
  function fnRunTerminalCommand(strCmd) {
    fnAddTerminalLine(strCmd, true);
    if (objCmd_aCommands[strCmd]) {
      if (strCmd === "clear") {
        divTerminalOutput.innerHTML = "";
      } else {
        fnAddTerminalLine(objCmd_aCommands[strCmd]);
      }
    } else if (strCmd.trim() !== "") {
      fnAddTerminalLine(`Command not found: ${strCmd}`);
    }
  }
  
  window.addEventListener("DOMContentLoaded", () => {
    fnRunTerminalCommand("welcome_protocol");
  });
  
  txtTerminalInput.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
      const strInput = txtTerminalInput.value.trim();
      fnRunTerminalCommand(strInput);
      txtTerminalInput.value = "";
    }
  });
  