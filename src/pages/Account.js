import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { ref, onValue } from 'firebase/database'
import { useParams } from 'react-router-dom'

export default function Account() {

  const [currentAccount, setCurrentAccount] = useState({})

  const { walletAddress } = useParams();


    //read
    useEffect(() => {
      onValue(ref(db, `accounts/${walletAddress}`), (snapshot) => {
          const account = snapshot.val();
          if (account !== null) {
            setCurrentAccount(account)
          }
      });
  }, []);

  return (
    <>
      <div>
        <h3>{currentAccount.screenName}</h3>
        <h6>{currentAccount.walletAddress}</h6>
      </div>
    </>
  )
}
