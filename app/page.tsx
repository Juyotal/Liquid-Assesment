"use client"
import Image from 'next/image';
import { useState, useEffect, useRef } from "react";
import { Legend } from '@/components/legend';
import { Card } from '@/components/card';
import { updateUserScore } from '@/services/gameScore.service';
import { auth } from '@/config/firebase';

import banana from '@/public/lotties/banana.json';
import orange from '@/public/lotties/orange.json';
import pineapple from '@/public/lotties/pineapple.json';
import strawberry from '@/public/lotties/strawberry.json';
import watermelon from '@/public/lotties/watermelon.json';
import dotedLine from '@/public/landing/img-top-dotted-line.svg'
import smallDotedLine from '@/public/landing/img-top-dotted-line-mobile.svg'
import bee from '@/public/landing/img-bee.svg'
import replay from '@/public/landing/replay.svg'

import { LottieOptions } from "lottie-react-web";


export type LegendRefType = {
  updateLegend: () => void;
};

const board: { [key: string]: LottieOptions } = {
  banana: { animationData: banana },
  orange: { animationData: orange },
  pineapple: { animationData: pineapple },
  strawberry: { animationData: strawberry },
  watermelon: { animationData: watermelon }
};

const keys: string[] = Object.keys(board);

const turnsAllowed = 10;

export default function Home() {

  const legendRef = useRef<LegendRefType | null>(null)


  const shuffle = () => {
    const shuffledCards = [...keys, ...keys]
      .sort(() => Math.random() - 0.5)
      .map((v) => v);

    setBoardData(shuffledCards);
  };

  const initialize = () => {
    shuffle();
    setGameOver(false);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setUnsolved([]);
    if (legendRef.current) {
      legendRef.current.updateLegend();
    }
  };


  const updateActiveCards = async (i: number) => {
    if (flippedCards.includes(i) || disableUpdates) {
      return;
    }
    if (flippedCards.length % 2 === 1) {
      setFlippedCards([...flippedCards, i]);
      setMoves((prev) => prev + 1)
      const firstIdx = flippedCards.slice(-1)[0];
      const secondIdx = i;
      _evaluatePair(firstIdx, secondIdx)
    } else {
      setFlippedCards([...flippedCards, i]);
    }
  };


  const _evaluatePair = (firstIdx: number, secondIdx: number) => {
    if (boardData[firstIdx] === boardData[secondIdx]) {
      setMatchedCards((prev: number[]) => [...prev, firstIdx, secondIdx]);
    } else {
      setDisableUpdates(true); 
      setTimeout(() => {
        setFlippedCards(flippedCards.slice(0, -1));
        setDisableUpdates(false);
      }, 500);
    }
  }
  
  
  const [boardData, setBoardData] = useState<string[]>([]);
  const [disableUpdates, setDisableUpdates] = useState(false);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [unsolved, setUnsolved] = useState<(number | undefined)[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [gameOver, setGameOver] = useState(false);

  const accuracy = () => {
    return moves > 0 ? parseFloat((((matchedCards.length/2) / (moves)) * 100).toFixed(1)) : 0;
  }

  const getUmatchedCards = () => {
    const unmatchedCards = boardData.map((_, i) => {
      if (!matchedCards.includes(i)) {
        return i;
      }
    })
    setUnsolved(unmatchedCards);
  }

  const packForStorage = () => {
    const data = {
      boardData,
      flippedCards,
      matchedCards,
      moves,
      gameOver,
      disableUpdates
    }
    return data;
  }

  const unpackFromStorage = (data:any) => {
    setBoardData(data.boardData);
    setFlippedCards(data.flippedCards);
    setMatchedCards(data.matchedCards);
    setMoves(data.moves);
    setGameOver(data.gameOver);
    setDisableUpdates(data.disableUpdates);
  }

  const savetoLocalStorage = (event: any) => {
    localStorage.setItem("save_file", JSON.stringify(packForStorage()))
    event.returnValue = '';
  };
  try{
    window.addEventListener('beforeunload', savetoLocalStorage);
  } catch(e) {}

  useEffect(() => {
    if (matchedCards.length == 10 || turnsAllowed == moves) {
      setGameOver(true);
      getUmatchedCards();
      const user = auth.currentUser;
      if (user) {
        updateUserScore(accuracy());
      }
    }
  }, [moves]);

  useEffect(() => {
    const saveData = localStorage.getItem("save_file");
    if (saveData) {
      unpackFromStorage(JSON.parse(saveData));
    } else {
      initialize()
    }
  }, []);

  const renderCards: any = () => {
    return boardData.map((data:any, i:any) => {
      const flipped = flippedCards.includes(i) ? true : false;
      const notSolved = unsolved.includes(i) ? true : false;
      return (
        <Card 
          key={i}
          i={i}
          flipped={flipped}
          matchedCards={matchedCards}
          notSolved={notSolved}
          gameOver={gameOver}
          animation={board[data]}
          onClick={updateActiveCards}
        />
      )
    })
  }


  const renderResetButton: any = () => {
    if (gameOver) {
      return (
        <div className="sec">
          <button onClick={() => initialize()} className="button secondary">
            <Image src={replay} alt="replay" className='replay-btn' />
            Replay
          </button>
        </div>
      )
    }
    return (
      <div className="sec">
        <p className='rest-p-two'>Mix and match the tiles and more more more!"</p>
      </div>
    )
  }


  const renderDashboard: any = () => {
    if ((turnsAllowed - moves) == 0 && !(matchedCards.length == 10)){
      return (
        <h1>"OOps!! Out of Moves!!"</h1>
      )
    } 
    if (matchedCards.length == 10) {
      return (
        <>
        <h1>"Well Done!! All matched!!"</h1>
        <h1>{`You Achieved: ${accuracy()}% Accuracy!!`}</h1>
        </>
      )
    }   
    return (
      <>
      <h1>{`Turns => ${moves}`}</h1>
      <h1>{`Turns-Remaining => ${turnsAllowed - moves}`}</h1>
      <h1>{`Round-Accuracy => ${accuracy()}`}</h1>
      </>
    )     
  }
  
  
  return(
    <div className=" app align-items-center">
      <div className="small-screen">
        <Image src={bee} alt="bee"  className="small-bee"/>
        <div className="top">
          <div className='line-reset'>
            <Image src={smallDotedLine} alt="dotted_Line" className='small-dotted-line' />
            {renderResetButton()}
          </div>
        </div>
      </div>
      <div className="container align-items-center">
        <div className="wide-screen">
            <div className="reset">
              <Image src={dotedLine} alt="dotted_line" className='wide-dotted-line' />
              <Image src={bee} alt="bee"  className="wide-bee"/>
              {renderResetButton()}   
            </div>
        </div>
        <div className="board">
          {renderCards()}
        </div>
        <div className="dashboard">
          {renderDashboard()}
        </div>
      </div>
      <div className="legend">
        <Legend ref={legendRef}></Legend>
      </div>
    </div>
  );
}