import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Card } from 'react-bootstrap'
import { FaEthereum } from 'react-icons/fa'
import { db } from '../firebase'
import { set, ref } from 'firebase/database'
import { ethers } from "ethers";
import { toast } from 'react-toastify'


export default function Signup() {

    const [screenName, setScreenName] = useState('')

    const navigate = useNavigate();

    const handleSignInWithEthereum = async (e) => {
        e.preventDefault()

        // check if screen name is given
        if(!screenName) {
            toast.error("You need a screen name!", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2000
            })
            return;
        }

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
            set(ref(db, 'accounts/' + currentAccount), {
                screenName,
                walletAddress: currentAccount
            })
            navigate('/accounts')
        } else {
            // signature invalid  prompt
            toast.error("That didn't work... Please try again.", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2000
            })
        }

    }

  return (
    <>
        <Card className='p-4'>
            <Card.Body>
                <h2 className='text-center mb-4'> Sign In</h2>
            </Card.Body >
            <Form>
                <Form.Group id="screenName">
                    <Form.Label>Screen Name</Form.Label>
                    <Form.Control value={screenName} onChange={(e => setScreenName(e.target.value))}></Form.Control>
                </Form.Group>
                <Button onClick={(e) => handleSignInWithEthereum(e)} className='w-100 text-center mt-2' type='submit'>
                <FaEthereum></FaEthereum> Sign In With Ethereum
                </Button>
            </Form>
        </Card>
    </>
)}
