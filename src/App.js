import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CompareNFT from './CompareNFT.json'; // the ABI

function App() {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(0);
    const [web3, setWeb3] = useState(null);
    const [username, setUsername] = useState('');
    const [contract, setContract] = useState(null);
    const [userHasMinted, setUserHasMinted] = useState(false);
    const [tokens, setTokens] = useState([]);

    // CompareNFT Contract Address
    const contractAddress = "0x621Ef13e08a65C1114cf6c4D817113c0117c9d55";

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

    useEffect(() => {
        const checkIfUserHasMinted = async () => {
            if (contract && account) {
                const hasMinted = await contract.methods.checkIfUserHasNFT(account).call();
                setUserHasMinted(hasMinted);
            }
        };
    
        checkIfUserHasMinted();
    }, [contract, account]);

    useEffect(() => {
        const fetchTokens = async () => {
            if (contract && web3) {
                const tokens = await contract.methods.getAllTokens().call();
                const updatedTokens = tokens.map(token => {
                    let balanceString = token.walletbalance.toString();
                    let balanceInEther = web3.utils.fromWei(balanceString, 'ether');
                    return {
                        ...token,
                        userId: token.userId.toString(),
                        walletbalance: balanceInEther,
                        datecreated: token.datecreated.toString(),
                    };
                });
                setTokens(updatedTokens);
            }
        };
        fetchTokens();
    }, [contract, web3]);

    const connectWallet = async () => {
        if (web3) {
            try {
                const accounts = await web3.eth.requestAccounts();
                setAccount(accounts[0]);

                const compareNFT = new web3.eth.Contract(CompareNFT.abi, contractAddress);
                setContract(compareNFT);

                const accountBalance = await web3.eth.getBalance(accounts[0]);
                setBalance(web3.utils.fromWei(accountBalance, 'ether').toString());

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
            const _walletbalance = web3.utils.toWei(balance, 'ether');
            const _tokentype = "ETH";

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
            { account && !userHasMinted &&
                <div>
                    <input type="text" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} />
                    <button onClick={mintNFT}>Mint NFT</button>
                </div>
            }
            {tokens.map((token, index) => (
                <div key={index}>
                    <h2>NFT {index + 1}</h2>
                    <p>UserId: {token.userId}</p>
                    <p>Username: {token.username}</p>
                    <p>Balance: {token.walletbalance} ETH</p>
                    <p>Token Type: {token.tokentype}</p>
                    <p>Date Created: {new Date(parseInt(token.datecreated) * 1000).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
}

export default App;
