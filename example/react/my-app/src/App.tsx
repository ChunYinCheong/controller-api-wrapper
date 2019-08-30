import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import wrapper from './api-wrapper/server-api';

const App: React.FC = () => {
  const [state, setState] = useState("");
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
        <div>
          Result: {state}<br />
          <button onClick={async () => {
            let res = await wrapper.api.product.get({ id: 1 });
            setState(JSON.stringify(res.data));
          }}>product get</button>
          <button onClick={async () => {
            let res = await wrapper.api.user.get({ id: 1 });
            setState(JSON.stringify(res.data));
          }}>user get</button>
          <button onClick={async () => {
            let res = await wrapper.api.product.post({ name: 'name' });
            setState(JSON.stringify(res.data));
          }}>product post</button>
          <button onClick={async () => {
            let res = await wrapper.api.user.post({ name: 'name' });
            setState(JSON.stringify(res.data));
          }}>user post</button>
        </div>
      </header>
    </div>
  );
}

export default App;
