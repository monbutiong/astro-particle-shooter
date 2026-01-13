// src/api/leaderboard.js
import { db } from "../firebase";
import { ref, push, query, orderByChild, limitToLast, onValue } from "firebase/database";

// Added 'theme' as the 3rd argument
export function saveScore(name, score, theme) {
  const scoresRef = ref(db, "leaderboard_pair");
  return push(scoresRef, {
    name: name,
    score: score,
    theme: theme, // Saved as 'theme' to match your frontend display logic
    date: new Date().toLocaleDateString()
  });
}

export function listenTopScores(callback) {
  const scoresQuery = query(
    ref(db, "leaderboard_pair"),
    orderByChild("score"),
    limitToLast(20) // Keep top 20 for efficiency
  );

  return onValue(scoresQuery, snapshot => {
    const data = snapshot.val() || {};
    const list = Object.values(data);
    // Sort descending (High to Low)
    list.sort((a, b) => b.score - a.score);
    callback(list);
  });
}