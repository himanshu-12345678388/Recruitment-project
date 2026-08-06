import { useState } from 'react';
import { apiService } from '../services/api';

export default function App() {
  // Application Stage Control: 0 = Register, 1 = Aptitude Test, 2 = Matrix
  const [stage, setStage] = useState(0);

  // Stage 0: Registration States
  const [userName, setUserName] = useState('');

  // Stage 1: Aptitude Core States
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  // Stage 2: Technical Memory Matrix States
  const [matrixLevel, setMatrixLevel] = useState(1);
  const [flashTiles, setFlashTiles] = useState([]);       
  const [selectedTiles, setSelectedTiles] = useState([]); 
  const [isFlashing, setIsFlashing] = useState(false);     
  const [matrixScore, setMatrixScore] = useState(0);
  
  
  //stage 3: Decryption core states
  const [cryptoQuestions,setCryptoQuestions] = useState([]);
  const [cryptoIndex,setCryptoIndex] = useState(0);
  const [userInput , setUserInput] = useState('');
  const [showHint,setShowHint] = useState(false);


  //trackign metrics
  const [incorrectAttempts ,setIncorrectattempts] = useState(0);
  const [hintsUsed,setHintsUsedCount]=useState(0);



  // Make sure this line exists right under your tracking metrics comment!
const [cryptoScore, setCryptoScore] = useState(0);

  

  //stage 4 
  const [leaderboardEntries,setLeaderboardEntries] = useState([]);

  // matrix task
  const startMatrixLevel = (level) => {
    setMatrixLevel(level);
    setSelectedTiles([]);
    setIsFlashing(true);

    let tileCount = 3;
    let flashDuration = 2000; 

    if (level === 2) tileCount = 4;
    if (level === 3) {
      tileCount = 5;
      flashDuration = 1500; 
    }

    const targets = [];
    while (targets.length < tileCount) {
      const rand = Math.floor(Math.random() * 16);
      if (!targets.includes(rand)) targets.push(rand);
    }

    setFlashTiles(targets);

    setTimeout(() => {
      setIsFlashing(false);
    }, flashDuration);
  };

  // EVENT HANDLERS
  const handleStartAssessment = async (e) => {
    e.preventDefault();
    if (!userName.trim()) return alert("Please enter your name to start.");

    setLoading(true);
    try {
      const data = await apiService.getQuestions();
      if (data && data.length > 0) {
        setQuestions(data);
        setStage(1);
      } else {
        alert("No question records found in database.");
      }
    } catch (err) {
      alert("Error fetching data from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (selectedOption) => {
    const currentQuestion = questions[currentIndex];
    
    try {
      const result = await apiService.verifyAnswer(currentQuestion.id, selectedOption);
      
      let nextScore = score;
      if (result && result.correct) {
        nextScore = score + 1;
        setScore(nextScore);
      }

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        alert(`Aptitude task complete! Moving to Stage 2: Memory Matrix.`);
        setStage(2); 
        startMatrixLevel(1); 
      }
    } catch (err) {
      alert("Error verifying answer with backend server.");
    }
  };

  const handleTileClick = async (index) => {
    if (isFlashing) return; 
    if (selectedTiles.includes(index)) return; 

    if (!flashTiles.includes(index)) {
      alert(`Game Over! You misclicked a tile on Level ${matrixLevel}.`);
      setMatrixScore(matrixLevel - 1); 
      setStage(3); // Will advance to leaderboard save step
      return;
    }

    const nextSelection = [...selectedTiles, index];
    setSelectedTiles(nextSelection);

    if (nextSelection.length === flashTiles.length) {
      if (matrixLevel === 3) {
        alert("Exceptional! You have cleared all 3 Memory Matrix challenges!");
        setMatrixScore(3);

        //fetch fresh cryptographic assesment
        try{
          const cryptoData = await apiService.getCryptoQuestions();
          setCryptoQuestions(cryptoData);
          setStage(3);
        }
        catch(err){
          alert("Error launching stage 3 data pipelines");
        }
         
      } else {
        alert(`Level ${matrixLevel} cleared! Moving up.`);
        startMatrixLevel(matrixLevel + 1); 
      }
    };
    
  };

  const handleCryptoSubmit = async (e) => {
    e.preventDefault();

    if(!userInput.trim()) return alert("Please type as answer before submit");

    const currentPuzzle = cryptoQuestions[cryptoIndex];

    try {
      const result = await apiService.verifyCryptoAnswer(currentPuzzle.id, userInput);

      if (result && result.correct) {
        alert("Correct decryption match!");
        setUserInput('');
        setShowHint(false);

        // Defensive Safety Wrappers: Updates the states safely even if names vary slightly
        if (typeof setCryptoScore === 'function') {
          setCryptoScore(prev => prev + 1);
        }

        if (cryptoIndex + 1 < cryptoQuestions.length) {
          setCryptoIndex(prev => prev + 1);
        } else {
          alert("Assessment stage 3 fully cleared! moving to leaderBoard.");
          setStage(4);
          submitFinalScorecard();  // triggering last stage i.e. leaderboard
        }
      } else {
        alert("Incorrect decoded message text. Try again!");
        setIncorrectattempts(prev => prev + 1);
      }
    } catch (err) {
      alert("Error processing decryption check request"+err.message);
    }
  };



   



  // --- REPLACE THIS FUNCTION IN YOUR frontend/src/App.js ---
const submitFinalScorecard = async () => {
  try {
    // 1. Safe fallbacks: read your scores or default cleanly to 0 if something is lagging
    const currentAptitudeScore = typeof score === 'number' ? score : 0;
    const currentMatrixLevelScore = typeof matrixScore === 'number' ? matrixScore : 0;

    //total hints used
    const totalHintsUsed = typeof hintsUsedCount ==='number' ? hintsUsedCount:0;

    // 2. Clear mathematical evaluation matching your backend fields
    let finalOverallScore = (currentAptitudeScore * 10) + (currentMatrixLevelScore * 20) + 50; 

    finalOverallScore = finalOverallScore -(totalHintsUsed *10);

    //safety check
    if(finalOverallScore < 0) finalOverllScore=0;

    let performanceClassification = "Junior Developer Candidate";
    if (finalOverallScore >= 180) performanceClassification = "Elite Core Architect";
    else if (finalOverallScore >= 150) performanceClassification = "Senior Systems Engineer";
    else if (finalOverallScore >= 130) performanceClassification = "Pack it up lil bro , its over for u";
    else performanceClassification="Kill yourself loserr!!";

    // 3. Package payloads with keys matching your backend req.body exactly
    const scorecardPayload = {
      name: userName || "Anonymous Candidate",
      score: finalOverallScore,
      classification: performanceClassification,
      time_taken: 45 // Static tracking baseline in seconds
    };

    // 4. Fire the network request over port 5000
    await apiService.saveScorecard(scorecardPayload);
    
    // 5. Fetch live rankings from database
    const liveRankings = await apiService.getLeaderboard();
    setLeaderboardEntries(liveRankings);

  } catch (err) {
    // THIS LINE IS CRITICAL: It will pop up the exact coding bug line if React fails!
    alert("React Code Execution Failure: " + err.message);
  }
};

  


  //              AI USED FOR RENDERING PART AS IT TAKES TIME       //



  // --- STAGE 0 VIEW RENDERER ---
  if (stage === 0) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <h2>Recruitment Portal</h2>
        <form onSubmit={handleStartAssessment} style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Candidate Name:</label>
          <input 
            type="text" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)} 
            placeholder="Enter full name"
            style={{ padding: '8px', width: '250px', marginBottom: '15px' }}
          />
          <br />
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            {loading ? "Loading..." : "Start Assessment"}
          </button>
        </form>
      </div>
    );
  }

  // --- STAGE 1 VIEW RENDERER ---
  if (stage === 1) {
    if (questions.length === 0) return <div style={{ padding: '40px' }}>Loading...</div>;
    const currentQuestion = questions[currentIndex];

    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <p><strong>Candidate:</strong> {userName} | <strong>Score:</strong> {score}</p>
        <hr />
        <h3>Question {currentIndex + 1} of {questions.length}</h3>
        <p style={{ fontSize: '18px', margin: '20px 0' }}>{currentQuestion.question}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
          {[currentQuestion.option1, currentQuestion.option2, currentQuestion.option3, currentQuestion.option4].map((option, idx) => (
            <button 
              key={idx} 
              onClick={() => handleAnswerSubmit(option)}
              style={{ padding: '12px', textAlign: 'left', cursor: 'pointer', fontSize: '16px' }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- STAGE 2 VIEW RENDERER ---
  if (stage === 2) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h2>Stage 2: Technical Memory Matrix</h2>
        <p><strong>Level:</strong> {matrixLevel} / 3</p>
        <p style={{ color: isFlashing ? 'blue' : 'green', fontWeight: 'bold' }}>
          {isFlashing ? "Memorize the pattern now..." : "Your turn: click the correct blocks!"}
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 80px)', 
          gap: '10px', 
          justifyContent: 'center', 
          marginTop: '25px' 
        }}>
          {Array.from({ length: 16 }).map((_, idx) => {
            let bgColor = '#ccc';
            if (isFlashing && flashTiles.includes(idx)) bgColor = '#3b82f6';
            else if (selectedTiles.includes(idx)) bgColor = '#22c55e';

            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: bgColor,
                  border: '2px solid #555',
                  cursor: isFlashing ? 'not-allowed' : 'pointer',
                  borderRadius: '4px'
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }


   
    
  
     // --- STAGE 3 VIEW RENDERER (SPLIT SCREEN WITH WORD BANK) ---
  if (stage === 3) {
    if (cryptoQuestions.length === 0) return <div style={{ padding: '40px' }}>Loading Decryption Module...</div>;
    const currentPuzzle = cryptoQuestions[cryptoIndex];

    // Your 10 hardcoded choices (including the 4 real correct database answers)
    const wordBankOptions = ["HELLO", "WORLD", "access", "denied", "3AIR", "5SKY", "7FLY", "#CORE", "#TEST", "#TRUE"];

    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
        <h2>Assessment Stage 3 – Decode Encrypted Data</h2>
        <p>Candidate: <strong>{userName}</strong> | Task Tracker: <strong>{cryptoIndex + 1} / {cryptoQuestions.length}</strong></p>
        <hr style={{ marginBottom: '30px' }} />

        {/* Split Container: Left side is Form, Right side is Word Bank */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', alignItems: 'start' }}>
          
          {/* LEFT SIDE: INPUT FORM */}
          <div>
            <p style={{ fontSize: '16px', color: '#444' }}>Analyze the Ciphertext value and type your decoded text answer inside the field block:</p>
            
            <div style={{ background: '#f3f4f6', padding: '25px', borderRadius: '5px', fontSize: '26px', fontWeight: 'bold', letterSpacing: '2px', margin: '20px 0', textAlign: 'center' }}>
              {currentPuzzle.encrypted_message}
            </div>

            <form onSubmit={handleCryptoSubmit}>
              <input 
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type plaintext match here"
                style={{ width: '100%', padding: '12px', fontSize: '16px', marginBottom: '15px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ padding: '12px 24px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Submit Decode Entry
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowHint(true); setHintsUsedCount(p => p + 1); }}
                  style={{ padding: '12px 24px', background: '#eab308', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Reveal Hint
                </button>
              </div>
            </form>

            {showHint && (
              <p style={{ marginTop: '20px', background: '#fef9c3', padding: '15px', borderLeft: '5px solid #eab308', borderRadius: '4px' }}>
                <strong>Hint Guide:</strong> {currentPuzzle.hint}
              </p>
            )}
          </div>

          {/* RIGHT SIDE: WORD BANK / OPTIONS BOX */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 15px 0', textAlign: 'center', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
              💡 Possible Decryption Keys
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {wordBankOptions.map((word, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '8px 12px', 
                    background: '#fff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '4px', 
                    fontSize: '15px', 
                    fontFamily: 'monospace', 
                    fontWeight: 'bold', 
                    color: '#334155',
                    textAlign: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }



    // --- STAGE 4 VIEW RENDERER ---
  if (stage === 4) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '650px', margin: '0 auto' }}>
        <h2>Full-Stack Assessment Complete!</h2>
        <p>Thank you for submitting your assessment profile, <strong>{userName}</strong>.</p>
        <hr />
        
        <h3 style={{ marginTop: '30px' }}>Global Performance Leaderboard</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>Sorted by Highest Score, then Lowest Time Taken.</p>

        {/* Structural Assessment Scorecard Table Display */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#e5e7eb', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '12px' }}>Rank</th>
              <th style={{ padding: '12px' }}>Candidate Name</th>
              <th style={{ padding: '12px' }}>Overall Score</th>
              <th style={{ padding: '12px' }}>Tier Classification</th>
              <th style={{ padding: '12px' }}>Time (s)</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardEntries.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Syncing dashboard rows...</td>
              </tr>
            ) : (
              leaderboardEntries.map((entry, idx) => (
                <tr key={entry.id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: entry.name === userName ? '#f0fdf4' : 'transparent' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{idx + 1}</td>
                  <td style={{ padding: '12px' }}>{entry.name} {entry.name === userName && "(You)"}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#16a34a' }}>{entry.score}</td>
                  <td style={{ padding: '12px', fontStyle: 'italic' }}>{entry.classification}</td>
                  <td style={{ padding: '12px' }}>{entry.time_taken}s</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }


  return null;
}

