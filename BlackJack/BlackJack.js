

var Deck = function () {
	var Cards = [];
	var Discards = [];
	var Suits = ['♠', '♣', '♥', '♦'];
	var CardTypes = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
	
	var GetRandomInt = function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	var _Shuffle = function (Cards) {
		var tmp, i, NewIndex;

		for (i = Cards.length - 1; i > 0; i--) {
			NewIndex = GetRandomInt(0, i);
			tmp = Cards[i];
			Cards[i] = Cards[NewIndex];
			Cards[NewIndex] = tmp;
		}
	};

	var GenerateCards = function (Cards) {
		var i, j;

		Cards = [];
		
		for (i = 0; i < Suits.length; i++) {
			for (j = 0; j < CardTypes.length; j++) {
				Cards.push(CardTypes[j] + Suits[i]);
			}
		}

		return Cards;
	};
	
	Cards = GenerateCards();
	
	return {
		Cards: Cards,
		Discards: Discards,
		Shuffle: function () {
			_Shuffle(this.Cards);
		},
		Reset: function () {
			this.Cards = GenerateCards();
			this.Discards = [];
		},
		Draw: function () {
			if (this.Cards.length === 0) {
				return undefined;
			}

			var Card = this.Cards.pop();
			this.Discards.push(Card);
			return Card;
		}
	};
};

var Player = function (BJ) {
	return {
		Score: 0,
		Cards: [],
		Hit: function () {
			var Card = BJ.Deck.Draw();
			Cards.push(Card);
		},
		Clear: function () {
			this.Cards = [];
		},
		Reset: function () {
			this.Cards = [];
			this.Score = 0;
		}
	};
};

var BlackJack = function () {
	var _Deck = Deck();
	var Moves = [];

	var BJ = {
		Deck: _Deck,
		Dealer: Player(BJ),
		Player: Player(BJ),
		GetCardValue: function (Card) {
			if (['J', 'Q', 'K'].indexOf(Card[0]) !== -1) {
				return [10];
			}
			if (Card[0] === 'A') {
				return [1, 11];
			}
			
			var StrVal = Card.substring(0, Card.length - 1);
			var NumVal = parseInt(StrVal, 10);

			return [NumVal];
		},
		GetHandValue: function (Hand) {
			var i, j, tmp, CardValue;
			
			var PossibleHandValues = [];

			for (i = 0; i < Hand.length; i++) {
				CardValue = GetCardValue(Hand[i]);
				
				if (PossibleHandValues.length === 0) {
					PossibleHandValues = CardValue;
				}
				else if (CardValue.length === 1) {
					for (j = 0; j < PossibleHandValues.length; j++) {
						PossibleHandValues[j] += CardValue[0];
					}
				}
				else if (CardValue.length === 2) {
					tmp = [];
					for (j = 0; j < PossibleHandValues.length; j++) {
						PossibleHandValues[j] += CardValue[0];
						tmp.push(PossibleHandValues[j] + CardValue[1]);
					}

					PossibleHandValues.concat(tmp);
					PossibleHandValues.sort();
					PossibleHandValues = PossibleHandValues.filter(function (Val, Index, Arr) {
						if (Index === 0) {
							return true;
						}

						if (Val === Arr[Index - 1]) {
							return false;
						}

						return true;
					});
				}
				else {
					throw "Error: Cannot have more than 2 values for a card.";
				}
			}
		},
		Reset: function () {
			this.Deck = Deck();
			this.Player = Player(this);
			this.Dealer = Player(this);
			Moves = [];
		}
	};

	return BJ;
};

var Card;
var MyDeck = Deck();

MyDeck.Shuffle();
while (Card = MyDeck.Draw()) {
	console.log(Card);
}

exports.BlackJack = BlackJack;
exports.Deck = Deck;
exports.Player = Player;