import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import Fortmatic from "fortmatic";
import Web3 from "web3";
import {smartContractAddress, smartContractABI} from "./smartContractInfo";

const fm = new Fortmatic(process.env.REACT_APP_FORTMATIC_API_KEY, "ropsten");
const web3 = new Web3(fm.getProvider());
const contract = new web3.eth.Contract(smartContractABI, smartContractAddress);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

export {fm, web3, contract};