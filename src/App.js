// import logo from './logo.svg';
import './App.css';
import {useRef, useState} from "react";
import React from "react";

//firebase SDK
// import  from 'firebase/app';
import firebase, { initializeApp } from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

//firebase hooks
import { useAuthState, signInWithPopup, signOut, GoogleAuthProvider } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore'
// import { firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAR6ODkGP_rmYlUHj_qvwGxe2FpltTImr0",
  authDomain: "simple-chatapp-1423a.firebaseapp.com",
  projectId: "simple-chatapp-1423a",
  storageBucket: "simple-chatapp-1423a.appspot.com",
  messagingSenderId: "55138357955",
  appId: "1:55138357955:web:0fe1e48fa9180b81840876",
  measurementId: "G-NNKFLQ0FYY"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

// const [isLoading, setIsLoading] = useState(false);

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">

      <section className='chat-container'>
        {user? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const signInWithGoogle = () => {
    auth.signInWithPopup(provider).then(
      console.log("login page load successfully")
    ).catch(
      err => {
        console.log(err)
      }
    )
  }
  
  return (
    <button onClick={signInWithGoogle}>Sign In with Google</button>
  )
}

function SignOut() {
  
  return (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {

  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt').limit(30);

  const [messages] = useCollectionData(query, {idField: 'id'})
  const [formValue, setFormValue] = useState('');

  const dummy = useRef()

  const sendMeesages = async(e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <div>
        {messages && messages.map(msg => <ChatMessages key={msg.id} messages={msg} />)}

        <div ref={dummy}></div>
      </div>

      {/* onSubmit send to database */}
      <form onSubmit={sendMeesages} className="submitMessage">
        <input value={formValue} onChange={e => setFormValue(e.target.value)} />

        <button type="submit">send</button>
      </form>

      <SignOut />
    </>
  )
}

function ChatMessages(props) {
  const {text, uid, photoURL} = props.messages;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return <div className={`message ${messageClass}`}>
    <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'}></img>
    <p>{text}</p>
  </div>
}

export default App;
