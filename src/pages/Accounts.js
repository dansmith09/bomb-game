import React, { useEffect, useState } from 'react'
import { db } from '../firebase'
import { ref, onValue } from 'firebase/database'
import { Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'


export default function Accounts() {

    const [accountList, setAccountList] = useState([])


    //read
    useEffect(() => {
        onValue(ref(db), (snapshot) => {
            const newAccList = [];
            const data = snapshot.val();
            if (data !== null) {
                Object.values(data.accounts).map((acc) => {
                    newAccList.push(acc)
                });
            }
            function removeDuplicates(newAccList) {
                return newAccList.filter((item,
                    index) => newAccList.indexOf(item) === index);
            }
            setAccountList(removeDuplicates(newAccList));
        });
    }, []);


  return (
    <>
        <Card className='p-4'>
        {accountList.map((account) => {
            return <>
                <Card  key={account.walletAddress} className='p-2 text-center'>
                    <Link to={`/account/${account.walletAddress}`}>
                    <div>
                        <h5>{account.screenName}</h5>
                        <p className='m-0'>{account.walletAddress}</p>
                    </div>
                    </Link>
                </Card>
            </>
        })}
        </Card>
    </>
)}
