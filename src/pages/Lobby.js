import React, { useEffect, useState, useContext } from 'react'
import { db } from '../firebase'
import { set, ref, onValue } from 'firebase/database'
import { Button } from 'react-bootstrap'
import { ethers } from "ethers";
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { uid } from "uid";
import { CurrentAccountContext } from '../components/App';



// TODO:
// redirect both players to game when matched
// Change (gameLobbyList.length + 1) to Uid

export default function Lobby() {

    const navigate = useNavigate();

    const [currentETHAccount, setCurrentETHAccount] = useContext(CurrentAccountContext);

    const [gameLobbyList, setGameLobbyList] = useState([])

    const handleStartNewGame = async (e) => {
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

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const message = 'Start New Game!'
        const signature = await signer.signMessage(message)
        const address = ethers.utils.verifyMessage(message, signature).toLowerCase()

        // Make Unique ID
        const gameId = uid();

        if(address === currentAccount) {
            // Logs player in if hasn't been already
            setCurrentETHAccount(currentAccount)

            set(ref(db, 'games/' + gameId ), {
                gameId: gameId,
                playerOne: currentAccount,
                playerTwo: '',
                status: 'Waiting for players',
                maxPlayers: 2,
                currentPlayers: 1,
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
        toast.success("You started a new game!", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000
        })
        navigate(`/play/${gameId}`)
    }

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
                currentPlayers: 2,
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
        navigate(`/play/${gameId}`)
    }

    //read
    useEffect(() => {
        onValue(ref(db, 'games/'), (snapshot) => {
            const newGameList = [];
            const games = snapshot.val();
            if (games !== null) {
                Object.values(games).map((game) => {
                    if(game.currentPlayers < 2) {
                        newGameList.push(game)
                    }
                });
                setGameLobbyList(newGameList);
            } else {
                return;
            }
        });
    }, []);


  return (
    <>
        <div className='p-4 lobbyContainer'
        style={{
            backgroud:'#8e90aa',
        }}>
            <h2 className='text-center mb-4'>Game Lobby</h2>
            <Button
                className='p-3 m-3 text-center gameCard'
                onClick={(e) => handleStartNewGame(e)}>
                    Start New Game
            </Button>
            <h3 className='p-3 m-3 text-center mb-4'>Join A Game</h3>
        {gameLobbyList?.map((game) => {
            return <>
                <div className='p-3 m-3 text-center gameCard'>
                    <div key={game.gameId}>
                        <h5 className='m-0'>{'Players: ' + game.currentPlayers + '/' + game.maxPlayers}</h5>
                        {game.currentPlayers !== game.maxPlayers && 
                        <Button
                            onClick={(e => joinGame(e, game.gameId, game.playerOne))}
                            className='w-100 text-center mt-2 lobbyBtn lobbyJoinGameBtn' type='submit'>
                            Join Game
                        </Button>
                        }
                        <Button 
                            onClick={() => navigate(`/play/${game.gameId}`)}
                            className='w-100 text-center mt-2 lobbyBtn lobbyViewGameBtn' type='submit'>
                            View Game
                        </Button>
                    </div>
                </div>
            </>
        })}
        </div>
    </>
)}
