var Assert = require('assert');
var BJ = require('./BlackJack.js');

exports['Test Hand Addition'] = function () {
	var BlackJack = BJ.BlackJack();
	var Hand, Result;
	
	
	Hand = ['J♠'];
	Result = BlackJack.GetHandValue(Hand);
	
	Assert.deepEqual(Result, [10]);

	Hand = ['A♣', '10♣'];
	Result = BlackJack.GetHandValue(Hand);

	Assert.deepEqual(Result, [11, 21]);
	

}

