// ==UserScript==
// @name       SaltyBot
// @namespace  http://sseeley.weebly.com/
// @version    0.1
// @description  enter something useful
// @match      https://www.saltybet.com/
// @copyright  2019 drohack
// ==/UserScript==

//adds jquery so this script can use it, then calls the callback with jquery enabled
function addJQuery(callback) {
	var script = document.createElement("script");
	script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js");
	script.addEventListener('load', function () {
		var script = document.createElement("script");
		script.textContent = "window.jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
		document.body.appendChild(script);
	}, false);
	document.body.appendChild(script);
}

function main() {

    var bet = 400;
	var oldmoney;
	var nlosses = 0;

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
        addGlobalStyle('#bottomcontent {width: 100% !important;}');
	}

	$(document).ready(function () {
		console.log("jQuery added to Tampermonkey!");

        setUpSaltyBot();

		document.body.onkeyup = function (e) {
            var wager = $("#wager");
			var player1 = $("#player1");
			var player2 = $("#player2");
			//If the "a" key is pressed then try and bet on Player 1
			if (e.keyCode == 65) {
                console.log("\"a\" key pressed; wager: " + wager.val() + "; player1.isVisible: " + player1.is(":visible"));
				if (wager && wager.val() != "" && player1.is(":visible")) {
					console.log("bet on p1");
					player1.click();
				}
			}
			//If the "k" key is pressed then try and bet on Player 2
			if (e.keyCode == 75) {
                console.log("\"k\" key pressed; wager: " + wager.val() + "; player2.isVisible: " + player2.is(":visible"));
				if (wager && wager.val() != "" && player2.is(":visible")) {
					console.log("bet on p2");
					player2.click();
				}
			}
		}
	});

}

addJQuery(main);
console.log("Hello, world!");
