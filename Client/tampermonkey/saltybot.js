// ==UserScript==
// @name       SaltyBot
// @namespace  http://sseeley.weebly.com/
// @version    0.1
// @description  enter something useful
// @match      http://www.saltybet.com/
// @copyright  2012+, You
// ==/UserScript==

// unused vars
var allInThreshold=200000;
var maxBet=200000

//adds jquery so this script can use it, then calls the callback with jquery enabled
function addJQuery(callback) {
    var script = document.createElement("script");
    script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js");
    script.addEventListener('load', function() {
        var script = document.createElement("script");
        script.textContent = "window.jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
}


function main(){
    
    var saltybotconfig;
    var oldmoney;
    var player1name;
    var tier1name;
    var player2name;
    var tier2name;
    var mylastselection;
    var lastodds;
    var logged = false;
	var nlosses = 0;
    
    //gets the win rate from the player's stats - requires illuminati
    function getWinRate(player){
        var children = $("div#bettors"+player+" p").clone();
        $(children[1]).find('span').remove();
        var winrate =  $(children[1]).html().replace('%','');  
        
        return parseInt(winrate ? winrate : 0, 10);
    }
    
    //gets games played from the player's stats (unused)
    function getGamesPlayed(player){
        var children = $("div#bettors"+player+" p").clone();
        $(children[0]).find('span').remove();
        var gamesPlayed =  $(children[0]).html().replace('%','');  
        
        return parseInt(gamesPlayed ? gamesPlayed : 0,10);
    }
    
    //returns an array with stats for each player
    function getStats(){
        var p1WinRate = getWinRate(1);
        var p2WinRate = getWinRate(2); 
        var p1GamesPlayed = getGamesPlayed(1);
        var p2GamesPlayed = getGamesPlayed(2);
        return [{ winrate: p1WinRate, gamesplayed: p1GamesPlayed },
                { winrate: p2WinRate, gamesplayed: p2GamesPlayed }];
    }
                 
    //gets a random integer between min and max inclusive
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    }
    
    //returns 0 or 1 (the selected player)
    function determineBetSelection(stats){
        var choice;
        
        console.log(saltybotconfig.strategy);
        console.log((stats[0].winrate > stats[1].winrate)  +" " + (stats[0].winrate < stats[1].winrate) );
        switch(saltybotconfig.strategy){   
            case 0:
                if(stats[0].winrate > stats[1].winrate) 
                    choice = 0;
                else choice = 1;
                //choice = (stats[0].winrate > stats[1].winrate) ? 0 : 1;
                console.log('this is 0');
                break;
            case 1: 
                if(stats[0].winrate < stats[1].winrate) 
                    choice = 0;
                else choice = 1;
                choice = (stats[0].winrate < stats[1].winrate) ? 0 : 1;
                console.log('this is 1');
                break;
            default:
                var rnd = Math.random();
        		choice = rnd < 0.5 ? 0 : 1;
                console.log('this is 2');
        }
        console.log("Stats: "+stats+" / Chose: Player "+choice);
        return choice;
    }
    
    
    //set the wager using parameters in saltybotconfig
    function setWager(wager, money, stats, selection, maxbet){
        var bet;
        var notselection = Math.abs(selection - 1);
        var windiff = stats[notselection].winrate-stats[selection].winrate;
        console.log(stats[notselection].winrate+" "+stats[selection].winrate+" "+saltybotconfig.safebetthreshold )
        //if below allinthreshold, all in!
        if(money < saltybotconfig.allinthreshold){
            bet = money;   
            console.log('All in!');
            
          
        //if stats are messed up or it's new characters, go with safe bet   
        }else if(saltybotconfig.illuminati && (stats[selection].gamesplayed < 3 || stats[notselection].gamesplayed < 3 || !stats[selection].winrate || 
                 windiff > saltybotconfig.safebetthreshold ||
                 (windiff > -saltybotconfig.safebetthreshold && windiff < 0))){
            bet= saltybotconfig.safebetamount;
            console.log('Safe bet!'); 
            
        //otherwise use base bet with modifiers applied;    
        }else{
            if(saltybotconfig.usepercentage){
             	bet = Math.floor(money * (saltybotconfig.basebet /100));	   
            }else{
                bet = saltybotconfig.basebet;
            }
            
            if(saltybotconfig.incomemodifier > 0){
                var modifybet = saltybotconfig.incomemodifier * Math.floor(money/saltybotconfig.incomemodifierper);
             	bet = bet +  modifybet;
                console.log("Bet income-modified by "+modifybet);
            }
            
            //bet = 5  * (money - (money % 100000)) / 1000 ; 
           	console.log(bet + " / "+money);
            /*
            var betratemultiplier;
             
            betratemultiplier = Math.min(stats[selection].winrate   / (stats[notselection].winrate ), 3);   
			//var betratemultiplier = Math.min((selectedGamesWon / notselectedGamesWon), 3);
            if(betratemultiplier < 1) {
                betratemultiplier = Math.pow(betratemultiplier,2);
            }
            console.log("multiplier: "+betratemultiplier);
            bet = Math.floor((money/100)*(stats[selection].winrate/100)*betratemultiplier);   
            bet = bet + (bet * 0.25 * nlosses); */
            console.log("Normal bet!");
        }
        
        wager.val(Math.min(bet,maxbet).toString());  
    }
    function replaceAll(find, replace, str) {
      return str.replace(new RegExp(find, 'g'), replace);
    }
    
    function log10(val) {
      return Math.log(val) / Math.LN10;
    }
        
    function sendLogInfo(data){
     	console.log('sending log.. data ');
        console.log(data);
        $.ajax({
            url: 'http://sseeley.pythonanywhere.com/saltybet/winlog',
            crossDomain: true,
            type: "POST",
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
            success: function(){ console.log("successfully sent log"); },
            error: function(req, err){ console.log("Error occured when sending log");}
        });
    }
    function doSaltyStuff(){
        
        var maxbet = 100000;
        var wager = $("#wager");
        var money = parseInt( replaceAll(",","", $("#balance").text().replace(",","")) , 10);
        var player1 = $("#player1");
        var player2 = $("#player2");
        var betconfirm = $("#betconfirm");
        var selected = 0;
        var winner;
        
        /* 
        if(mylastselection){
                        
           
            if(player1.is(":visible")){
                var won = oldmoney && (money - oldmoney >= 0);
                winner = mylastselection;
                
                if(!won){
                    winner = Math.abs(mylastselection - 1);   
                }
                
                player1name = $("#sbettors1 span.redtext").text();
                player2name = $("#sbettors2 span.bluetext").text();
                var redchildren = $("#bettors1").children();
                var bluechildren = $("#bettors1").children();
                
                console.log(player1name + "  " + player2name + "  ");
                var tier1 = $(redchildren[3]);
                tier1.find("span").remove();
                tier1name = tier1.html();
                
                var tier2 = $(bluechildren[3]);
                tier2.find("span").remove();
                tier2name = tier2.html();
                
                console.log(tier1name + " "+ tier2name);
    
            }else{
                var redpart = $("span#lastbet span.redtext:last").html();
                var bluepart = $("span#lastbet span.bluetext:last").html();
                
                console.log(redpart + ":" + bluepart);   
                lastodds = redpart + ":" + bluepart;
               
                if(!logged &&
                   player1name != undefined &&
                   lastodds != undefined){
                    var winlog = {
                        player1: player1name,
                        tier1: tier1name,
                        player2: player2name,
                        tier2: tier2name,
                        winner: winner !=undefined ? winner : -1,
                        odds: lastodds
                    };
                    
                    sendLogInfo(winlog);
                    player1name=undefined;
                    player2name=undefined;
                    tier1name=undefined;
                    tier2name=undefined;
                    winner=-1;
                    lastodds=undefined;
                    
                    logged = true;   
                }
                
            }
          
        }
          */
        if(!betconfirm.is(":visible") && player1.is(":visible"))
        {
            
            console.log(oldmoney + " / " + money);
            var stats = getStats();
            oldmoney = money;
            if(oldmoney && oldmoney > money){
             	nlosses++;   
            }else{
             	nlosses = 0;   
            }
            selected = determineBetSelection(stats);
            mylastselection = selected;
            if(wager){
                //var bet = Math.floor(Math.pow(10, Math.ceil(log10(money))-2));
                console.log(stats);
                setWager(wager, money, stats, selected, maxbet);
            }
            
            if(player1.is(":visible")){
                try{
                    if(selected == 0){
                        console.log("bet on p1");
                        player1.click();
                    }else{
                        console.log("bet on p2");
                        player2.click();   
                    }
                }catch(Exception){
                    console.log("ERROR fall back on p1");
                    player1.click();
                }
                logged = false;
            }
        }
        console.log(money);
        

    }
    
    var active = 0;
    var saltyBotRunner;
    //sets up salty bot and runs it with the config provided by the user
    function setUpSaltyBot(){
        var betstrat;
        var basebetval;
        var isPercent;
        var incomeModifier;
        var incomeModifierPer;
        var winrateModifier;
        var allinthresh;
        var safebet;
        var safebetthreshold;
        var illuminati;
        betstrat = parseInt($("#sbstrategyselect").val(),10);
        isPercent = ($('#bettype').val() == 1);
		basebetval = parseFloat($("#basebetinput").val(),10);   
		incomeModifier = parseInt($('#incomemod').val(),10);
        incomeModifierPer  = parseInt($('#incomemod2').val(),10);
        winrateModifier = $('#winratemod').val();
		allinthresh = parseInt($("#allinthreshinput").val(),10);  
        safebet = parseInt($("#safebetamount").val(),10);
        safebetthreshold = parseInt($("#safebetthreshold").val(),10);
        illuminati = $("#saltymode").is(":checked");
        saltybotconfig = {
            strategy: betstrat,
            usepercentage: isPercent,
            basebet: basebetval,
            incomemodifier: incomeModifier,
            incomemodifierper: incomeModifierPer,
            winratemodifier: winrateModifier,
            allinthreshold: allinthresh,
            safebetamount: safebet,
            safebetthreshold: safebetthreshold,
            illuminati: illuminati
        };
        if(!active){
        	saltyBotRunner = setInterval(doSaltyStuff,5000);
        	active = 1;
             $("#activateButton").val('Update SaltyBot!');

        }
        $("#shutdownButton").show("fast");
        console.log(saltybotconfig);
    }
    
    
    $(document).ready(function(){
    	console.log("jQuery added to Tampermonkey!");
        var saltybotdiv = $("<div style='position: absolute; padding:10px;background-color:white;left: 1px;top: 1px;width: auto;height: auto' id='saltybot'></div>").draggable();
        var sbform = $("<form id='sbform'> </form>");
        var sbFieldSet = $("<fieldset></fieldset>");
        var mode = $("<p><label for='saltymode'>Salty Mode</label><input type='checkbox' id='saltymode' checked='checked'>Illuminati</input>");
        var strategyoptions = $("<p> \
									<label for='sbstrategyselect'>Bet Strategy: </label> \
                                    <select class='pure-input-aligned' id='sbstrategyselect'> \
                                        <option value='0'>Highest Win Rate</option> \
                                        <option value='1'>Lowest Win Rate</option> \
                                        <option value='2'>Random</option> \
                                    </select> \
								</p>");
        
        var basebetcontent =  $("<br/><p> \
                                    <label for='basebetinput'>Base bet:</label><input type='number' min='0' max='999999999' step='100' id='basebetinput' value='1000' /></input> \
								</p><p> \
                                    <label for='bettype'>Bet type:</label><select id='bettype'> <option value='0'>Saltybucks</option><option value='1'>%</option></select> \
                                </p>");
        
        var allinthreshold = $("<br/><p> \
                                    <label for='allinthreshold'>All In Threshold:</label><input type='number' min='0' max='999999999' step='100' id='allinthreshinput' value='100000'></input> \
                                 </p><p class='safebet'> \
									<label for='safebetamount'>Safe bet amount:</label><input max='999999' type='number' min='0' step='100' id='safebetamount' value='1000'></input> \
								</p><p class='safebet'> \
									<label for='safebetthreshold'>Safe bet threshold</label><input max='100' value='10' type='number' min='0' id='safebetthreshold'></input> %  \
								</p >");
       
        var betmodifiers = $("<br/><p> \
								<label for='incomemod'>Income modifier:</label><input min='0' step='100' max='999999' id='incomemod' type='number' value='0'></input> \
							  </p><p > \
							 	<label for='incomemod2'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for every</label><input min='0' step='100' max='999999999' id='incomemod2' type='number' value='100000'></input> $ earned \
							  </p><br/><p style='display: none'> \
								<label for='winratemod'>Winrate modifier:</label><input type='number' min='0' max='100' id='winratemod' value='0'></input> % \
							  </p>"); 
        
		var activateButton = $("<input id='activateButton' type='button' value='Activate SaltyBot!'></input>");
        var shutdownButton = $("<input style='display:none;' id='shutdownButton' type='button' value='Shut it Down!'></input>");
        var hideConfigButton = $("<input id='hideconfig' type='button' value='Show/Hide'></input>")
        saltybotdiv.append(sbform);
        sbform.append(sbFieldSet);
        sbFieldSet.append(mode);
        sbFieldSet.append(strategyoptions);
        sbFieldSet.append(basebetcontent);
        sbFieldSet.append(betmodifiers);
		sbFieldSet.append(allinthreshold);
        sbform.append(activateButton);
        sbform.append(shutdownButton);
        sbform.append(hideConfigButton);
        
        hideConfigButton.click(function(){sbFieldSet.toggle('slow');});
        $('head').append('<style>form p {line-height: 10px;}form p label{display:block;float:left;width:128px}form p input{width:126px}form p select{width:130px}</style>');
        $("body").append( saltybotdiv);
        
        console.log( $('select#bettype').html());
        
        $("#saltymode").change(function(){
            if(!$(this).is(":checked")){
                $("#sbstrategyselect").val(2);
                $("#sbstrategyselect").attr("disabled","disabled");
                $(".safebet").hide('fast');
            }else{
                $("#sbstrategyselect").removeAttr("disabled")
                $(".safebet").show('fast');
            }
        });
        $('select#bettype').change(function(){
            if($('#bettype').val() == 1) 
            {
             	$("#basebetinput").attr('max','100'); 
                $("#basebetinput").val(Math.min($('#basebetinput').val(), 100))

            }else{
             	$("#basebetinput").removeAttr('max');

            }
            console.log("selected "+$('select#bettype').val());
            });
        $("#activateButton").click(setUpSaltyBot);
        $("#shutdownButton").click(function(){ 
            active=0;  
            $("#shutdownButton").hide("fast");
            clearInterval( saltyBotRunner );  
            $("#activateButton").val('Start SaltyBot!');
        });
    });
	
}


addJQuery(main);
console.log("Hello, world!");
