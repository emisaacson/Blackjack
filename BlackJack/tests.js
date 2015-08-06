var Assert = require('assert');
var BJ = require('./BlackJack.js');

exports['Test Hand Addition'] = function () {
	var Hand = ['A♣', '10♣'];
	var BlackJack = BJ.BlackJack();

	var Result = BlackJack.GetHandValue(Hand);

	Assert.deepEqual(Result, [11, 21]);
	
}

