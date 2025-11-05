// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDq3mr-ryX_q8GAEyfTsQP2mzjpP9wOugE",
    authDomain: "houseup-app.firebaseapp.com",
    projectId: "houseup-app",
    storageBucket: "houseup-app.firebasestorage.app",
    messagingSenderId: "401114152723",
    appId: "1:401114152723:web:f96eaf0a718342c0cf64e6",
    measurementId: "G-S07Q5EFB0T"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Exportar para uso global
window.db = db;