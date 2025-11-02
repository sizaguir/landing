import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, set, push, get, child } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: "https://landing-f652b-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const saveVote = async (productID) => {
    try {
        const votesRef = ref(database, "votes");
        const newVoteRef = push(votesRef);
        await set(newVoteRef, {
            productID: productID,
            date: new Date().toISOString(),
        });

        return {
            status: "success",
            message: "Voto guardado correctamente.",
        };
    } catch (error) {
        return {
            status: "error",
            message: `Error al guardar el voto: ${error.message}`,
        };
    }
};


// Definir la función flecha asíncrona getVotes
const getVotes = async () => {
    try {
        // Obtener referencia a la base de datos
        const db = getDatabase();

        // Referencia a la colección "votes"
        const votesRef = ref(db, 'votes');

        // Leer los datos una sola vez
        const snapshot = await get(votesRef);

        // Si existen datos
        if (snapshot.exists()) {
            return {
                success: true,
                data: snapshot.val() // devuelve los datos obtenidos
            };
        } else {
            return {
                success: false,
                message: 'No hay datos en la colección votes.'
            };
        }
    } catch (error) {
        // Manejo de errores
        return {
            success: false,
            message: `Error al obtener los votos: ${error.message}`
        };
    }
};

export { saveVote, getVotes };