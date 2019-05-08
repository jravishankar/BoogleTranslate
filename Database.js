import * as firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyC1loM_GSHPGQ9hoYyRA_htxsLnmDnwb4g",
  authDomain: "boogletranslate-fe8ae.firebaseapp.com",
  databaseURL: "https://boogletranslate-fe8ae.firebaseio.com",
  projectId: "boogletranslate-fe8ae",
  storageBucket: "boogletranslate-fe8ae.appspot.com",
  messagingSenderId: "1072846869412",
};

const db = firebase.initializeApp(firebaseConfig);

export default db;
