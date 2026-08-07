



// TO WHOMEVER READING the logical half of this file is written by me 
// and other half i.e. DOM stuff is written with the help of AI


//smart work



import { useState } from 'react';
import { apiService } from '../services/api';

export default function App() {
  // Application Stage Control:
  //  0 = Register, 
  // 1 = Aptitude Test,
  // 2 = Matrix, 
  // 3 = encrypted.

  const [stage, setStage] = useState(0);

  // Stage 0  Registration States
  const [userName, setUserName] = useState('');

  // Stage 1 Aptitude Core States
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  // Stage 2  Technical Memory Matrix States
  const [matrixLevel, setMatrixLevel] = useState(1);
  const [flashTiles, setFlashTiles] = useState([]);       
  const [selectedTiles, setSelectedTiles] = useState([]); 
  const [isFlashing, setIsFlashing] = useState(false);     
  const [matrixScore, setMatrixScore] = useState(0);
  
  
  //stage 3  Decryption core states
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

  // start of even handlers
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

        //fetch fresh assesment
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



   



  // final leader logic function 
const submitFinalScorecard = async () => {
  try {
    // to read scores from aptitude and matrix task
    const currentAptitudeScore = typeof score === 'number' ? score : 0;
    const currentMatrixLevelScore = typeof matrixScore === 'number' ? matrixScore : 0;

    //total hints used
    const totalHintsUsed = typeof hintsUsedCount ==='number' ? hintsUsedCount:0;

    // 2. Clear mathematical evaluation matching  backend fields
    let finalOverallScore = (currentAptitudeScore * 6) + (currentMatrixLevelScore * 5) + 25; 

    finalOverallScore = finalOverallScore -(totalHintsUsed *10);

    //safety check
    if(finalOverallScore < 0) finalOverllScore=0;

    let performanceClassification = "Junior Developer Candidate";
    if (finalOverallScore >= 95) performanceClassification = "OutStanding";
    else if (finalOverallScore >= 85) performanceClassification = "Highy Qualified Engineer";
    else if (finalOverallScore >= 70) performanceClassification = "Qualified Candidate";
    else performanceClassification="Pack it Up lil bro ,it's over for u";

    //  Package payloads with keys === backend req.body 
    const scorecardPayload = {
      name: userName || "Anonymous Candidate",
      score: finalOverallScore,
      classification: performanceClassification,
      time_taken: 45 // Static tracking baseline in seconds
    };

    //  get the score card data from port 5000 aka backend
    await apiService.saveScorecard(scorecardPayload);
    
    // Fetch live rankings from database
    const liveRankings = await apiService.getLeaderboard();
    setLeaderboardEntries(liveRankings);

  } catch (err) {
    // if error occurs it will get logged in the server logs so we can debug ....easy work boy
    alert("React Code Execution Failure: " + err.message);
  }
};



//       HELLO ji FROM HERE I USED AI help COZ TIME KI KAMI THI TO WRITE ALL DOM STUFF uk 

//    please don't judge me  for it brotha
  


  //              AI USED FOR RENDERING PART AS IT TAKES TIME       //


  // STAGE 0  RENDER
  if (stage === 0) {
    return (
      <div className="portal-screen-container">
        <div className="portal-card max-md">
          <h2 className="portal-h2">Recruitment Portal</h2>
          <p className="portal-p-sub">Enter your full credentials to initialize the tracking assessment platform sequences.</p>
          <form onSubmit={handleStartAssessment}>
            <div className="form-group">
              <label className="form-label">Candidate Name</label>
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                placeholder="e.g. Himanshu"
                className="portal-input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Initializing Exam Core..." : "Begin Assessment"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // stage 1 render
  if (stage === 1) {
    if (questions.length === 0) return <div className="portal-screen-container"><div className="portal-p-sub">Syncing system rows...</div></div>;
    const currentQuestion = questions[currentIndex];

    return (
      <div className="portal-screen-container">
        <div className="portal-card max-lg">
          <div className="portal-header-meta">
            <div>Candidate: <span className="portal-meta-highlight">{userName}</span></div>
            <div>Question Tracker: <span className="portal-meta-highlight">{currentIndex + 1} / {questions.length}</span></div>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 24px 0', lineHeight: '1.5' }}>
            {currentQuestion.question}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[currentQuestion.option1, currentQuestion.option2, currentQuestion.option3, currentQuestion.option4].map((option, idx) => (
              <button key={idx} onClick={() => handleAnswerSubmit(option)} className="btn-option">
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // stage 2 render
  if (stage === 2) {
    return (
      <div className="portal-screen-container">
        <div className="portal-card max-md" style={{ textAlign: 'center' }}>
          <h2 className="portal-h2">Stage 2: Memory Matrix</h2>
          <p className="portal-p-sub" style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em' }}>
            Performance Matrix: Level {matrixLevel} / 3
          </p>
          <div className={`matrix-status ${isFlashing ? 'status-flash' : 'status-play'}`}>
            {isFlashing ? "Memorize the pattern indicators..." : "Your turn: click matching blocks"}
          </div>

          <div className="matrix-grid">
            {Array.from({ length: 16 }).map((_, idx) => {
              let customTileClass = "matrix-tile";
              if (isFlashing && flashTiles.includes(idx)) customTileClass += " flash";
              else if (selectedTiles.includes(idx)) customTileClass += " match";

              return (
                <button
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  disabled={isFlashing}
                  className={customTileClass}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  //  stage 3 render
  if (stage === 3) {
    if (cryptoQuestions.length === 0) return <div className="portal-screen-container"><div className="portal-p-sub">Syncing system rows...</div></div>;
    const currentPuzzle = cryptoQuestions[cryptoIndex];
    const wordBankOptions = ["HELLO", "access", "3AIR","#CORE"];

    return (
      <div className="portal-screen-container">
        <div className="portal-card max-xl">
          <div className="portal-header-meta">
            <div>Candidate: <span className="portal-meta-highlight">{userName}</span></div>
            <div>Crypto Decryption Task: <span className="portal-meta-highlight">{cryptoIndex + 1} / {cryptoQuestions.length}</span></div>
          </div>

          <div className="split-grid">
            <div>
              <h2 className="portal-h2">Stage 3 – Decode Encrypted Data</h2>
              <p className="portal-p-sub">Process the target ciphertext structure string and enter your plain decoded text value.</p>
              
              <div className="cipher-display">{currentPuzzle.encrypted_message}</div>

              <form onSubmit={handleCryptoSubmit}>
                <div className="form-group">
                  <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter plaintext matching string sequence"
                    className="portal-input"
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Entry</button>
                  <button 
                    type="button" 
                    onClick={() => { setShowHint(true); setHintsUsedCount(p => p + 1); }}
                    className="btn-primary" 
                    style={{ background: '#d97706', width: 'auto' }}
                  >
                    Reveal Hint
                  </button>
                </div>
              </form>

              {showHint && (
                <div style={{ marginTop: '20px', background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '8px', fontSize: '14px', color: '#b45309', fontWeight: '500' }}>
                  <strong>Logic Clue parameters:</strong> {currentPuzzle.hint}
                </div>
              )}
            </div>

            <div className="sidebar-panel">
              <h4 className="sidebar-title">💡 Possible Keys</h4>
              {wordBankOptions.map((word, idx) => (
                <div key={idx} className="sidebar-row">{word}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // stage 4 render
  if (stage === 4) {
    return (
      <div className="portal-screen-container">
        <div className="portal-card max-lg">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="portal-h2" style={{ fontSize: '26px' }}>Assessment Complete</h2>
            <p className="portal-p-sub">Candidate tracking metrics compiled. Performance parameters uploaded to database server logs.</p>
          </div>
          
          <div className="portal-header-meta" style={{ marginBottom: '16px' }}>
            <div style={{ color: '#0f172a', fontStyle: 'normal' }}>Global Performance Standings</div>
            <div style={{ fontSize: '10px' }}>Rank Matrix Model Filters Active</div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#ffffff' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th style={{ textCenter: 'center', width: '60px' }}>Rank</th>
                  <th>Developer Profile</th>
                  <th style={{ textCenter: 'center', width: '100px' }}>Score</th>
                  <th>Classification Evaluation Tier</th>
                  <th style={{ textCenter: 'center', width: '100px' }}>Latency</th>
                </tr>
              </thead>
                <tbody>
                  {leaderboardEntries.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '32px', textCenter: 'center', color: '#94a3b8', fontStyle: 'italic' }}>Syncing standings tracker matrices...</td>
                    </tr>
                  ) : (
                    leaderboardEntries.map((entry, idx) => {
                      const isSelf = entry.name === userName;
                      return (
                        <tr key={entry.id || idx} className={isSelf ? "row-self" : ""}>
                          <td style={{ textCenter: 'center', fontWeight: '700', color: isSelf ? '#15803d' : '#94a3b8' }}>{idx + 1}</td>
                          <td>
                            {entry.name}
                            {isSelf && <span className="badge-self">You</span>}
                          </td>
                          <td style={{ textCenter: 'center', fontWeight: '700', color: '#2563eb' }}>{entry.score}</td>
                          <td style={{ fontStyle: 'italic', fontSize: '13px', color: isSelf ? '#1e293b' : '#64748b' }}>{entry.classification}</td>
                          <td style={{ textCenter: 'center', fontFamily: 'monospace', fontWeight: '600' }}>{entry.time_taken}s</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }


  return null;
}

