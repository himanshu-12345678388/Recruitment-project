import { createRoot } from 'react-dom/client';
import App from './App';

//get div root from /public/index.html
const container=document.getElementById('root');
const root=createRoot(container);


root.render(<App />);