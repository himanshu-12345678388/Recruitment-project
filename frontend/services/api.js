const BASE_URL = 'http://localhost:5000/api';

export const apiService = {
  //  Fetching  questions from the backend
  async getQuestions() {
    const response = await fetch(`${BASE_URL}/questions`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  },

  //  selected answer answer verification
  async verifyAnswer(id, selectedAnswer) {
    const response = await fetch(`${BASE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, selectedAnswer })
    });
    if (!response.ok) throw new Error('Failed to verify answer');
    return response.json();
  },

  //  Save the final scorecard data
  async saveScorecard(scorecard) {
    const response = await fetch(`${BASE_URL}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scorecard)
    });
    if (!response.ok) throw new Error('Failed to save scorecard');
    return response.json();
  },

  //  Fetch the sorted leaderboards rows
  async getLeaderboard() {
    const response = await fetch(`${BASE_URL}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },

  //encrypted task get api
  async getCryptoQuestions(){
    const response = await fetch(`${BASE_URL}/crypto/questions`);
    if(!response.ok) throw new Error("failed to fetch crypto tasks");
    return response.json();
  },


  //verify answer api
  async verifyCryptoAnswer(id,decodedSubmission){
    const response = await fetch(`${BASE_URL}/crypto/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, decodedSubmission })
    });
    if(!response.ok) throw new Error('Verification request broken');
    return response.json();
  },
};
