// ==UserScript==
// @name       SaltyBot
// @namespace  http://sseeley.weebly.com/
// @version    0.1
// @description  enter something useful
// @match      http://www.saltybet.com/
// @copyright  2012+, You
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

	var oldmoney;
	var nlosses = 0;

	//gets games played from the player's stats (unused)
	function getGamesPlayed(player) {
		var children = $("div#bettors" + player + " p").clone();
		$(children[0]).find('span').remove();
		var gamesPlayed = $(children[0]).html().replace('%', '');

		return parseInt(gamesPlayed ? gamesPlayed : 0, 10);
	}

	function tryToSetWager() {
		var bet = 10;
		var wager = $("#wager");
		var money = parseInt(replaceAll(",", "", $("#balance").text().replace(",", "")), 10);
		var player1 = $("#player1");
		var player2 = $("#player2");
		//var betconfirm = $("#betconfirm");

		if (player1.is(":visible") && player2.is(":visible")) {

			console.log(oldmoney + " / " + money);
			oldmoney = money;
			if (oldmoney && oldmoney > money) {
				nlosses++;
			} else {
				nlosses = 0;
			}
			if (wager) {
				wager.val(bet);
			}
		}
		console.log(money);
	}

	var active = 0;
	var saltyBotRunner;
	//sets up salty bot and runs it with the config provided by the user
	function setUpSaltyBot() {
		if (!active) {
			saltyBotRunner = setInterval(tryToSetWager, 5000);
			active = 1;
			$("#activateButton").val('Update SaltyBot!');
		}
		$("#shutdownButton").show("fast");
	}

	$(document).ready(function () {
		console.log("jQuery added to Tampermonkey!");
		var saltybotdiv = $("<div style='position: absolute; padding:10px;background-color:white;left: 1px;top: 1px;width: auto;height: auto' id='saltybot'></div>").draggable();
		var sbform = $("<form id='sbform'> </form>");
		var sbFieldSet = $("<fieldset></fieldset>");

		var activateButton = $("<input id='activateButton' type='button' value='Activate SaltyBot!'></input>");
		var shutdownButton = $("<input style='display:none;' id='shutdownButton' type='button' value='Shut it Down!'></input>");
		var hideConfigButton = $("<input id='hideconfig' type='button' value='Show/Hide'></input>")
			saltybotdiv.append(sbform);
		sbform.append(activateButton);
		sbform.append(shutdownButton);
		sbform.append(hideConfigButton);

		hideConfigButton.click(function () {
			sbFieldSet.toggle('slow');
		});
		$('head').append('<style>form p {line-height: 10px;}form p label{display:block;float:left;width:128px}form p input{width:126px}form p select{width:130px}</style>');
		$("body").append(saltybotdiv);

		$("#activateButton").click(setUpSaltyBot);
		$("#shutdownButton").click(function () {
			active = 0;
			$("#shutdownButton").hide("fast");
			clearInterval(saltyBotRunner);
			$("#activateButton").val('Start SaltyBot!');
		});

		document.body.onkeyup = function (e) {
			var player1 = $("#player1");
			var player2 = $("#player2");
			//If the "a" key is pressed then try and bet on Player 1
			if (e.keyCode == 65) {
				if (player1.is(":visible")) {
					console.log("bet on p1");
					player1.click();
				}
			}
			//If the "k" key is pressed then try and bet on Player 2
			if (e.keyCode == 75) {
				if (player2.is(":visible")) {
					console.log("bet on p2");
					player2.click();
				}
			}
		}
	});

}

addJQuery(main);
console.log("Hello, world!");
