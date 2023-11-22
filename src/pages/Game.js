import React, { useState, useEffect, useContext } from 'react'
import { GiClubs, GiHearts, GiSpades, GiDiamonds } from 'react-icons/gi' 
import { FaEthereum } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Confetti from '../components/Confetti';
import { useParams } from 'react-router-dom'
import { db } from '../firebase'
import { ethers } from "ethers";
import { ref, set, onValue } from 'firebase/database'
import { CurrentAccountContext } from '../components/App'

import './Game.css';

export default function Game() {

    // To do
    // design game state - bottom cards, game status for down cards etc


    // Game flow
    // both players sign to be ready?
    // shuffle cards & deal
    // render cards if you are one of the players
    // if you're not one of the players you can still observe
    // 

    const { gameId } = useParams();

    // Current Acc that has signed
    const [currentETHAccount, setCurrentETHAccount] = useContext(CurrentAccountContext);


    // Deck State
    const [deck, setDeck] = useState([
      'Ts', 'Th', 'Tc', 'Td',
      '8s', '8h', '8c', '8d',
      '2s', '2h', '2c', '2d',
      'As', 'Ah', 'Ac', 'Ad',
      'Ks', 'Kh', 'Kc', 'Kd',
      'Qs', 'Qh', 'Qc', 'Qd',
      'Js', 'Jh', 'Jc', 'Jd',
      '9s', '9h', '9c', '9d',
      '7s', '7h', '7c', '7d',
      '6s', '6h', '6c', '6d',
      '5s', '5h', '5c', '5d',
      '4s', '4h', '4c', '4d',
      '3s', '3h', '3c', '3d',
    ])
    // Cards State
    // Player One
    const [playerOneSelectedCards, setPlayerOneSelectedCards] = useState([])
    const [playerOneCards, setPlayerOneCards] = useState([
      // 'Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah'
    ])
    const [playerOneDownCards, setPlayerOneDownCards] = useState([])
    const [playerOneSetCards, setPlayerOneSetCards] = useState([])
    // Player Two
    const [playerTwoCards, setPlayerTwoCards] = useState([
      // 'Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah','Ah',
    ])
    const [playerTwoDownCards, setPlayerTwoDownCards] = useState([])
    const [playerTwoSetCards, setPlayerTwoSetCards] = useState([])
    // Game Cards
    const [remainingDeck, setRemainingDeck] = useState([])
    const [discardPile, setDiscardPile] = useState([])
    const [playPile, setPlayPile] = useState([])
    // Game State
    const [thisGameId, setThisGameId] = useState('')
    const [playerOne, setPlayerOne] = useState('')
    const [playerTwo, setPlayerTwo] = useState('')
    const [gameStage, setGameStage] = useState('')
    const [gameStatus, setGameStatus] = useState('')
    const [playerOneReady, setPlayerOneReady] = useState('')
    const [playerTwoReady, setPlayerTwoReady] = useState('')
    const [playerOneShowDown, setPlayerOneShowDown] = useState('')
    const [playerTwoShowDown, setPlayerTwoShowDown] = useState('')
    const [gameStarted, setGameStarted] = useState(false)
    const [playerTurn, setPlayerTurn] = useState('')
    const [nonPlayerWatching, setNonPlayerWatching] = useState(false)
    const [gameWon, setGameWon] = useState(false)

    useEffect(() => {
      onValue(ref(db, `games/${gameId}`), (snapshot) => {
        const game = snapshot.val();
        if (game !== null) {
          setThisGameId(game.gameId)
          setPlayerOne(game.playerOne || "") 
          setPlayerTwo(game.playerTwo || "")
          setPlayerOneReady(game.playerOneReady || "No") 
          setPlayerTwoReady(game.playerTwoReady || "No") 
        }

        if(game.status === "Waiting for players") {
          setGameStatus(game.status)
          return;
        } else {
          setGameStatus(game.status)
        }
        // Set game stage if in db
        if(game.stage) {
          setGameStage(game.stage)
        }
        // listen for both players ready then deal cards
        if(game.playerOneReady === "Yes" &&
            game.playerTwoReady === "Yes" &&
            game.gameStarted !== "Yes") {
            shuffleUpAndDeal()
        }
        
        const newPlayerOneCards = [];
        if (game.playerOneCards) {
          Object.keys(game.playerOneCards).forEach(function(key, index) {
            newPlayerOneCards.push(game.playerOneCards[key])
          })
        }
        const newPlayerTwoCards = [];
        if (game.playerTwoCards) {
          Object.keys(game.playerTwoCards).forEach(function(key, index) {
            newPlayerTwoCards.push(game.playerTwoCards[key])
          })
        }
        const newPlayerOneDownCards = [];
        if (game.playerOneDownCards) {
          Object.keys(game.playerOneDownCards).forEach(function(key, index) {
            newPlayerOneDownCards.push(game.playerOneDownCards[key])
          })
        }
        const newPlayerTwoDownCards = [];
        if (game.playerTwoDownCards) {
          Object.keys(game.playerTwoDownCards).forEach(function(key, index) {
            newPlayerTwoDownCards.push(game.playerTwoDownCards[key])
          })
        }

        if (currentETHAccount === game.playerOne) {
          setPlayerOneCards(newPlayerOneCards);
          setPlayerTwoCards(newPlayerTwoCards);
          setPlayerOneDownCards(newPlayerOneDownCards);
          setPlayerTwoDownCards(newPlayerTwoDownCards);
        } else if (currentETHAccount === game.playerTwo) {
        // put playerTwo data in playerOne and visa versa then
        // front end just assumes playerOne is current player
          setPlayerOne(game.playerTwo)
          setPlayerTwo(game.playerOne)
          setPlayerOneCards(newPlayerTwoCards);
          setPlayerTwoCards(newPlayerOneCards);
          setPlayerOneDownCards(newPlayerTwoDownCards);
          setPlayerTwoDownCards(newPlayerOneDownCards);
        } else { // If non-player watching
          setNonPlayerWatching(true)
          const nonVisiblePlayerOneCards = newPlayerOneCards.map(() => '')
          setPlayerOneCards(nonVisiblePlayerOneCards);
          setPlayerTwoCards(newPlayerTwoCards);
          setPlayerOneDownCards(newPlayerOneDownCards);
          setPlayerTwoDownCards(newPlayerTwoDownCards);
        }
        // SET PLAYER CARDS DEPENDING ON ETH ADDRESS
        if (currentETHAccount === game.playerOne) {
          // set playerOneSetCards if it they exist
          if(game.playerOneSetCards) {
            const newplayerOneSetCards = []
            Object.keys(game.playerOneSetCards).forEach(function(key, index) {
              newplayerOneSetCards.push(game.playerOneSetCards[key])
            })
            setPlayerOneSetCards(newplayerOneSetCards)
          } else {
            setPlayerOneSetCards([])
          }
          // set playerTwoSetCards if it they exist
          if(game.playerTwoSetCards) {
            const newplayerTwoSetCards = []
            Object.keys(game.playerTwoSetCards).forEach(function(key, index) {
              newplayerTwoSetCards.push(game.playerTwoSetCards[key])
            })
            setPlayerTwoSetCards(newplayerTwoSetCards)
          } else {
            setPlayerTwoSetCards([])
          }
          // set playerTurn if it they exist
          if(game.playerTurn) {
            setPlayerTurn(game.playerTurn) // 'Player One' or 'Player Two'
          }
        } else if (currentETHAccount === game.playerTwo) {
          // set playerOneSetCards if it they exist
          if(game.playerOneSetCards) {
            const newplayerOneSetCards = []
            Object.keys(game.playerOneSetCards).forEach(function(key, index) {
              newplayerOneSetCards.push(game.playerOneSetCards[key])
            })
            setPlayerTwoSetCards(newplayerOneSetCards)
          } else {
            setPlayerTwoSetCards([])
          }
          // set playerTwoSetCards if it they exist
          if(game.playerTwoSetCards) {
            const newplayerTwoSetCards = []
            Object.keys(game.playerTwoSetCards).forEach(function(key, index) {
              newplayerTwoSetCards.push(game.playerTwoSetCards[key])
            })
            setPlayerOneSetCards(newplayerTwoSetCards)
          } else {
            setPlayerOneSetCards([])
          }
          // set playerTurn if it exist
          if(game.playerTurn) {
            const newPlayerTurn = game.playerTurn === 'Player Two' ? 'Player One' : 'Player Two'
            setPlayerTurn(newPlayerTurn) // 'Player One' or 'Player Two'
          }
        } else { // display set cards for observers
          // set playerOneSetCards if they exist
          if(game.playerOneSetCards) {
            const newplayerOneSetCards = []
            Object.keys(game.playerOneSetCards).forEach(function(key, index) {
              newplayerOneSetCards.push(game.playerOneSetCards[key])
            })
            setPlayerOneSetCards(newplayerOneSetCards)
          } else {
            setPlayerOneSetCards([])
          }
          // set playerTwoSetCards if it they exist
          if(game.playerTwoSetCards) {
            const newplayerTwoSetCards = []
            Object.keys(game.playerTwoSetCards).forEach(function(key, index) {
              newplayerTwoSetCards.push(game.playerTwoSetCards[key])
            })
            setPlayerTwoSetCards(newplayerTwoSetCards)
          } else {
            setPlayerTwoSetCards([])
          }

        }
        // LISTEIN FOR GAME EVENTS
        // when both players have set change to Main Stage
        if(game.playerTwoSetCards && game.playerOneSetCards &&
          (game.playerOneCards && game.playerTwoCards)) {
          setComplete();
        }
        // set playPile if it exists
        if(game.playPile) {
          const newplayPile = []
          Object.keys(game.playPile).forEach(function(key, index) {
            newplayPile.push(game.playPile[key])
          })
          setPlayPile(newplayPile)
        } else {
          setPlayPile([])
        }
        // set remainingDeck if it exists
        if(game.remainingDeck) {
          const newremainingDeck = []
          Object.keys(game.remainingDeck).forEach(function(key, index) {
            newremainingDeck.push(game.remainingDeck[key])
          })
          setRemainingDeck(newremainingDeck)
        } else {
          setRemainingDeck([])
        }
        // set discardPile if it exists
        if(game.discardPile) {
          const newDiscardPile = []
          Object.keys(game.discardPile).forEach(function(key, index) {
            newDiscardPile.push(game.discardPile[key])
          })
          setDiscardPile(newDiscardPile)
        } else {
          setDiscardPile([])
        }
        // set playerOneShowDown if it they exist
        if(game.playerOneShowDown) {
          setPlayerOneShowDown(game.playerOneShowDown)
        }
        // set playerTwoShowDown if it they exist
        if(game.playerTwoShowDown) {
          setPlayerTwoShowDown(game.playerTwoShowDown)
        }
        if(currentETHAccount === game.playerOne || currentETHAccount === game.playerTwo) {
          setNonPlayerWatching(false)
        }
      })
    }, [currentETHAccount, gameStarted])

    const joinGame = async (e, gameId, playerOne) => {
      e.preventDefault()

      // check if metamask exists
      if(!window.ethereum) {
          // install metamask prompt
          toast.error("You need to install MetaMask!", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 2000
          })
          return;
      }

      const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
      });

      const currentAccount = accounts[0].toLowerCase();
      setCurrentETHAccount(currentAccount)

      if(currentAccount === playerOne) {
          toast.error("You cannot play with yourself... No that's not a challenge", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 2000
          })
          return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const message = 'Join Game vs ' + playerOne + '?'
      const signature = await signer.signMessage(message)
      const address = ethers.utils.verifyMessage(message, signature).toLowerCase()

      // get game state
      let game = {}
      onValue(ref(db, `games/${gameId}`), (snapshot) => {
          game = snapshot.val();
      });

      if(address === currentAccount) {

        // Logs player in if hasn't been already
        setCurrentETHAccount(currentAccount)

        set(ref(db, 'games/' + gameId ), {
            ...game,
            playerTwo: currentAccount,
            status: 'Waiting for players to be ready',
            stage: 'Set',
            currentPlayers: 2,
            playerOneReady: 'No',
            playerTwoReady: 'No',
        })
      } else {
        // signature invalid  prompt
        toast.error("That didn't work... Please try again.", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000
        })
      }
      toast.success("You joined the game!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000
      })
    }

    const playerReady = async (e, gameId) =>{
      e.preventDefault()

      // check if metamask exists
      if(!window.ethereum) {
          // install metamask prompt
          toast.error("You need to install MetaMask!", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 2000
          })
          return;
      }

      const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
      });
  
      const currentAccount = accounts[0].toLowerCase();
      setCurrentETHAccount(currentAccount)

      if(currentAccount !== playerOne && currentAccount !== playerTwo) {
        toast.error("You need to be a player to start this game", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000
        })
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const message = 'Confirm you are ready?'
      const signature = await signer.signMessage(message)
      const address = ethers.utils.verifyMessage(message, signature).toLowerCase()


      if(address === currentAccount) {

        // Logs player in if hasn't been already
        setCurrentETHAccount(currentAccount)

        // get game state
        let game = {}
        onValue(ref(db, `games/${gameId}`), (snapshot) => {
          game = snapshot.val();
        });

        let playerOneReady = game.playerOneReady === "Yes" ? "Yes" : "No"
        let playerTwoReady = game.playerTwoReady === "Yes" ? "Yes" : "No"

        if(currentAccount === game.playerOne) {
          playerOneReady = "Yes"
        } else if (currentAccount === game.playerTwo){
          playerTwoReady = "Yes"
        }

        let gameStatus = game.status
        if(playerOneReady === "Yes" &&
          playerTwoReady === "Yes") {
          gameStatus = 'Game Started'
        }
        // Update Game info and start game
        set(ref(db, 'games/' + gameId ), {
            ...game,
            status: gameStatus,
            playerOneReady,
            playerTwoReady,
        })
      } else {
        // signature invalid  prompt
        toast.error("That didn't work... Please try again.", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000
        })
      }
      toast.success("You joined the game!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000
      })
    }
  
    const determinePlayerTurn = (playerOneCardsArr, playerTwoCardsArr) => {
      // TODO Figure better algo for this. I'm thinking loop through cards get lowest value
      // then set player turn to whoever has the lowest card then if tie go by suit
      if (playerOneCardsArr.includes('3c')) {
        return 'Player One'
      } else if (playerTwoCardsArr.includes('3c')) {
        return 'Player Two'
      } else if (playerOneCardsArr.includes('3s')) {
        return 'Player One'
      } else if (playerTwoCardsArr.includes('3s')) {
        return 'Player Two'
      } else if (playerOneCardsArr.includes('3d')) {
        return 'Player One'
      } else if (playerTwoCardsArr.includes('3d')) {
        return 'Player Two'
      } else if (playerOneCardsArr.includes('3h')) {
        return 'Player One'
      } else if (playerTwoCardsArr.includes('3h')) {
        return 'Player Two'
      } else {
        const randomNum = Math.floor(Math.random() * (2 - 1 + 1) + 1)
        if (randomNum === 1) {
          return 'Player One'
        }
        if (randomNum === 2) {
          return 'Player Two'
        }
      }
    }

    const shuffleUpAndDeal = () => {
      // Shuffles Deck a brand new deck
      const remainingDeck = shuffle(deck);
      const playerOneCards = [];
      const playerTwoCards = [];
      const playerOneDownCards = [];
      const playerTwoDownCards = [];
      // Deal
      // define who's turn
      let playerOneTurn = false;
      // Deal Defs
      const dealDownCards = () => {
        if(playerOneDownCards.length === 4 || playerTwoDownCards === 4) {
          return
        }
        if(playerOneTurn) {
          // Deal to player One
          playerOneDownCards.push(remainingDeck.pop());
          // change turne
          playerOneTurn = !playerOneTurn
          return
        }
        if(!playerOneTurn) {
          // Deal to player Two
          playerTwoDownCards.push(remainingDeck.pop());
          // change turne
          playerOneTurn = !playerOneTurn
          return
        }
      }
      const dealPlayerCards = () => {
        if(playerOneTurn) {
          // Deal to player One
          playerOneCards.push(remainingDeck.pop());
          // change turne
          playerOneTurn = !playerOneTurn
          return
        }
        if(!playerOneTurn) {
          // Deal to player Two
          playerTwoCards.push(remainingDeck.pop());
          // change turne
          playerOneTurn = !playerOneTurn
          return
        }
      }
      while ((playerOneDownCards.length + playerTwoDownCards.length) < 8 ) {
        dealDownCards()
      }
      while (deck.length > 26) {
        dealPlayerCards()
      }

      // Get Game State
      let game = {}
      onValue(ref(db, `games/${gameId}`), (snapshot) => {
          game = snapshot.val();
      });
      
      // Determine player turn 
      const playerTurn = determinePlayerTurn(playerOneCards, playerTwoCards)

      // Set Game State
      set(ref(db, 'games/' + gameId ), {
          ...game,
          remainingDeck,
          playerOneCards,
          playerTwoCards,
          playerOneDownCards,
          playerTwoDownCards,
          playerTurn,
          stage: 'Set',
          gameStarted: 'Yes',
      }) 
      setGameStarted(true)
    }

    const playCards = () => {
      // handle errors before db call
      if(playerOneSelectedCards.length < 4 && gameStage === 'Set') {
        toast.error("You need to choose 4 cards as Set Cards!", {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 2000
        })
      return
      }
      // HERE 
      if(playerTurn !== "Player One" && (gameStage === 'Main Stage' || gameStage === 'Show Down')) {
          toast.error("Wait until it's your turn to make a move!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000
        })
      return
      }
      
      // Get Game State
      let game = {}
      onValue(ref(db, `games/${gameId}`), (snapshot) => {
          game = snapshot.val();
      });

      // Set Stage
      if(gameStage === 'Set') {
        // remove selected cards from player 1 cards
        const newPlayerOneCards = playerOneCards.filter( (card) => !playerOneSelectedCards.includes(card) );
        // append to set cards
        const newPlayerOneSetCards = [...playerOneSelectedCards]

        if(currentETHAccount === game.playerOne) {
          set(ref(db, 'games/' + gameId ), {
            ...game,
            playerOneCards: newPlayerOneCards,
            playerOneSetCards: newPlayerOneSetCards,
          })
        } else if (currentETHAccount === game.playerTwo) {
          set(ref(db, 'games/' + gameId ), {
            ...game,
            playerTwoCards: newPlayerOneCards,
            playerTwoSetCards: newPlayerOneSetCards,
          })
        }
      }
      // Main Stage
      if(gameStage === 'Main Stage' || gameStage === 'Show Down') {
        let changePlayerTurn = true; // change if bomb

        let thisTurnOutcome = getThisTurnOutcome(playerOneSelectedCards, playPile)

        if(thisTurnOutcome === 'Cannot be played') {
          toast.error(`You can't play a ${playerOneSelectedCards[0].split('')[0]} on a ${playPile[playPile.length - 1].split('')[0]}!`, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000
          })
          return;
        }
        // TODO Handle Bomb, Handle finishing hand cards and going to show down stage

                
        if (thisTurnOutcome === 'Can be played' && playerOneSelectedCards.length === 4) {
          thisTurnOutcome = 'Bomb';
        }
        // Bomb handling
        if (thisTurnOutcome === 'Bomb') {
          changePlayerTurn = false;
        }

        let currentDiscardPile = []
        if(game.discardPile) {
          Object.keys(game.discardPile).forEach(function(key, index) {
            currentDiscardPile.push(game.discardPile[key])
          })
        }
        const currentPlayPile = []
        if(game.playPile) {
          Object.keys(game.playPile).forEach(function(key, index) {
            currentPlayPile.push(game.playPile[key])
          })
        }
      
        // remove selected cards from player 1 cards
        let newPlayerOneCards = playerOneCards.filter( (card) => !playerOneSelectedCards.includes(card) );
        // append to playpile
        const newPlayPile = [ ...currentPlayPile, ...playerOneSelectedCards]
        // Take card from remaining Deck and add to player card if < 5 cards in player hand
        let newRemainingDeck = []
        if(game.remainingDeck) {
          Object.keys(game.remainingDeck).forEach(function(key, index) {
            newRemainingDeck.push(game.remainingDeck[key])
          })
        }
        // draw up to five cards
        if (newRemainingDeck.length && // there are remainingCards & player needs to pick up
            newPlayerOneCards.length < 5) {
          const numOfCardsToPickUp = 5 - newPlayerOneCards.length
          if(numOfCardsToPickUp > newRemainingDeck.length) { // pick up whole deck if you need to pick up more cards than left
            newPlayerOneCards = [...newPlayerOneCards, ...newRemainingDeck]
          } else {
            const cardsToPickUp = newRemainingDeck.splice(-numOfCardsToPickUp, numOfCardsToPickUp)
            newPlayerOneCards = [...newPlayerOneCards, ...cardsToPickUp]
          }
        }

        // handle setPlayPile if bomb occurs 
        if (thisTurnOutcome === 'Bomb') {
          setPlayPile([])
        }

        const newGameStage = newPlayerOneCards.length ? game.stage : 'Show Down';
        
        const playerInShowDownStage = newPlayerOneCards.length < 0 ? 'Yes' : ''

        if(currentETHAccount === game.playerOne) {
          set(ref(db, 'games/' + gameId ), {
            ...game,
            playerOneCards: newPlayerOneCards,
            playPile: thisTurnOutcome === 'Bomb' ? [] : newPlayPile,
            remainingDeck: newRemainingDeck,
            stage: newGameStage,
            playerOneShowDown: playerInShowDownStage,
            playerTurn: changePlayerTurn ? 'Player Two' : 'Player One',
            discardPile: thisTurnOutcome === 'Bomb' ? [...currentDiscardPile, ...newPlayPile] : currentDiscardPile
          })
        } else if (currentETHAccount === game.playerTwo) {
          set(ref(db, 'games/' + gameId ), {
            ...game,
            playerTwoCards: newPlayerOneCards,
            playPile: thisTurnOutcome === 'Bomb' ? [] : newPlayPile,
            remainingDeck: newRemainingDeck,
            stage: newGameStage,
            playerTwoShowDown: playerInShowDownStage,
            playerTurn: changePlayerTurn ? 'Player One' : 'Player Two',
            discardPile: thisTurnOutcome === 'Bomb' ? [...currentDiscardPile, ...newPlayPile] : currentDiscardPile
          })
        }

        // Handle if player is on set cards
        if(!playerOneCards.length) {
          // Selected cards should be set cards here
          let thisTurnOutcome = getThisTurnOutcome(playerOneSelectedCards, playPile)

          // remove selected cards from player 1 cards
          let newSetCards = playerOneSetCards.filter( (card) => !playerOneSelectedCards.includes(card) );

          // append to playpile
          const newPlayPile = [ ...currentPlayPile, ...playerOneSelectedCards]

          // handle setPlayPile if bomb occurs 
          if (thisTurnOutcome === 'Bomb') {
            setPlayPile([])
          }

          if(currentETHAccount === game.playerOne) {
            set(ref(db, 'games/' + gameId ), {
              ...game,
            playPile: thisTurnOutcome === 'Bomb' ? [] : newPlayPile,
              playerOneSetCards: newSetCards,
              discardPile: thisTurnOutcome === 'Bomb' ? [...currentDiscardPile, ...newPlayPile] : currentDiscardPile
            })
          } else if (currentETHAccount === game.playerTwo) {
            set(ref(db, 'games/' + gameId ), {
              ...game,
            playPile: thisTurnOutcome === 'Bomb' ? [] : newPlayPile,
              playerTwoSetCards: newSetCards,
              discardPile: thisTurnOutcome === 'Bomb' ? [...currentDiscardPile, ...newPlayPile] : currentDiscardPile
            })
          }
        }
      }
      handleClearSelectedCards();
      // Check for win
      if(playerOneDownCards.length < 1 && playerOneSetCards.length < 0 && playerOneDownCards.length < 0) {
        handleWinGame()
      }
    }

    const playDownCard = (card) => {
      debugger
      if(playerOneSetCards.length > 0 || playerOneCards.length > 0) {
        return;
      }
      
      // Get Game State
      let game = {}
      onValue(ref(db, `games/${gameId}`), (snapshot) => {
          game = snapshot.val();
      });

      let changePlayerTurn = true;

      const currentPlayPile = []
      if(game.playPile) {
        Object.keys(game.playPile).forEach(function(key, index) {
          currentPlayPile.push(game.playPile[key])
        })
      }

      let currentDiscardPile = []
      if(game.discardPile) {
        Object.keys(game.discardPile).forEach(function(key, index) {
          currentDiscardPile.push(game.discardPile[key])
        })
      }

      let thisTurnOutcome = getThisTurnOutcome([card], currentPlayPile)

      if(thisTurnOutcome === 'Bomb' || thisTurnOutcome === 'Cannot be played') {
        changePlayerTurn = false;
      }
      // Throw error if the down card is invalid
      if(thisTurnOutcome === 'Cannot be played') {
        toast.error(`You can't play a ${card[0].split('')[0]} on a ${playPile[playPile.length - 1].split('')[0]}!
        You're going to have to pick up the play pile!`, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 3500
        })
      }

      // remove selected cards from player 1 cards
      let newDownCards = playerOneDownCards.filter( (cards) => cards !== card );

      const newPlayPile = [...currentPlayPile, card]

      // Updates db
      if(currentETHAccount === game.playerOne) {
        set(ref(db, 'games/' + gameId ), {
          ...game,
          playerTurn: changePlayerTurn ? 'Player Two' : 'Player One',
          playerOneDownCards: newDownCards,
          playPile: thisTurnOutcome === 'Bomb' ? [] : newPlayPile,
          discardPile: thisTurnOutcome === 'Bomb' ? [...currentDiscardPile, ...newPlayPile] : currentDiscardPile
        })
      } else if (currentETHAccount === game.playerTwo) {
        set(ref(db, 'games/' + gameId ), {
          ...game,
          playerTurn: changePlayerTurn ? 'Player One' : 'Player Two',
          playerTwoDownCards: newDownCards,
          playPile: thisTurnOutcome === 'Bomb' ? [] : newPlayPile,
          discardPile: thisTurnOutcome === 'Bomb' ? [...currentDiscardPile, ...newPlayPile] : currentDiscardPile
        })
      }
      // Check for win
      if(newDownCards.length === 0 && thisTurnOutcome === 'Can be played') {
        handleWinGame();
      }
    }

    const handleWinGame = () => {
      // Render the fun stuff
      setGameWon(true)
      toast.success(`Congratulations! You've won!!`, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000
      })
      // update database
      // Get Game State
      let game = {}
      onValue(ref(db, `games/${gameId}`), (snapshot) => {
          game = snapshot.val();
      });
      let winnerAccount = {}
      let loserAccount = {}
      if(currentETHAccount === game.playerOne) {
        set(ref(db, 'games/' + gameId ), {
          ...game,
          winner: game.playerOne,
          loser:game.playerTwo,
        })
        // Update Accounts Data
        // Update Winner Account
        onValue(ref(db, `accounts/${game.playerOne}`), (snapshot) => {
          winnerAccount = snapshot.val();
        });
        set(ref(db, `accounts/${game.playerOne}`), {
          ...winnerAccount,
          gamesWon: winnerAccount.gamesWon ? winnerAccount.gamesWon + 1 : 1
        })
        // Update Loser Account
        onValue(ref(db, `accounts/${game.playerTwo}`), (snapshot) => {
          loserAccount = snapshot.val();
        });
        set(ref(db, `accounts/${game.playerTwo}`), {
          ...loserAccount,
          gamesLost: loserAccount.gamesLost ? loserAccount.gamesLost + 1 : 1
        })
      } else if (currentETHAccount === game.playerTwo) {
        set(ref(db, 'games/' + gameId ), {
          ...game,
          winner: game.playerTwo,
          loser: game.playerOne,
        })
        // Update Accounts Data
        // Update Winner Account
        onValue(ref(db, `accounts/${game.playerTwo}`), (snapshot) => {
          winnerAccount = snapshot.val();
        });
        set(ref(db, `accounts/${game.playerTwo}`), {
          ...winnerAccount,
          gamesWon: winnerAccount.gamesWon ? winnerAccount.gamesWon + 1 : 1
        })
        // Update Loser Account
        onValue(ref(db, `accounts/${game.playerOne}`), (snapshot) => {
          loserAccount = snapshot.val();
        });
        set(ref(db, `accounts/${game.playerOne}`), {
          ...loserAccount,
          gamesLost: loserAccount.gamesLost ? loserAccount.gamesLost + 1 : 1
        })
      }
      // TODO - update database to game ended and probs all functions to not do anything if game ended is true
      // listen for game ended on useeffect and listen for game winner
      // display who won etc. 
    }

    const pickUp = () => {
      if(playerTurn !== "Player One") {
          toast.error("Wait until it's your turn to make a move!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000
        })
      return
      }
      // Get Game State
      let game = {}
      onValue(ref(db, `games/${gameId}`), (snapshot) => {
          game = snapshot.val();
      });

      let oldPlayPile = [];

      if(game.playPile) {
        Object.keys(game.playPile).forEach(function(key, index) {
          oldPlayPile.push(game.playPile[key])
        })
      }
      let newPlayerCards = [];

      if(currentETHAccount === game.playerOne) {

        if(game.playerOneCards) {
          Object.keys(game.playerOneCards).forEach(function(key, index) {
            newPlayerCards.push(game.playerOneCards[key])
          })
        }

        set(ref(db, 'games/' + gameId ), {
          ...game,
          playerOneCards: [...newPlayerCards, ...oldPlayPile],
          playPile: [],
          playerTurn: 'Player Two'
        })
      } else if (currentETHAccount === game.playerTwo) {

        if(game.playerTwoCards) {
          Object.keys(game.playerTwoCards).forEach(function(key, index) {
            newPlayerCards.push(game.playerTwoCards[key])
          })
        }

        set(ref(db, 'games/' + gameId ), {
          ...game,
          playerTwoCards: [...newPlayerCards, ...oldPlayPile],
          playPile: [],
          playerTurn: 'Player One'
        })
      }
      setPlayPile([])
    }

    const setComplete = () => {
      // get game state
      let game = {}
      onValue(ref(db, `games/${gameId}`), (snapshot) => {
        game = snapshot.val();
      });
      // Update gameStage to Main Stage
      set(ref(db, 'games/' + gameId ), {
        ...game,
        stage: 'Main Stage'
      })
    }

    const handleSelectCard = (e,card) => {
      if(nonPlayerWatching) {
        return; // exit function if not a player
      }
      // throw error if select different card value in non facedown stage of game
      if(gameStage === 'Main Stage') {
        // you cannot select cards of different values
        let selectedCardValueArr = []
        playerOneSelectedCards.map((card => {
          selectedCardValueArr.push(card.split('')[0]) 
        }))
        const sameCardSelected = selectedCardValueArr.includes(card[0])
        if(!sameCardSelected) {
          setPlayerOneSelectedCards([card])
          return
        }
      }
      const cardInPlayerHand = playerOneSelectedCards.includes(card)
      if(!cardInPlayerHand) {
        // throw error if more than 4 selected cards
        if(playerOneSelectedCards.length === 4) {
          toast.error("You can't select more than 4 cards!", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 2000
          })
          return;
        }
        setPlayerOneSelectedCards([...playerOneSelectedCards, card])
      }
      // Removes card from playerOneSelectedCards
      if(cardInPlayerHand) {
        const oldArray = playerOneSelectedCards
        const newArray = []
        oldArray.map((item) => {
          if(item !== card){
            newArray.push(item)
          }
        })
        setPlayerOneSelectedCards(newArray)
      }
    }

    const handleClearSelectedCards = () => {
      setPlayerOneSelectedCards([])
    }

    const handleMouseEnter = (e) => {
      if(nonPlayerWatching) {
        return; // exit function if not a player
      }
      e.currentTarget.classList.add('cardHover');
    }

    const handleMouseLeave = (e) => {
      e.currentTarget.classList.remove('cardHover');
    }

    const handleSelectSetCard = (e,card) => {
      if(nonPlayerWatching) {
        return; // exit function if not a player
      }
      // throw error if select different card value in non facedown stage of game
      if(gameStage !== 'Show Down') {
        return
      }
      // you cannot select cards of different values
      let selectedCardValueArr = []
      playerOneSelectedCards.map((card => {
        selectedCardValueArr.push(card.split('')[0]) 
      }))
      const sameCardSelected = selectedCardValueArr.includes(card[0])
      if(!sameCardSelected) {
        setPlayerOneSelectedCards([card])
        return
      }
      const cardInPlayerHand = playerOneSelectedCards.includes(card)
      if(!cardInPlayerHand) {
        // throw error if more than 4 selected cards
        if(playerOneSelectedCards.length === 4) {
          toast.error("You can't select more than 4 cards!", {
              position: toast.POSITION.TOP_CENTER,
              autoClose: 2000
          })
          return;
        }
        setPlayerOneSelectedCards([...playerOneSelectedCards, card])
      }
      // Removes card from playerOneSelectedCards
      if(cardInPlayerHand) {
        const oldArray = playerOneSelectedCards
        const newArray = []
        oldArray.map((item) => {
          if(item !== card){
            newArray.push(item)
          }
        })
        setPlayerOneSelectedCards(newArray)
      }
    }

    const handleMouseEnterSetCard = (e) => {
      if(nonPlayerWatching) {
        return; // exit function if not a player
      }
      if(gameStage !== 'Show Down') {
        return
      }
      e.currentTarget.classList.add('cardHover');
    }

    const handleMouseLeaveSetCard = (e) => {
      if(gameStage !== 'Show Down') {
        return
      }
      e.currentTarget.classList.remove('cardHover');
    }

    // Game Logic Helper & Helper Functions
    const getThisTurnOutcome = (arrayOfCardsToPlay, playPileArray) => {
      debugger // TODO If 8 is only card on play pile it treats it as number gg change
      // get first card to be played value
      const cardToBePlayedValue = arrayOfCardsToPlay[0].split('')[0];

      // Handle blaying T
      if(cardToBePlayedValue === 'T') {
        return 'Bomb'
      }
      // Returns either 'Cannot be played', 'Can be played' or 'Bomb'
      if(playPile.length < 1) {
        return 'Can be played'
      }

      let topOfPileCardValue = ''
      // get top card of playPile (curent value) if playPile exists
      if (playPileArray.length > 0) {
        topOfPileCardValue = playPileArray[playPileArray.length - 1].split('')[0]
      }
      // handle if 8
      if(topOfPileCardValue === '8') {
        if(playPileArray.length > 1) {
          topOfPileCardValue = playPileArray[playPileArray.length - 2].split('')[0] || '2'
        }
        if(playPileArray.length > 2 && topOfPileCardValue === '8') {
          topOfPileCardValue = playPileArray[playPileArray.length - 3].split('')[0]
        }
        if(playPileArray.length > 3 && topOfPileCardValue === '8') {
          topOfPileCardValue = playPileArray[playPileArray.length - 4].split('')[0]
        }
        if(playPileArray.length > 4 && topOfPileCardValue === '8') {
          topOfPileCardValue = playPileArray[playPileArray.length - 5].split('')[0]
        }
        if(playPileArray.length === 1 && topOfPileCardValue === '8') {
          topOfPileCardValue = '2'
        }
      }

      // Check for natural bomb if 
      // if playPileExists i.e not first card
      if (playPileArray.length + arrayOfCardsToPlay.length > 3) {
        // Check for Bomb
        // If card is same as top of pile check for bomb
        if(cardToBePlayedValue === topOfPileCardValue) {
          // get num of cards being played
          const numOfCardsPlayed = arrayOfCardsToPlay.length
          // construct array for last 4 cards to be on playPile
          let last4Cards = []
          for (let i = 0; i < 4 - numOfCardsPlayed; i++) {
            const element = playPileArray[playPileArray.length - (i + 1)];
            last4Cards.push(element)
            // MAYBE BREAK THESE TO TWO FUNCTIONS. canCardBePlayed() and checkForBomb()
          }
          last4Cards = [...arrayOfCardsToPlay, ...last4Cards]
          // if they're all equal to the same value then bomb baby
          if (topOfPileCardValue === last4Cards[0].split('')[0] &&
            topOfPileCardValue === last4Cards[1].split('')[0] &&
            topOfPileCardValue === last4Cards[2].split('')[0] &&
            topOfPileCardValue === last4Cards[3].split('')[0]) {
              return 'Bomb'
          }
        }
      }

      // Handle Cards that can be put on anything (8, 2)
      if(cardToBePlayedValue === '8' || cardToBePlayedValue === '2' ) {
        return 'Can be played'
      }

      let cardToBePlayedIsNotANumber = isNaN(cardToBePlayedValue)
      let topOfPileCardValueIsNotANumber = isNaN(topOfPileCardValue)
      
      if(cardToBePlayedIsNotANumber) { //Card is J, Q, K or A
        if(topOfPileCardValue === '7') { // cannot play on a 7
          return 'Cannot be played'
        }
        // If number cards not 8 or 7
        if( topOfPileCardValue === '2' ||
            topOfPileCardValue === '3' ||
            topOfPileCardValue === '4' ||
            topOfPileCardValue === '5' ||
            topOfPileCardValue === '6' ||
            topOfPileCardValue === '9'
          ) { 
          return 'Can be played'
        }
        if(topOfPileCardValueIsNotANumber && cardToBePlayedValue === 'A') { // A can be played on any non number
          return 'Can be played'
        }
        if(topOfPileCardValue === 'J') { // JQKA can all be placed on J
          return 'Can be played'
        }
        if(topOfPileCardValue === 'Q') { // QKA can all be placed on Q
          return cardToBePlayedValue === 'J' ? 'Cannot be played' : 'Can be played'
        }
        if(topOfPileCardValue === 'K') { // KA can all be placed on K
          return cardToBePlayedValue === 'J' || cardToBePlayedValue === 'Q' ? 'Cannot be played' : 'Can be played'
        }
        if(topOfPileCardValue === 'A') { // A can only be placed on A
          return cardToBePlayedValue !== 'A' ? 'Cannot be played' : 'Can be played'
        }
      }

      if(!cardToBePlayedIsNotANumber) { //Card is 3,4,5,6,7,9
        if(topOfPileCardValue === '7') { // has to be lower if 7
          return cardToBePlayedValue <= topOfPileCardValue ? 'Can be played' : 'Cannot be played'
        } else {
          return parseInt(cardToBePlayedValue) >= parseInt(topOfPileCardValue) ? 'Can be played' : 'Cannot be played'
        }

      }
    }

    function shuffle(array) {
      let currentIndex = array.length,  randomIndex;
      // While there remain elements to shuffle.
      while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }
      return array;
    }

  return (
    <>
        {gameWon ? <Confetti className={'confetti'}/> : ''}
        <div className='gameContainer' style={{
          minWidth: '640px',
          minHeight: '360px',
          background: gameStage === 'Set' ? '#d3b2e2' : playerTurn === 'Player One' ? '#e1e7db' : '#d7bfc7'
        }}>
            <div className='playerTwoCards' style={{
            width: '100%',
            height: '75px',
            position:'relative',
          }}>
            {playerTwoDownCards.map((card, index) => {
            // get Left Value.
            let leftValue = 0
            leftValue = (index * 100) + 120;
            return <>
              <div
                  key={index} className={`card faceDownCardOnBoard`} style={{
                  width:'100px',
                  height:'140px',
                  padding:'2px',
                  position:'absolute',
                  top: `${-55}px`,
                  left:`${leftValue}px`,
                  // filter: `blur(${playerOneSelectedCards.length > 0 ? '3' : ''}0px)`,
                  // transitionProperty: 'filter',
                  // transitionDuration: '0.4s',
                }}>
              </div>
            </>
          })}
          {playerTwoSetCards.map((card, index) => {
            if (gameStage === 'Set') {return}
            // get Left Value.
            let leftValue = 0
            leftValue = (index * 100) + 120;
            // get suit to conditionally render suit icon
            const suitText = card.split('')[1]
            return <>
              <div 
                key={card} className={`card ${gameStage === 'Set' ? 'invisibleSetCard' : 'setCard'} ${playerTwoCards.length === 0 ? 'brightness100' : ''}`} style={{
                  width:'100px',
                    height:'140px',
                    padding:'2px',
                    position:'absolute',
                    top: `${-55}px`,
                    left:`${leftValue}px`,
                    transform:`rotate(${180}deg)`,
                    // filter: `blur(${playerOneSelectedCards.length > 0 ? '3' : ''}0px)`,
                }}>
                  <div>
                    {card.split('')[0]}
                    {suitText === 's' && <GiSpades></GiSpades>}
                    {suitText === 'h' && <GiHearts></GiHearts>}
                    {suitText === 'c' && <GiClubs></GiClubs>}
                    {/* {suitText === 'd' && <GiDiamonds></GiDiamonds>} */}
                    {suitText === 'd' && <FaEthereum></FaEthereum>}
                  </div>
                </div>
              </>
            })}
            {playerTwoCards.map((card, index) => {
              let topValue = -150
              if(index > 16) {
                topValue = index < 34 ? -170 : -190
              }
              let leftValue = index * 30;
              if(index > 16) {
                leftValue = index < 34 ? index * 30 - 510 : index * 30 - 1020
              }
              // add spacer so cards are always centered
              const getSpacerWidth = (cardsInRow) => {
                const totalWidth = 640;
                const widthOfCard = 150;
                const spaceBetweenCards = 30;
                const widthOfCards = widthOfCard + ((cardsInRow - 1) * spaceBetweenCards)
                const spacerWidth = (totalWidth - widthOfCards) / 2
                return spacerWidth;
              }
              let spacerWidth = 0;
              if(index < 17) { // for top row
                const cardsInRow = playerTwoCards.length > 16 ? 17 : playerTwoCards.length
                spacerWidth = getSpacerWidth(cardsInRow)
              } else if (index < 34) { // for middle row
                const cardsInRow = playerTwoCards.length > 34 ? 17 : playerTwoCards.length - 17
                spacerWidth = getSpacerWidth(cardsInRow)
              } else { // for bottom row
                spacerWidth = getSpacerWidth(playerTwoCards.length - 34)
              }
              return <>
                <div
                    key={index} className={`card faceDownCard`} style={{
                    width:'150px',
                    height:'210px',
                    padding:'2px',
                    position:'absolute',
                    top: `${topValue}px`,
                    left:`${spacerWidth + leftValue}px`,
                    // filter: `blur(${playerOneSelectedCards.length > 0 ? '3' : ''}0px)`,
                  }}>
                </div>
              </>

            })}
          </div>
            <div className='gameCards' style={{
            width: '100%',
            height: '180px',
            position: 'relative',
          }}>
            {/* Play Pile */}
            {playPile.map((card, index) => {
            let cardRotate = 0
            let randRotate = Math.round(Math.random()* 30) - 15 
            let xNudge = Math.round(Math.random()* 8) - 4
            let yNudge = Math.round(Math.random()* 8) - 4
            if(index === playPile.length - 1) { // If last card played
              cardRotate = 15
              xNudge = 15;
            }
            if(index === playPile.length - 3) { // If third last card played
              cardRotate = -15
              xNudge = -15;
              yNudge = -5;
            }
            // get Top Value.
            let topValue = 20
            // get Left Value.
            let leftValue = 270
            // get suit to conditionally render suit icon
            const suitText = card.split('')[1]
            return <>
              <div
                  onClick={pickUp}
                  key={index} className={`card `} style={{
                  width:'100px',
                  height:'140px',
                  padding:'2px',
                  position:'absolute',
                  top: `${topValue}px`,
                  left:`${leftValue}px`,
                  transform:`rotate(${cardRotate+randRotate}deg) translateY(${yNudge}px) translateX(${xNudge}px)`,
                  // filter: `blur(${playerOneSelectedCards.length > 0 ? '3' : ''}0px)`,
                  // transitionProperty: 'filter',
                  // transitionDuration: '0.4s',
              }}>
                <div>
                  {card.split('')[0]}
                  {suitText === 's' && <GiSpades></GiSpades>}
                  {suitText === 'h' && <GiHearts></GiHearts>}
                  {suitText === 'c' && <GiClubs></GiClubs>}
                  {/* {suitText === 'd' && <GiDiamonds></GiDiamonds>} */}
                  {suitText === 'd' && <FaEthereum></FaEthereum>}
                </div>
              </div>
              </>
            })}

            {/* Discard Pile */}
            {discardPile.map((card, index) => {
            let randRotate = Math.round(Math.random()* 30) - 15 
            let xNudge = Math.round(Math.random()* 8) - 4
            let yNudge = Math.round(Math.random()* 8) - 4
            return <>
              <div
                  key={index} className={`card faceDownCardOnBoard`} style={{
                  width:'100px',
                  height:'140px',
                  padding:'2px',
                  position:'absolute',
                  top: `${20}px`,
                  left:`${24}px`,
                  transform:`rotate(${randRotate}deg) translateY(${yNudge}px) translateX(${xNudge}px)`,
                  // filter: `blur(${playerOneSelectedCards.length > 0 ? '3' : ''}0px)`,
                  // transitionProperty: 'filter',
                  // transitionDuration: '0.4s',
              }}>
              </div>
              </>
            })}
            {/* Remaining Deck */}
            {remainingDeck.map((card, index) => {
            let randRotate = Math.round(Math.random()* 10) - 5
            let xNudge = Math.round(Math.random()* 4) - 2
            let yNudge = Math.round(Math.random()* 4) - 2
            return <>
              <div
                  key={index} className={`card faceDownCardOnBoard`} style={{
                  width:'100px',
                  height:'140px',
                  padding:'2px',
                  position:'absolute',
                  top: `${20}px`,
                  right:`${24}px`,
                  transform:`rotate(${randRotate}deg) translateY(${yNudge}px) translateX(${xNudge}px)`,
                  // filter: `blur(${playerOneSelectedCards.length > 0 ? '3' : ''}0px)`,
                  // transitionProperty: 'filter',
                  // transitionDuration: '0.4s',
              }}>
              </div>
              </>
            })}
            {/* Conditional Rendering depending on game state */}
            {
              gameStatus === "Waiting for players" &&
              <button 
                onClick={(e) => joinGame(e,thisGameId,playerOne)}
                className='gameBtn joinGameBtn'>
                  Join Game
              </button>
            }
            {
              gameStatus === "Waiting for players to be ready" &&
              <>
              <div className='waitingForReadyDiv'>
                <h3 
                  className='text-center'>
                    Waiting for:
                </h3> 
                {playerOneReady === "No" && <h5 className={`waitingFor text-center`}>{playerOne === currentETHAccount ? 'You' : playerOne}</h5>}
                {playerTwoReady === "No" && <h5 className={`waitingFor text-center`}>{playerTwo === currentETHAccount ? 'You' : playerTwo}</h5>}
                {playerOneReady !== "Yes" && playerTwoReady !== "Yes" ? '': <h3 className='text-center'>Ready:</h3>}
                {playerOneReady === "Yes" && <h5 className={`playerReady text-center`}>{playerOne === currentETHAccount ? 'You' : playerOne}</h5>}
                {playerTwoReady === "Yes" && <h5 className={`playerReady text-center`}>{playerTwo === currentETHAccount ? 'You' : playerTwo}</h5>}
                <button 
                  onClick={(e) => playerReady(e,thisGameId)}
                  className='gameBtn readyForGameBtn'>
                    I'm Ready
                </button>
              </div>  
              </>
            }
            {
              playerOneSelectedCards.length > 0 &&
              <button
                onClick={playCards}
                className='gameBtn playCardsBtn'>
                  {gameStage === 'Set' ? 'Set' : 'Play'} Cards
              </button>
            }
            {
              playerOneSelectedCards.length > 0 &&
              <button
                onClick={handleClearSelectedCards}
                className='gameBtn clearCardsBtn'>
                  Clear Cards
              </button>
            }
            </div>
            {/* PLAYER ONE CARD CONTAINER */}
            <div className='playerOneCards' style={{
            width: '100%',
            height: '105px',
            display:'flex',
            position:'relative',
          }}>
            {playerOneDownCards.map((card, index) => {
            // get Top Value.
            let topValue = -10
            // get Left Value.
            let leftValue = 0
            leftValue = (index * 100) + 120;
            return <>
              <div
                  key={`Down-Card-${index}`}
                  onClick={() => playDownCard(card)}
                  className={`card faceDownCardOnBoard`} 
                  style={{
                    width:'100px',
                    height:'140px',
                    padding:'2px',
                    position:'absolute',
                    top: `${topValue}px`,
                    left:`${leftValue}px`,
                  }}>
              </div>
            </>
          })}
          {/* BLUR ELEMENT TODO */
          playerOneSelectedCards.length > 0 ? (
            <div className={'blurContainer'} onClick={handleClearSelectedCards}></div>
          ): ''
          }
            {playerOneSetCards.map((card, index) => {
            // get Top Value.
            let topValue = -10
            // get Left Value.
            let leftValue = 0
            leftValue = (index * 100) + 120;
              // get suit to conditionally render suit icon
              const suitText = card.split('')[1]
              return <>
              <div 
                onClick={(e) => handleSelectSetCard(e, card)}
                onMouseEnter={(e) => handleMouseEnterSetCard(e)}
                onMouseLeave={(e) => handleMouseLeaveSetCard(e)}
                id={ `${playerOneSelectedCards.includes(card) ? 
                  `selectedCard${playerOneSelectedCards.indexOf(card) + 1}` : ''}`}
                key={card} className={`card ${gameStage === 'Set' ? 'invisibleSetCard' : 'setCard'} ${playerOneCards.length === 0 ? 'brightness100' : ''}`} style={{
                    width:'100px',
                    height:'140px',
                    padding:'2px',
                    position:'absolute',
                    top: `${topValue}px`,
                    left:`${leftValue}px`,
                    // zIndex: playerOneSelectedCards.length = 0 ? '' : '99999' // TODO
                }}>
                  <div>
                    {card.split('')[0]}
                    {suitText === 's' && <GiSpades></GiSpades>}
                    {suitText === 'h' && <GiHearts></GiHearts>}
                    {suitText === 'c' && <GiClubs></GiClubs>}
                    {/* {suitText === 'd' && <GiDiamonds></GiDiamonds>} */}
                    {suitText === 'd' && <FaEthereum></FaEthereum>}
                  </div>
                </div>
              </>
            })}
            {playerOneCards.map((card, index) => {
              // get Top Value. TODO: Update for if there are > 17 cards and > 34 cards
              let topValue = 20
              if(index > 16) {
                topValue = index < 34 ? 45 : 70
              }
              // get Left Value. TODO: Update for if there are > 16 cards and > 34 cards
              let leftValue = index * 30;
              if(index > 16) {
                leftValue = index < 34 ? index * 30 - 510 : index * 30 - 1020
              }
              // get suit to conditionally render suit icon
              const suitText = card.split('')[1]
              // add spacer so cards are always centered
              const getSpacerWidth = (cardsInRow) => {
                const totalWidth = 640;
                const widthOfCard = 150;
                const spaceBetweenCards = 30;
                const widthOfCards = widthOfCard + ((cardsInRow - 1) * spaceBetweenCards)
                const spacerWidth = (totalWidth - widthOfCards) / 2
                return spacerWidth;
              }
              let spacerWidth = 0;
              if(index < 17) { // for top row
                const cardsInRow = playerOneCards.length > 16 ? 17 : playerOneCards.length
                spacerWidth = getSpacerWidth(cardsInRow)
              } else if (index < 34) { // for middle row
                const cardsInRow = playerOneCards.length > 34 ? 17 : playerOneCards.length - 17
                spacerWidth = getSpacerWidth(cardsInRow)
              } else { // for bottom row
                spacerWidth = getSpacerWidth(playerOneCards.length - 33)
              }
              return <>
                <div onClick={(e) => handleSelectCard(e, card)}
                  onMouseEnter={(e) => handleMouseEnter(e)}
                  onMouseLeave={(e) => handleMouseLeave(e)}
                  id={ `${playerOneSelectedCards.includes(card) ? 
                    `selectedCard${playerOneSelectedCards.indexOf(card) + 1}` : ''}`}
                  key={card} className={`card ${nonPlayerWatching ? 'faceDownCard' : ''}`} style={{
                    width:'150px',
                    height:'210px',
                    padding:'2px',
                    position:'absolute',
                    top: `${topValue}px`,
                    left:`${spacerWidth + leftValue}px`,
                }}>
                  <div>
                    {card.split('')[0]}
                    {suitText === 's' && <GiSpades></GiSpades>}
                    {suitText === 'h' && <GiHearts></GiHearts>}
                    {suitText === 'c' && <GiClubs></GiClubs>}
                    {/* {suitText === 'd' && <GiDiamonds></GiDiamonds>} */}
                    {suitText === 'd' && <FaEthereum></FaEthereum>}
                  </div>
                </div>
              </>
            })}
          </div>
        </div>
    </>
  )
}
