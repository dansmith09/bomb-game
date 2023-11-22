import { initializeApp } from 'firebase/app'
import { getDatabase } from "firebase/database"

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    databaseURL: process.env.REACT_APP_DATABASEURL,
    // projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
    appId: process.env.REACT_APP_APPID,
    // measurementId: process.env.REACT_APP_MEASUREMENTID

    // apiKey: "AIzaSyCQjTQIVUmiTA_MXrqC0wveLP9aXkivoPw",
    // authDomain: "bomb-game-a523e.firebaseapp.com",
    // databaseURL: "https://bomb-game-a523e-default-rtdb.firebaseio.com",
    // projectId: "bomb-game-a523e",
    // storageBucket: "bomb-game-a523e.appspot.com",
    // messagingSenderId: "846777317715",
    // appId: "1:846777317715:web:3455599bbf577b4d5d49a6",
    // measurementId: "G-CZP4HXFRTM"

    // apiKey: "AIzaSyCvkWoL3jFoU9a_ecl6R-0QtH0DQXv-TOo",
    // authDomain: "test-f8679.firebaseapp.com",
    // databaseURL: "https://test-f8679-default-rtdb.firebaseio.com",
    projectId: "test-f8679",
    // storageBucket: "test-f8679.appspot.com",
    // messagingSenderId: "215408262812",
    // appId: "1:215408262812:web:805b1fe632a6683888b759"
}

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app)