var Assert = require('assert');
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

exports['Test Solver'] = function () {
    
    var Normal = BJ.BlackJack();
    
    Normal.Logging = true;
    Normal.Log("Beginning Standard game.");
    while (Normal.PlayHand()) {
        Normal.Log("Next hand.");
    }
    Normal.Log("Game complete.");
    Normal.Log("Final Score: " + Normal.Player.Score.toString());

    var Solver = BJ.Solver();
    
    Solver.Logging = true;
    Solver.Log("Beinning Optimal game.");
    var result = Solver.Solve([], [], null, Solver.Deck.Cards.slice(), Solver.Deck.Cards.length, "-");
    Solver.Log("Optimal score: " + result.toString());

    var Checker = BJ.BlackJack();
    Checker.Logging = true;
    Checker.Log("Beginning Check Game.");
    Checker.Player = BJ.DeterministicPlayer(Checker, Solver.Parent);
    while (Checker.PlayHand()) {
        Checker.Log("Next hand.");
    }
    Checker.Log("Game complete.");
    Checker.Log("Final Score: " + Checker.Player.Score.toString());

    Assert.ok(Normal.Player.Score <= result);
    Assert.ok(result === Checker.Player.Score);
};

exports['Test Solver Small Deck'] = function () {
    
	var Suits = ['♠', '♣', '♥', '♦'];
    var Deck = ['7♦', '9♠', '5♥', 'J♠', 'A♦', 'Q♥', '10♣', 'K♥','7♦', '9♠', '5♥', 'J♠', 'A♦', 'Q♥', '10♣', 'K♥','7♦', '9♠', '5♥', 'J♠', 'A♦', 'Q♥', '10♣', 'K♥', '3♦', 'A♠', '2♥', '8♠', '4♣','4♥'];
    var Normal = BJ.BlackJack();
    
    Normal.Logging = false;
    Normal.Log("Beginning Standard game.");
    Normal.Deck.Cards = Deck.slice();
    while (Normal.PlayHand()) {
        Normal.Log("Next hand.");
    }
    Normal.Log("Game complete.");
    Normal.Log("Final Score: " + Normal.Player.Score.toString());
    
    var Solver = BJ.Solver();
    
    Solver.Logging = false;
    Solver.Log("Beginning Optimal game.");
    Solver.Deck.Cards = Deck.slice();
    var result = Solver.Solve([], [], null, Deck.slice(), Deck.length, "-");
    Solver.Log("Optimal score: " + result.toString());
    
    
    var Checker = BJ.BlackJack();
    Checker.Logging = false;
    Checker.Log("Beginning Check Game.");
    Checker.Deck.Cards = Deck.slice();
    Checker.Player = BJ.DeterministicPlayer(Checker, Solver.Parent);
    while (Checker.PlayHand()) {
        Checker.Log("Next hand.");
    }
    Checker.Log("Game complete.");
    Checker.Log("Final Score: " + Checker.Player.Score.toString());

    Assert.ok(Normal.Player.Score <= result);
    Assert.ok(result === Checker.Player.Score);
};

exports['Test Solver Random'] = function () {
    
    var Normal = BJ.BlackJack();
    
    Normal.Logging = true;
    Normal.Log("Beginning Standard game.");
    Normal.Deck.Shuffle();
    var Deck = Normal.Deck.Cards.slice();
    while (Normal.PlayHand()) {
        Normal.Log("Next hand.");
    }
    Normal.Log("Game complete.");
    Normal.Log("Final Score: " + Normal.Player.Score.toString());

    var Solver = BJ.Solver();
    
    Solver.Logging = true;
    Solver.Log("Beginning Optimal game.");
    var result = Solver.Solve([], [], null, Deck.slice(), Deck.length, "-");
    Solver.Log("Optimal score: " + result.toString());


    var Checker = BJ.BlackJack();
    Checker.Logging = true;
    Checker.Log("Beginning Check Game.");
    Checker.Deck.Cards = Deck.slice();
    Checker.Player = BJ.DeterministicPlayer(Checker, Solver.Parent);
    while (Checker.PlayHand()) {
        Checker.Log("Next hand.");
    }
    Checker.Log("Game complete.");
    Checker.Log("Final Score: " + Checker.Player.Score.toString());

    Assert.ok(Normal.Player.Score <= result);
    Assert.ok(result === Checker.Player.Score);
};