// ==UserScript==
// @name       SaltyBot
// @namespace  http://sseeley.weebly.com/
// @version    0.1
// @description  enter something useful
// @match      http://www.saltybet.com/
// @copyright  2012+, You
// ==/UserScript==

var allInThreshold=200000;
var maxBet=200000

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
    
    var oldmoney;
    var player1name;
    var tier1name;
    var player2name;
    var tier2name;
    var mylastselection;
    var lastodds;
    var logged = false;
	var nlosses = 0;
    
    function getWinRate(player){
        var children = $("div#bettors"+player+" p").clone();
        $(children[1]).find('span').remove();
        var winrate =  $(children[1]).html().replace('%','');  
        
        return parseInt(winrate ? winrate : 0, 10);
    }
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
        var choice = stats[0].winrate < stats[1].winrate ? 0 : 1;
        //var rnd = Math.random();
        //var choice = rnd < 0.5 ? 0 : 1;
        console.log("Stats: "+stats+" / Chose: Player "+choice);
        return choice;
    }
    
    function setWager(wager, money, stats, selection, maxbet){
        var bet;
        var notselection = Math.abs(selection - 1);
        
        if(money < 200000){
            bet = money;   
            console.log('All in!');
        /*}else if(!stats[selection].winrate || !stats[notselection].winrate){
            bet= Math.floor((money/300));
            console.log('Safe bet!'); */
        }else{
            
            bet = 5 * (money - (money % 100000)) / 1000;
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
    
    $(document).ready(function(){
    	console.log("jQuery added to Tampermonkey!");
        setInterval(doSaltyStuff,5000);
    });
	
    
    
}


addJQuery(main);
console.log("Hello, world!");