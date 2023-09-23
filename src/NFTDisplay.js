import { formatEther } from 'ethers';
import React, { useState, useEffect } from "react";
import styled from 'styled-components';

const Card = styled.div`
  border: 1px solid #ccc;
  padding: 20px;
  margin: 10px;
  position: relative;
  width: 12.5%;
  height: 100%;
`;

const TopLeft = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.5em;
`;

const TopRight = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.8em;
`;

const BottomRight = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 0.8em;
`;

const CenterContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const InnerWrapper = styled.div`
  text-align: left;
`;

const NFTDisplay = (props) => {
  const [fetchedTokens, setFetchedTokens] = useState([]);
  const [sortedTokens, setSortedTokens] = useState([]);
  const [sortProperty, setSortProperty] = useState("userId");
  const [sortOrder, setSortOrder] = useState("asc");

  const sortTokens = (tokens, property, order) => {
    const sorted = [...tokens].sort((a, b) => {
      const valA =
        typeof a[property] === "bigint" ? a[property].toString() : a[property];
      const valB =
        typeof b[property] === "bigint" ? b[property].toString() : b[property];

      if (order === "asc") {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });
    setSortedTokens(sorted);
  };

  useEffect(() => {
    const fetchTokens = async () => {
      const contract = props.contract;
      if (contract && contract.methods) {
        const tokens = await contract.methods.getAllTokens().call();
        const annotatedTokens = tokens.map((token, index) => ({
          ...token,
          originalIndex: index + 1,
        }));
        setFetchedTokens(annotatedTokens);
      }
    };
    fetchTokens();
  }, [props.contract]);

  useEffect(() => {
    sortTokens(fetchedTokens, sortProperty, sortOrder);
  }, [fetchedTokens, sortProperty, sortOrder]);

  return (
    <div>
      {sortedTokens.length > 0 && (
        <>
          <label>Sort By:</label>
          <select onChange={(e) => setSortProperty(e.target.value)}>
            <option value="userId">User ID</option>
            <option value="username">Username</option>
            <option value="walletbalance">Balance</option>
            <option value="datecreated">Date Created</option>
          </select>
          <select onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </>
      )}
      {sortedTokens.map((token) => (
        <Card key={token.originalIndex}>
          <TopLeft>NFT {token.originalIndex}</TopLeft>
          <TopRight>{token.tokentype}</TopRight>
          <CenterContent>
            <InnerWrapper>
                <p style={{marginBottom: 0, marginTop: "25px"}}>User: {token.username}</p>
                <p style={{marginTop: 0}}>Balance: {parseFloat(formatEther(token.walletbalance.toString())).toFixed(10)} ETH</p>
            </InnerWrapper>
          </CenterContent>
          <BottomRight>
            Date Created:{" "}
            {new Date(parseInt(token.datecreated) * 1000).toLocaleString()}
          </BottomRight>
        </Card>
      ))}
    </div>
  );
};

export default NFTDisplay;
