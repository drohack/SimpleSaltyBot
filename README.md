SimpleSaltyBot
==============

A simple Tampermonkey script to simplify the SaltyBet interface and automatically bet on the next fight

Installation:
1. Gp to https://www.saltybet.com/
2. Login with the username: SaltyBetPartyRoom@gmail.com (the script hides the login button so you'll need to log in before enabling the script)
3. Install the Tampermonkey extension on your browser (chrome: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
4. Go to the Tampermonkey dashboard in your browser
5. Click the "+" button on the top right to open up a new script window
6. Copy the saltybot.js script (https://raw.githubusercontent.com/drohack/SimpleSaltyBot/master/Client/tampermonkey/saltybot.js)
7. Paste it into the new script in Tampermonkey
8. Click File -> Save
9. Enable "Developer Mode" in Google Extensions (go to "Manage Extensions" and in the top right click the "Developer Mode" toggle)
10. Go to https://www.saltybet.com/ and enjoy the stripped down version

This script does the following
- Strips down the saltybet.com UI so that only the relevant Twitch video, your current money, your current bet, and bet buttons are visible
- Increases the text size and button sizes so it's easier to read on a TV
- Highlights which player you've bet on
- Enables the "a" key to bet on Red and "k" key to bet on Blue
- The script will auto set the bet to $400 (or maximum if under) - This is the default amount of money a new account starts with, and how much an account gets reset to if an account drops to $0
- The script will remember the last color you bet on and will re-bet on the same color for the next fight

Note: there is a cooldown on button presses that saltybet.com has imposed so you can't swap your bet too fast

This in addition to aniMicro to map controller inputs to keyboard presses we can get people to bet live by mapping all of the buttons on a bluetooth controller for betting for a player.
https://github.com/AntiMicro/antimicro/releases
