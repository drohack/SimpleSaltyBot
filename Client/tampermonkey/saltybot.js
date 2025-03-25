// ==UserScript==
// @name       SaltyBot
// @namespace  http://sseeley.weebly.com/
// @version    0.2
// @description  enter something useful
// @match      https://www.saltybet.com/
// @copyright  2019 drohack
// ==/UserScript==

//adds jquery so this script can use it, then calls the callback with jquery enabled
function addJQuery(callback) {
	var script = document.createElement("script");
	script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js");
	script.addEventListener('load', function () {
		var script = document.createElement("script");
		script.textContent = "window.jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
		document.body.appendChild(script);
	}, false);
	document.body.appendChild(script);
}

function main() {

    var bet = 400; //400 is the amount of money you start with (or if you go down to 0 you reset at 400)
	var oldmoney;
	var nlosses = 0;
    var lastBet = ""; //Either "player1" or "player2" depending on the last bet to save for future bets

	//gets games played from the player's stats (unused)
	function getGamesPlayed(player) {
		var children = $("div#bettors" + player + " p").clone();
		$(children[0]).find('span').remove();
		var gamesPlayed = $(children[0]).html().replace('%', '');

		return parseInt(gamesPlayed ? gamesPlayed : 0, 10);
	}

    function replaceAll(find, replace, str) {
      return str.replace(new RegExp(find, 'g'), replace);
    }

	function tryToSetWager() {
		var wager = $("#wager");
		var money = parseInt(replaceAll(",", "", $("#balance").text().replace(",", "")), 10);
		var player1 = $("#player1");
		var player2 = $("#player2");
		//var betconfirm = $("#betconfirm");

        // Check to see if the "wager" text box has popped up and is empty. Then try and set the bet to 400
        // And auto bet on the same color/player as last time
		if (wager.is(":visible") && wager.val() == "" && player1.is(":visible") && player2.is(":visible")) {

			//console.log(oldmoney + " / " + money);
			oldmoney = money;
			if (oldmoney && oldmoney > money) {
				nlosses++;
			} else {
				nlosses = 0;
			}
            console.log("money: " + money);
            if (wager && money < bet) {
                console.log("wager: " + money);
                wager.val(money);
            }
			else if (wager) {
                console.log("wager: " + bet);
				wager.val(bet);
			}

            //Since this function should only run once each time a user can bet again, we can setup to auto bet on the same color as last time
            console.log("lastBet: " + lastBet);
            if (lastBet === "player1") {
                player1.click();
            } else if (lastBet === "player2") {
                player2.click();
            }
		}
		//console.log(money);
	}

    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }

	var saltyBotRunner;
	//sets up salty bot and runs it with the config provided by the user
	function setUpSaltyBot() {
        console.log("Start setUpSaltyBot");
		saltyBotRunner = setInterval(tryToSetWager, 500);

        console.log("Set CSS");
        addGlobalStyle('body {background-color: black !important;}');
        addGlobalStyle('#header, #chat-wrapper, #sbettorswrapper, #footer {\
            display: none !important;\
            visibility: collapse !important;\
        }');
        addGlobalStyle('html * {\
            font-size: x-large !important;\
        }');
        addGlobalStyle('#stream {\
            max-width: none !important;\
            width: 100% !important;\
            top: 5px !important;\
            left: 0px !important;\
            right: 0px !important;\
        }');
        addGlobalStyle('#bottomcontent {width: 100% !important; bottom : 10px;}');
        addGlobalStyle('#fightcard {margin-bottom: 0px;}');
        addGlobalStyle('#bet-table {padding-top: 10px; padding-bottom: 10px;}');
        addGlobalStyle('#player1 {width: 95% !important;}');
        addGlobalStyle('#player2 {width: 95% !important;}');

        // Set the player1 & player2 backgrounds to fit around the button
        document.getElementById("player1").parentElement.parentElement.style.height = '100px';
        //document.getElementById("player1").parentElement.parentElement.style.borderRadius = '25px';
        document.getElementById("player2").parentElement.parentElement.style.height = '100px';
        //document.getElementById("player2").parentElement.parentElement.style.borderRadius = '25px';
        document.getElementById("odds").parentElement.parentElement.style.bottom = '0px';
	}

	$(document).ready(function () {
		console.log("jQuery added to Tampermonkey!");

        setUpSaltyBot();

		var lastBet = ""; // Track the last bet ('player1' or 'player2')

        // Function to repeatedly click a button until it's allowed
        function tryClickButton(playerButton) {
            var interval = setInterval(function () {
                // Check if the button is visible and not disabled
                if (playerButton.is(":visible") && !playerButton.is('[disabled=disabled]')) {
                    console.log("Clicking on player button...");
                    playerButton.click();
                    clearInterval(interval); // Stop trying once it's clicked
                }
            }, 100); // Check every 100ms, adjust this as needed
        }

        document.body.onkeyup = function (e) {
            var wager = $("#wager");
            var player1 = $("#player1");
            var player2 = $("#player2");

            // If the "a" key is pressed then try and bet on Player 1
            if (e.keyCode == 65) {
                console.log("\"a\" key pressed; wager: " + wager.val() + "; player1.isVisible: " + player1.is(":visible") + "; player1.disabled: " + player1.is('[disabled=disabled]'));
                if (wager && wager.val() != "" && player1.is(":visible")) {
                    lastBet = "player1";
                    //Highlight player 1 button
                    document.getElementById("player1").parentElement.parentElement.style.background = 'red';
                    document.getElementById("player2").parentElement.parentElement.style.background = '';
                    // Try to click Player 1 button repeatedly until allowed
                    tryClickButton(player1);
                }
            }
            // If the "k" key is pressed then try and bet on Player 2
            if (e.keyCode == 75) {
                console.log("\"k\" key pressed; wager: " + wager.val() + "; player2.isVisible: " + player2.is(":visible") + "; player2.disabled: " + player2.is('[disabled=disabled]'));
                if (wager && wager.val() != "" && player2.is(":visible")) {
                    lastBet = "player2";
                    //Highlight player 2 button
                    document.getElementById("player1").parentElement.parentElement.style.background = '';
                    document.getElementById("player2").parentElement.parentElement.style.background = 'blue';
                    // Try to click Player 2 button repeatedly until allowed
                    tryClickButton(player2);
                }
            }
        }

        document.getElementById("player1").onclick = function(){
            console.log("bet on p1");
            lastBet = "player1";
        };
        document.getElementById("player2").onclick = function(){
            console.log("bet on p2");
            lastBet = "player2";
        };
	});

}

addJQuery(main);
//console.log("Hello, world!");
