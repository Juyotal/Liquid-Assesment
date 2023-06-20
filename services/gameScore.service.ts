
import { db, auth } from "@/config/firebase";
import {
  getDocs,
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  limit,
} from "firebase/firestore";

export interface IUserScore {
    id: string;
    best_accuracy: number;
    rounds: number;
    user: string | null;
}


export const updateUserScore = async (score: number) => {
    let email =  auth.currentUser?.email
    if (!email) {
        email =  auth.currentUser?.email
    }
    const userScore = await getUserScore(email);
    if (userScore) {
        await _updateExistingScore(userScore, score);
    } else {
        await _addNewScore(score);
    }
};
  
const _updateExistingScore = async (userScore: IUserScore, score: number) => {
    try {
        const scoreDocument = doc(db, "memory-game", userScore.id);
        const newAccuracy = Math.max(score, userScore.best_accuracy);
        const newRounds = userScore.rounds + 1;
        await updateDoc(scoreDocument, {
            best_accuracy: newAccuracy,
            rounds: newRounds,
        });
    } catch (error) {
        console.error("Error updating score document:", error);
    }
};
  
const _addNewScore = async (score: number) => {
    try {
        const email = auth.currentUser?.email;
        if (email) {
            await addDoc(collection(db, "memory-game"), {
                best_accuracy: score,
                rounds: 1,
                user: email,
            });
        }
    } catch (error) {
        console.error("Error adding new score document:", error);
    }
};
  
export const getUserScore = async (email:string | null | undefined): Promise<IUserScore | null> => {
    try {
        const q = query(
            collection(db, "memory-game"),
            where("user", "==", email),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const document = querySnapshot.docs[0];
            const { best_accuracy, rounds, user } = document.data();
            const result: IUserScore = {
            id: document.id,
            best_accuracy,
            rounds,
            user,
            };
            return result;
        }
        return null;
    } catch (error) {
        console.error("Error fetching document:", error);
        return null
    }
};

