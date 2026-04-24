import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function testConnection() {
  console.log("Testing connection...");
  try {
    const testDoc = doc(db, "test", "connection");
    await getDocFromServer(testDoc);
    console.log("Success!");
  } catch (error) {
    console.error("Error:", error);
  }
}

testConnection();
