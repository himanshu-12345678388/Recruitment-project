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
  const [showHint,setshowHint] = useState(false);


  //trackign metrics
  const [incorrectAttempts ,setIncorrectattempts] = useState(0);
  const [hintsUsed,setHintsUsedCount]=useState(0);
  

  // --- KICKOFF METHOD FOR MATRIX TASK ---
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

  // --- INTERACTION EVENT HANDLERS ---
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

    const currentPuzzle = cryptoQuestions[cryptoIndex];

    try {
      const result = await apiService.verifyCryptoAnswer(currentPuzzle.id, userInput);

      if (result && result.correct) {
        alert("Correct decryption match!");
        setUserInput('');
        setshowHint(false);

        if (cryptoIndex + 1 < cryptoQuestions.length) {
          setCryptoIndex(prev => prev + 1);
        } else {
          alert("Assessment stage 3 fully cleared! moving to leaderBoard.");
          setStage(4);
        }
      } else {
        alert("Incorrect decoded message text. Try again!");
        setIncorrectattempts(prev => prev + 1);
      }
    } catch (err) {
      alert("Error processing decryption check request");
    }
  };


  

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


    // --- STAGE 3 VIEW RENDERER ---
  if (stage === 3) {
    if (cryptoQuestions.length === 0) return <div style={{ padding: '40px' }}>Loading Decryption Module...</div>;
    const currentPuzzle = cryptoQuestions[cryptoIndex];

    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
        <h2>Assessment Stage 3 – Decode Encrypted Data</h2>
        <p>Decode the following string accurately to pass the verification rule gateway.</p>
        <hr />
        <h3>Message {cryptoIndex + 1} of {cryptoQuestions.length}</h3>
        
        <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '5px', fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px', margin: '20px 0', textAlign: 'center' }}>
          {currentPuzzle.encrypted_message}
        </div>

        <form onSubmit={handleCryptoSubmit}>
          <input 
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type plaintext match here"
            style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '10px', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ padding: '10px 20px', background: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer', marginRight: '10px' }}>
            Submit Decode Entry
          </button>
          <button 
            type="button" 
            onClick={() => { setshowHint(true); setHintsUsedCount(p => p + 1); }}
            style={{ padding: '10px 20px', background: '#eab308', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Reveal Hint
          </button>
        </form>

        {showHint && (
          <p style={{ marginTop: '15px', background: '#fef9c3', padding: '10px', borderLeft: '5px solid #eab308' }}>
            <strong>Hint Guide:</strong> {currentPuzzle.hint}
          </p>
        )} 
      </div>
    );
  }

  return null;
}

