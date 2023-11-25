// import React, { useState, useContext, useEffect }from 'react'
// import { CurrentAccountContext } from '../components/App';
// import { IoIosSettings } from "react-icons/io";
// import { useNavigate } from 'react-router-dom'
// import { ethers, getDefaultProvider } from "ethers";
// import { Provider } from '@ethersproject/abstract-provider';
// import 'react-toastify/dist/ReactToastify.css'
// import { toast } from 'react-toastify'

// export default function Settings() {

//     const navigate = useNavigate();

//     const [currentETHAccount, setCurrentETHAccount] = useContext(CurrentAccountContext);
    
//     const [menuOpened, setMenuOpened] = useState(true)
//     const [accDisplay, setAccDisplay] = useState(true)

//     const getAccDisplay = async () => {
//         // TODO: Resolve ENS
//         // const provider = await getDefaultProvider()
//         // const provider = new ethers.providers.JsonRpcProvider()
//         // provider.lookupAddress(currentETHAccount).then((resolvedName) => {
//         //     setAccDisplay(resolvedName ?? currentETHAccount)
//         // })
//         if(currentETHAccount) {
//             const last4Digits = currentETHAccount.split('').slice(-4)
//             const first4Digits = currentETHAccount.split('').slice(0,4)
//             const displayName = [...first4Digits, '...', ...last4Digits].join("")
//             setAccDisplay(displayName);
//         }
//     }

//     const handleSignInWithEthereum = async () => {

//         // check if metamask exists
//         if(!window.ethereum) {
//             // install metamask prompt
//             toast.error("You need to install MetaMask!", {
//                 position: toast.POSITION.TOP_CENTER,
//                 autoClose: 2000
//             })
//             return;
//         }

//         const accounts = await window.ethereum.request({
//             method: "eth_requestAccounts",
//         });

//         const currentAccount = accounts[0].toLowerCase();

//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const signer = provider.getSigner()
//         const message = 'Sign In!'
//         const signature = await signer.signMessage(message)
//         const address = ethers.utils.verifyMessage(message, signature).toLowerCase()

//         if(address === currentAccount) {

//             // Logs player in if hasn't been already
//             setCurrentETHAccount(currentAccount)
            
//             // signature invalid  prompt
//             toast.success("You're signed in... Nice!", {
//                 position: toast.POSITION.TOP_CENTER,
//                 autoClose: 2000
//             })   
            

//         } else {
//             // signature invalid  prompt
//             toast.error("That didn't work... Please try again.", {
//                 position: toast.POSITION.TOP_CENTER,
//                 autoClose: 2000
//             })
//         }

//     }

//     const menuMyAccountOrSignIn = () => {
//         if(currentETHAccount) {
//             navigate(`/account/${currentETHAccount}`)
//         } else if(!currentETHAccount) {
//             handleSignInWithEthereum()
//         }
//     }

//     useEffect(() => {
//         getAccDisplay()
//     }, [currentETHAccount])

//   return (
//     <>
//         <div
//         style={{
//             position: 'fixed',
//             top: 0,
//             right: 0,
//             margin: '2px',
//             marginRight: '3px',
//             padding: '0px',
//             paddingRight: '0px',
//             paddingLeft: '0px',
//             zIndex: 90,
//         }}
//         >
//         <IoIosSettings
//         style={{
//             width: '50px',
//             height: '50px',
//             margin: '0px',
//             padding: '0px',
//         }}
//         />
//         <div className='settingsMenu'>
//             <div
//             onClick={menuMyAccountOrSignIn}
//             >{currentETHAccount ? 'My Account' : 'Sign In'}</div>
//             <div>How to play</div>
//             <div>Share Game</div>
//             <div
//             onClick={() => navigate(`/lobby`)}
//             >Lobby</div>
//         </div>

//         </div>
//     </>
//   )
// }
