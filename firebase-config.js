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
//          "$profile": {
//            ".read": true,
//            ".write": true
//          }
//        },
//        "reports": {
//          "$profile": {
//            ".read": true,
//            ".write": true
//          }
//        },
//        "profiles": {
//          ".read": true,
//          ".write": true
//        }
//      }
//    }

const firebaseConfig = {
    apiKey: "AIzaSyCiNeOMZCyXMv6pMh05yHdHbl-pNOv7H8s",
    authDomain: "n-spelling.firebaseapp.com",
    databaseURL: "https://n-spelling-default-rtdb.firebaseio.com",
    projectId: "n-spelling",
    storageBucket: "n-spelling.firebasestorage.app",
    messagingSenderId: "713846333107",
    appId: "1:713846333107:web:31014535c28b345f08dac6"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
