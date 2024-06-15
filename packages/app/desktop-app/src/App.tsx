import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { ButtonShared } from "component-shared";

function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <ButtonShared />
        <p>{count}</p>
        <button
          onClick={() => {
            console.log();
            setCount(window.myAPI.counter(count));
          }}
        >
          count
        </button>
      </header>
    </div>
  );
}

export default App;
