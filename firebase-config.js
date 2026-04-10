// Firebase configuration
// To set up:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (e.g. "n-spelling")
// 3. Go to Project Settings > General > Your apps > Add web app
// 4. Copy the config values below
// 5. Go to Realtime Database > Create Database > Start in test mode
// 6. Set these rules in Realtime Database > Rules:
//    {
//      "rules": {
//        "sessions": {
//          "niko": {
//            ".read": true,
//            ".write": true
//          }
//        }
//      }
//    }

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
