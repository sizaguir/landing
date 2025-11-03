import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, set, push, get } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

// Configuración HARDCODEADA para testing
const firebaseConfig = {
    apiKey: "AIzaSyCB4Jeq0qno6lc3uTZTC_SoRlxsbDsSAEI",
    authDomain: "landing-f652b.firebaseapp.com",
    databaseURL: "https://landing-f652b-default-rtdb.firebaseio.com",
    projectId: "landing-f652b",
    storageBucket: "landing-f652b.firebasestorage.app",
    messagingSenderId: "339976118787",
    appId: "1:339976118787:web:9236be2fdeb96aaa5c2436"
};

console.log("Firebase configurado con URL:", firebaseConfig.databaseURL);

// Inicializar Firebase
let database;
try {
    const app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log(" Firebase inicializado correctamente");
} catch (error) {
    console.error(" Error inicializando Firebase:", error);
}

const saveVote = async (productID) => {
    try {
        console.log(" Guardando voto para producto:", productID);
        
        const votesRef = ref(database, "votes");
        const newVoteRef = push(votesRef);
        
        await set(newVoteRef, {
            productID: productID,
            timestamp: new Date().toISOString(),
        });

        console.log(" Voto guardado exitosamente");
        
        return {
            status: "success",
            message: "¡Voto guardado correctamente!",
        };
    } catch (error) {
        console.error(" Error en saveVote:", error);
        return {
            status: "error",
            message: `Error al guardar el voto: ${error.message}`,
        };
    }
};

const getVotes = async () => {
    try {
        console.log(" Obteniendo votos...");
        
        const votesRef = ref(database, 'votes');
        const snapshot = await get(votesRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log(" Votos obtenidos:", data);
            
            return {
                success: true,
                data: data
            };
        } else {
            console.log("ℹ No hay votos en la base de datos");
            return {
                success: true,
                data: {}
            };
        }
    } catch (error) {
        console.error(" Error en getVotes:", error);
        return {
            success: false,
            message: `Error al obtener los votos: ${error.message}`
        };
    }
};

export { saveVote, getVotes };