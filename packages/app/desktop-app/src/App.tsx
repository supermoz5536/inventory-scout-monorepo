import React, { useState } from "react";
import "./App.css";
import { ButtonShared } from "component-shared";

function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="App">
      <header className="App-header">
        <ButtonShared />
        <p>{count}</p>
        <button
          onClick={() => {
            console.log();
            setCount(window.myAPI.counter(count));
          }}
        >
          counter
        </button>
      </header>
    </div>
  );
}

export default App;
