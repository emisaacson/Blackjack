﻿var Assert = require('assert');
var BJ = require('./BlackJack.js');

exports['Test Hand Addition'] = function () {
    var BlackJack = BJ.BlackJack();
    var Hand, Result;
    
    Hand = [];
    Result = BlackJack.GetHandValue(Hand);
    Assert.deepEqual(Result, [0]);

    Hand = ['J♠'];
    Result = BlackJack.GetHandValue(Hand);
    Assert.deepEqual(Result, [10]);
    
    Hand = ['A♣'];
    Result = BlackJack.GetHandValue(Hand);
    Assert.deepEqual(Result, [1, 11]);
    
    Hand = ['A♣', '10♣'];
    Result = BlackJack.GetHandValue(Hand);
    Assert.deepEqual(Result, [11, 21]);
    
    Hand = ['A♣', 'A♠'];
    Result = BlackJack.GetHandValue(Hand);
    Assert.deepEqual(Result, [2, 12, 22]);
    
    Hand = ['A♠', 'A♣', 'A♥', '5♠', '10♣'];
    Result = BlackJack.GetHandValue(Hand);
    Assert.deepEqual(Result, [18, 28, 38, 48]);

    Hand = ['2♠','9♠','5♠','A♠','K♠'];
    Result = BlackJack.GetHandValue(Hand);
    Assert.deepEqual(Result, [27,37]);
};

exports['Test Simple Game'] = function () {
    var BlackJack = BJ.BlackJack();

    BlackJack.Logging = true;
    BlackJack.Deck.Shuffle();
    BlackJack.Log("Beginning first hand.");
    while (BlackJack.PlayHand()) {
        BlackJack.Log("Next hand.");
    }
    BlackJack.Log("Game complete.");
    BlackJack.Log("Final Score: " + BlackJack.Player.Score.toString());
};

