
var Deck = function (Cards) {
   'use strict';

    var _Cards;
	var Suits = ['♠', '♣', '♥', '♦'];
	var CardTypes = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
    
    if (typeof Cards !== 'undefined') {
        _Cards = Cards;
    }
    else {
        _Cards = [];
    }
	
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
	
	_Cards = GenerateCards();
	
	return {
		Cards: _Cards,
		Shuffle: function () {
			_Shuffle(this.Cards);
		},
		Reset: function () {
			this.Cards = GenerateCards();
		},
		Draw: function () {
			if (this.Cards.length === 0) {
				return undefined;
			}

			var Card = this.Cards.pop();
			return Card;
		}
	};
};

var Moves = {
    Stay: 0,
    Hit: 1,
    DoubleDown: 2,
    Split: 3
};

var Player = function (BJ) {
   'use strict';

	return {
		Score: 0,
		Cards: [],
        Deal: function (Card) {
            this.Cards.push(Card);
        },
		Clear: function () {
			this.Cards = [];
		},
		Reset: function () {
			this.Cards = [];
			this.Score = 0;
        },
        GetStrategy: function (DealerCard) {
            
            var DealerValue = BJ.GetCardValue(DealerCard);
            var MyHand = BJ.GetHandValue(this.Cards);
            
            var LegalHands = MyHand.filter(function (c) { return c <= 21; });
            
            // "Stay" if the player busts
            if (LegalHands.length === 0) {
                return Moves.Stay;
            }

            var MyCurrentBest = LegalHands[LegalHands.length - 1];
            
            // Stay on all 18s and hard 17s
            if ((LegalHands.length === 1 && MyCurrentBest >= 17) ||
                (LegalHands.length > 1 && MyCurrentBest >= 18)) {
                return Moves.Stay;
            }
            if (MyCurrentBest < 12) {
                return Moves.Hit;
            }
            if (MyCurrentBest < DealerValue[DealerValue.length - 1] + 10) {
                return Moves.Hit;
            }

            return Moves.Stay;
        }
	};
};

var BlackJack = function () {
   'use strict';

    var _Deck = Deck();
    
    var IsBrowser = typeof window !== 'undefined';
    
    var NumericCompare = function (a, b) {
        var A = parseInt(a, 10);
        var B = parseInt(b, 10);

        if (A === B) {
            return 0;
        }
        if (A < B) {
            return -1;
        }
        return 1;
    };

	var BJ = {
        Deck: _Deck,
        Logging: false,
        Log: function (message) {
            if (this.Logging) {
                if (IsBrowser) {
                    var Panel = document.getElementById("output");
                    var P = document.createElement("div");
                    if (P.hasOwnProperty("innerContent")) {
                        P.innerContent = message;
                    }
                    else {
                        P.innerText = message;
                    }
                    Panel.appendChild(P);
                }
                else {
                    console.log(message);
                }
            }
        },
		Dealer: null,
		Player: null,
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
        // Get all possible values for the
        // current hand, including values over 21
		GetHandValue: function (Hand) {
			var i, j, tmp, CardValue;
			
			var PossibleHandValues = [0];

			for (i = 0; i < Hand.length; i++) {
				CardValue = this.GetCardValue(Hand[i]);
				
				if (CardValue.length === 1) {
					for (j = 0; j < PossibleHandValues.length; j++) {
						PossibleHandValues[j] += CardValue[0];
					}
				}
				else if (CardValue.length === 2) {
					tmp = [];
					for (j = 0; j < PossibleHandValues.length; j++) {
						tmp.push(PossibleHandValues[j] + CardValue[1]);
						PossibleHandValues[j] += CardValue[0];
					}

					PossibleHandValues = PossibleHandValues.concat(tmp);
					PossibleHandValues = PossibleHandValues.sort(NumericCompare);
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

			return PossibleHandValues;
        },
        IsSoft: function (Hand) {
            var DealerLegal = Hand.filter(function (c) { return c <= 21; });

            return DealerLegal.length > 1;
        },
        PlayHand: function () {
            var i, Card, Move, PlayerHand, DealerHand, PlayerLegal, DealerLegal;
            
            this.Dealer.Clear();
            this.Player.Clear();

            // Deal player and dealer 2 cards
            for (i = 0; i < 2; i++) {
                Card = this.Deck.Draw();
                if (Card) {
                    this.Log("Player got a card: " + Card);
                    this.Player.Deal(Card);
                }
                else {
                    this.Log("Deck ran out, game over.");
                    return false;
                }
                
                Card = this.Deck.Draw();
                if (Card) {
                    this.Log("Dealer got a card: " + Card);
                    this.Dealer.Deal(Card);
                }
                else {
                    this.Log("Deck ran out, game over.");
                    return false;
                }
            }
            
            // Did dealer blackjack?
            DealerHand = this.GetHandValue(this.Dealer.Cards);
            if (DealerHand[DealerHand.length - 1] === 21) {
                this.Log("Dealer got blackjack, player loses a point.");
                this.Player.Score -= 1;
                return true;
            }
            
            // Did player blackjack?
            PlayerHand = this.GetHandValue(this.Player.Cards);
            if (PlayerHand[PlayerHand.length - 1] === 21) {
                this.Log("Player got blackjack, player gets 1.5 points.");
                this.Player.Score += 1.5;
                return true;
            }
            
            // Player plays
            Move = this.Player.GetStrategy(this.Dealer.Cards[0]);
            while (Move !== Moves.Stay) {
                switch (Move) {
                    case Moves.Hit:
                        this.Log("Player hits.");
                        Card = this.Deck.Draw();
                        if (Card) {
                            this.Log("Player got a card: " + Card);
                            this.Player.Deal(Card);
                        }
                        else {
                            this.Log("Deck ran out, game over.");
                            return false;
                        }
                        break;
                    case Moves.DoubleDown:
                        break;
                    case Moves.Split:
                        break;
                }
                Move = this.Player.GetStrategy(this.Dealer.Cards[0]);
            }
            
            this.Log("Player stays.");
            
            // Did player bust?
            PlayerHand = this.GetHandValue(this.Player.Cards);
            if (PlayerHand[0] > 21) {
                this.Log("Players busts. Loses 1 point.");
                this.Player.Score -= 1;
                return true;
            }

            // Dealer Plays
            DealerHand = this.GetHandValue(this.Dealer.Cards);
            DealerLegal = DealerHand.filter(function (c) { return c <= 21; });
            // Hit on all 16s and soft 17s
            while ((DealerLegal.length === 1 && DealerLegal[0] < 17) ||
                  (DealerLegal.length > 1 && DealerLegal[DealerLegal.length - 1] < 18)) {
                this.Log("Dealer hits.");
                Card = this.Deck.Draw();
                if (Card) {
                    this.Log("Dealer got a card: " + Card);
                    this.Dealer.Deal(Card);
                }
                else {
                    this.Log("Deck ran out, game over.");
                    return false;
                }
                DealerHand = this.GetHandValue(this.Dealer.Cards);
                DealerLegal = DealerHand.filter(function (c) { return c <= 21; });
            }
            
            // Did Dealer bust?
            if (DealerHand[0] > 21) {
                this.Log("Dealer busts, player gets a point.");
                this.Player.Score += 1;
                return true;
            }

            // Who has the best legal score?
            PlayerLegal = PlayerHand.filter(function (c) { return c <= 21; });
            DealerLegal = DealerHand.filter(function (c) { return c <= 21; });

            if (PlayerLegal[PlayerLegal.length - 1] < DealerLegal[DealerLegal.length - 1]) {
                this.Log("Dealer beats player, player loses a point.");
                this.Player.Score -= 1;
            }
            else if (DealerLegal[DealerLegal.length - 1] < PlayerLegal[PlayerLegal.length - 1]) {
                this.Log("Player beats dealer, player gets a point.");
                this.Player.Score += 1;
            }
            else {
                this.Log("Tie, no change in score.");
            }
            return true;
        },
		Reset: function () {
			this.Deck = Deck();
			this.Player = Player(this);
			this.Dealer = Player(this);
			Moves = [];
		}
	};
    BJ.Player = Player(BJ);
    BJ.Dealer = Player(BJ);

	return BJ;
};

var DeterministicPlayer = function (BJ, DeterministicMoves) {
   'use strict';

    var BasePlayer = Player(BJ);

    BasePlayer.GetStrategy = function (DealerCard) {
        var CardsLeft = BJ.Deck.Cards.length;
        var StartOfHand = CardsLeft + 2 + this.Cards.length;
        
        var Hand = BJ.GetHandValue(this.Cards);
        
        if (Hand[0] > 21) {
            return Moves.Stay;
        }

        return DeterministicMoves[StartOfHand][CardsLeft];
    };

    return BasePlayer;
};

var Solver = function () {
   'use strict';

    var BJ = BlackJack();
    
    BJ.Memo = [];
    BJ.Parent = [];

    BJ.Solve = function (DealerCards, PlayerCards, PlayerStrategy, RestOfDeck, StartOfHand, prefix) {
        var i, Card, CurrentDeck, PlayerHand, DealerHand, PlayerLegal, DealerLegal,
            ValueOfStay, ValueOfHit, CurrentDealerCards, CurrentPlayerCards;

        CurrentDealerCards = DealerCards.slice();
        CurrentPlayerCards = PlayerCards.slice();
        CurrentDeck = RestOfDeck.slice();
        
        this.Log(prefix + "Beginning recursion");

        // Deal player and dealer 2 cards
        if (CurrentPlayerCards.length === 0) {
            this.Log(prefix + "Dealing hand");
            for (i = 0; i < 2; i++) {
                Card = CurrentDeck.pop();
                if (Card) {
                    this.Log(prefix + "Player got a card: " + Card);
                    CurrentPlayerCards.push(Card);
                }
                else {
                    this.Log(prefix + "Deck ran out, game over.");
                    return 0;
                }
                
                Card = CurrentDeck.pop();
                if (Card) {
                    this.Log(prefix + "Dealer got a card: " + Card);
                    CurrentDealerCards.push(Card);
                }
                else {
                    this.Log(prefix + "Deck ran out, game over.");
                    return 0;
                }
            }
            
            // Did dealer blackjack?
            DealerHand = this.GetHandValue(CurrentDealerCards);
            if (DealerHand[DealerHand.length - 1] === 21) {
                this.Log(prefix + "Dealer got blackjack, player loses a point.");
                return -1 + this.Solve([], [], null, CurrentDeck.slice(), CurrentDeck.length, prefix + "-");
            }
            
            // Did player blackjack?
            PlayerHand = this.GetHandValue(CurrentPlayerCards);
            if (PlayerHand[PlayerHand.length - 1] === 21) {
                this.Log(prefix + "Player got blackjack, player gets 1.5 points.");
                return 1.5 + this.Solve([], [], null, CurrentDeck.slice(), CurrentDeck.length, prefix + "-");
            }
        }

        // Did player bust?
        PlayerHand = this.GetHandValue(CurrentPlayerCards);
        if (PlayerHand[0] > 21) {
            this.Log(prefix + "Players busts. Loses 1 point.");
            return -1 + this.Solve([], [], null, CurrentDeck.slice(), CurrentDeck.length, prefix + "-");
        }

        // Player plays
        if (PlayerStrategy === null) {
            if (this.Memo[StartOfHand] && CurrentDeck.length === StartOfHand - 4) {
                this.Log(prefix + "We've been here before: using memoized value.");
                return this.Memo[StartOfHand];
            }
            ValueOfStay = this.Solve(CurrentDealerCards.slice(), CurrentPlayerCards.slice(), Moves.Stay, CurrentDeck.slice(), StartOfHand, prefix + "-");
            ValueOfHit = this.Solve(CurrentDealerCards.slice(), CurrentPlayerCards.slice(), Moves.Hit, CurrentDeck.slice(), StartOfHand, prefix + "-");
            
            if (!this.Parent[StartOfHand]) {
                this.Parent[StartOfHand] = [];
            }
            
            if (ValueOfStay >= ValueOfHit) {
                this.Parent[StartOfHand][CurrentDeck.length] = Moves.Stay;
            }
            else {
                this.Parent[StartOfHand][CurrentDeck.length] = Moves.Hit;
            }

            if (CurrentDeck.length === StartOfHand - 4) {
                this.Log(prefix + "Memoizing for later (Start position: " + StartOfHand.toString() +")");
                this.Memo[StartOfHand] = Math.max(ValueOfHit, ValueOfStay);
            }
            return Math.max(ValueOfHit, ValueOfStay);
        }

        switch (PlayerStrategy) {
            case Moves.Hit:
                this.Log(prefix + "Player hits.");
                Card = CurrentDeck.pop();
                if (Card) {
                    this.Log(prefix + "Player got a card: " + Card);
                    CurrentPlayerCards.push(Card);
                    return this.Solve(CurrentDealerCards.slice(), CurrentPlayerCards.slice(), null, CurrentDeck.slice(), StartOfHand, prefix + "-");
                }
                else {
                    this.Log(prefix + "Deck ran out, game over.");
                    return 0;
                }
                break;
            case Moves.DoubleDown:
                break;
            case Moves.Split:
                break;
            case Moves.Stay:
                this.Log(prefix + "Player stays.");
                break;
            default:
                throw "Invalid player strategy.";
        }
        
        // Dealer Plays
        DealerHand = this.GetHandValue(CurrentDealerCards);
        DealerLegal = DealerHand.filter(function (c) { return c <= 21; });
        // Hit on all 16s and soft 17s
        while ((DealerLegal.length === 1 && DealerLegal[0] < 17) ||
              (DealerLegal.length > 1 && DealerLegal[DealerLegal.length - 1] < 18)) {
            this.Log(prefix + "Dealer hits.");
            Card = CurrentDeck.pop();
            if (Card) {
                this.Log(prefix + "Dealer got a card: " + Card);
                CurrentDealerCards.push(Card);
            }
            else {
                this.Log(prefix + "Deck ran out, game over.");
                return 0;
            }
            DealerHand = this.GetHandValue(CurrentDealerCards);
            DealerLegal = DealerHand.filter(function (c) { return c <= 21; });
        }
        
        // Did Dealer bust?
        if (DealerHand[0] > 21) {
            this.Log(prefix + "Dealer busts, player gets a point.");
            return 1 + this.Solve([], [], null, CurrentDeck.slice(), CurrentDeck.length, prefix + "-");
        }

        // Who has the best legal score?
        PlayerHand = this.GetHandValue(CurrentPlayerCards);
        PlayerLegal = PlayerHand.filter(function (c) { return c <= 21; });
        DealerLegal = DealerHand.filter(function (c) { return c <= 21; });

        if (PlayerLegal[PlayerLegal.length - 1] < DealerLegal[DealerLegal.length - 1]) {
            this.Log(prefix + "Dealer beats player, player loses a point.");
            return -1 + this.Solve([], [], null, CurrentDeck.slice(), CurrentDeck.length, prefix + "-");
        }
        else if (DealerLegal[DealerLegal.length - 1] < PlayerLegal[PlayerLegal.length - 1]) {
            this.Log(prefix + "Player beats dealer, player gets a point.");
            return 1 + this.Solve([], [], null, CurrentDeck.slice(), CurrentDeck.length, prefix + "-");
        }
        else {
            this.Log(prefix + "Tie, no change in score.");
            return this.Solve([], [], null, CurrentDeck.slice(), CurrentDeck.length, prefix + "-");
        }
    };

    return BJ;
};

//var Card;
//var MyDeck = Deck();

//MyDeck.Shuffle();
//while (Card = MyDeck.Draw()) {
//	console.log(Card);
//}

if (typeof exports !== 'undefined') {
    exports.BlackJack = BlackJack;
    exports.Deck = Deck;
    exports.Player = Player;
    exports.Moves = Moves;
    exports.Solver = Solver;
    exports.DeterministicPlayer = DeterministicPlayer;
}