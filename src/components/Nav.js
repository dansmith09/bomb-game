import React, { useState, useContext, useEffect }from 'react'
import { CurrentAccountContext } from '../components/App';
import { ethers, getDefaultProvider } from "ethers";
import { Provider } from '@ethersproject/abstract-provider';
import 'react-toastify/dist/ReactToastify.css'
import { toast } from 'react-toastify'

export default function Nav() {

    const [currentETHAccount, setCurrentETHAccount] = useContext(CurrentAccountContext);
    
    const [menuOpened, setMenuOpened] = useState(true)
    const [accDisplay, setAccDisplay] = useState(true)

    const getAccDisplay = async () => {
        // TODO: Resolve ENS
        // const provider = await getDefaultProvider()
        // const provider = new ethers.providers.JsonRpcProvider()
        // provider.lookupAddress(currentETHAccount).then((resolvedName) => {
        //     setAccDisplay(resolvedName ?? currentETHAccount)
        // })
        if(currentETHAccount) {
            const last4Digits = currentETHAccount.split('').slice(-4)
            const first4Digits = currentETHAccount.split('').slice(0,4)
            const displayName = [...first4Digits, '...', ...last4Digits].join("")
            setAccDisplay(displayName);
        }
    }

    const handleSignInWithEthereum = async (e) => {
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
        const message = 'Sign In!'
        const signature = await signer.signMessage(message)
        const address = ethers.utils.verifyMessage(message, signature).toLowerCase()

        if(address === currentAccount) {

            // Logs player in if hasn't been already
            setCurrentETHAccount(currentAccount)
            
            // signature invalid  prompt
            toast.success("You're signed in... Nice!", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2000
            })   
            

        } else {
            // signature invalid  prompt
            toast.error("That didn't work... Please try again.", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2000
            })
        }

    }

    useEffect(() => {
        getAccDisplay()
    }, [currentETHAccount])

  return (
    <>
        <div
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            margin: '10px',
            padding: '5px',
            paddingLeft: '10px',
            paddingRight: '10px',
            backgroundColor: currentETHAccount ? '#c5f2da' :'#d3b2e2',
            borderRadius:'10px',
            zIndex: 90,
            border: 'white 2px solid',
        }}
        onClick={handleSignInWithEthereum}>
            {currentETHAccount ? accDisplay : 'Sign In'}
        </div>
    </>
  )
}
