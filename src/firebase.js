import firebase from 'firebase'

const firebaseConfig = {
  apiKey: "AIzaSyD9bSgWZyJR81cXEaDS6c4I14pFMDDHE84",
  authDomain: "whatsapp-clone-8ed4f.firebaseapp.com",
  databaseURL: "https://whatsapp-clone-8ed4f-default-rtdb.firebaseio.com",
  projectId: "whatsapp-clone-8ed4f",
  storageBucket: "whatsapp-clone-8ed4f.appspot.com",
  messagingSenderId: "119436717656",
  appId: "1:119436717656:web:59f55902bfd177dd0a242d"
};


const app = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const db = app.firestore();

const googleProvider = new firebase.auth.GoogleAuthProvider();

export { auth, googleProvider };

export default db;
