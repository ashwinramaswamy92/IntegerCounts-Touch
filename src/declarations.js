
//---------------------------- TOUCHSCREEN -----------------------------------//

//Tracking Variables
let lastTapTime;
let lastTapSide = 0;  //+1 or -1 depending on which side you tap it
let isPreparingToTap = false; //Boolean set to true when a tap is registered. Falsified if a swipe or pinch is detected thereafter.
let preparedTapIncrements = [0, 0]; //2 element array, first one is for positive taps prepped, second is for negative.

let pinchedInThisCycle;
let pinchedOutThisCycle;
let swipedUpDownThisCycle;
let swipedLeftRightThisCycle;

//Constants
const tapDelay = 300; //Delay in MS before tap is registered
const hitBoxAccuracy = 2/3;
const swipeHitResolution = 50; //Number of points interpolated between start and end of swipe for which we check hitbox

let swipeHits = [];

//----------------------------- GRAPHICS --------------------------------------//

let positiveTowerColor;
let negativeTowerColor;
let expressionColor;

let expressionTextSize = 28;


//----------------------ANIMATIONS-----------------------------------//

//To keep track of which animation is currently occuring. false for each animation by default - set to true when you need to.
let currentlyAnimating = {
  INCREMENTING_POSITIVE: false,
  INCREMENTING_NEGATIVE: false,
  SUBTRACTING: false,
  FLIPPING: false,
  PINCHING_IN: false,
  PINCHING_OUT: false,
  ZOOMING_OUT: false,
  ZOOMING_IN: false,
  DRAGGING: false
}

const SPEED = {
  flipping : 0.05,
  disappearing : 25/255,
}


//----------------------OPERATIONS------------------------------------//

let currentSubtrahend = 0;
let numberOfTaps;


let touchesStartCurrent;
let swipeEndCurrent;
