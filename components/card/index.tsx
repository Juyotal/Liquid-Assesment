import Lottie, { LottieOptions } from "lottie-react-web";


type CardProps = {
    i: number,
    flipped: boolean,
    matchedCards: number[],
    notSolved: boolean,
    gameOver: boolean,
    animation: LottieOptions
    onClick: (i: number) => void
}


export const Card = (props: CardProps) => {
    let { i, flipped, matchedCards, notSolved, gameOver, animation, onClick } = props
    const matched = matchedCards.includes(i) ? true : false;

    return (
        <div
            onClick={() => {
                onClick(i);
            }}
            className={`card 
            ${i > 4? "row-2" : "row-1" }
            ${flipped || matched ? "active" : ""} 
            ${matched ? "matched" : ""} 
            ${gameOver ? "gameover" : ""}
            ${notSolved ? "active undone" : ""}
            `}
        >
            <div className="card-front">
                <Lottie
                    options={{
                    animationData: animation.animationData,
                    loop: matchedCards.length == 10 ? true : false,
                    }}
                />
            </div>
            <div className="card-back">
                <div className="card-back-inner" />
            </div>
        </div>   
    )
}