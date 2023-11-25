// pages
import React, {useState} from 'react'
import Signup from '../pages/Signup';
import Game from '../pages/Game';
import Lobby from '../pages/Lobby';
import Accounts from '../pages/Accounts';
import Account from '../pages/Account';
// route
import { Route, Routes } from 'react-router-dom'
// extras
import { Container } from 'react-bootstrap'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import Nav from './Nav';
import Settings from './Settings';

// https://www.youtube.com/watch?v=3P6bmhire-Y Routing

export const CurrentAccountContext = React.createContext();

function App() {


    // Auth / Login
    const [currentETHAccount, setCurrentETHAccount] = useState('')
  
  return<>
  <CurrentAccountContext.Provider value={[currentETHAccount, setCurrentETHAccount]}>
    <Container className='containerBG d-flex align-items-center justify-content-center'
    style={{minHeight: "100vh",}}>
        <ToastContainer limit={3}/>
        <Routes>
          <Route path='/' element={<Lobby/>}/>
          <Route path='/lobby' element={<Lobby/>}/>
          <Route path='/Signup' element={<Signup/>}/>
          <Route path='/Accounts' element={<Accounts/>}/>
          <Route path='/play' element={<Game/>}/>
          <Route path='/Play/:gameId' element={<Game/>}/>
          <Route path='/Account/:walletAddress' element={<Account/>}/>
        </Routes>
        <Nav/>
        <Settings/>
    </Container>
  </CurrentAccountContext.Provider>
</>
}

export default App;
