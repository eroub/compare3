import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CompareNFT from './CompareNFT.json'; // the ABI

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [web3, setWeb3] = useState(null);
  const [username, setUsername] = useState('');
  const [contract, setContract] = useState(null);

  // CompareNFT Contract Address
  const contractAddress = "0x574D112dF29aDe07ea7D14b238203666E3e6a6a0";

  const loadWeb3 = async () => {
    if (window.ethereum) {
        let web3 = new Web3(window.ethereum);
        setWeb3(web3);
    } else if (window.web3) {
        let web3 = new Web3(window.web3.currentProvider);
        setWeb3(web3);
    } else {
        window.alert('Non-Ethereum browser detected! You should consider trying MetaMask!');
    }
  };

  useEffect(() => {
    loadWeb3();
  }, []);

  const connectWallet = async () => {
    if (web3) {
        try {
            const accounts = await web3.eth.requestAccounts();
            setAccount(accounts[0]);

            const compareNFT = new web3.eth.Contract(CompareNFT.abi, contractAddress);
            setContract(compareNFT);

            const accountBalance = await web3.eth.getBalance(accounts[0]);
            setBalance(web3.utils.fromWei(accountBalance, 'ether'));

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        } catch (error) {
            console.error("Error connecting wallet: ", error);
        }
    } else {
        window.alert('Please install MetaMask!');
    }
  };

  const mintNFT = async () => {
    if (contract) {
      const _walletbalance = balance;
      const _tokentype = "ETH"; // Update this as needed
  
      try {
        await contract.methods.createToken(username, _walletbalance, _tokentype).send({ from: account });
        alert("Minting successful");
      } catch (error) {
        console.error("Error minting NFT: ", error);
        alert("There was an error while minting your NFT. Please check the console for more information.");
      }
    }
  }

  return (
    <div>
      <h1>Compare3</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      { account && <p>Connected account: {account}</p> }
      { account && <p>Balance: {balance} ETH</p> }
      { account && 
        <div>
          <input type="text" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} />
          <button onClick={mintNFT}>Mint NFT</button>
        </div>
      }
    </div>
  );
}

export default App;
