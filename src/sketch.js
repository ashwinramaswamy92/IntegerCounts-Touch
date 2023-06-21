/*
CONCEPTS AND TERMS:

1. A 'Tower Pair' is one coupled pair of positive tower and negative tower - we so far 
are writing operations to act on a single tower pair.
2. A 'Block' represents either a +1 or a -1. The number of blocks on each side of a tower pair is
stored in TowerPair.currentPostitiveUnits and TowerPair.currentNegativeUnits.
3. The 'State' of the system can be represented by the number of units on each side, as long as
there is only a single tower pair representing the whole equation. 
So conceptually (not necessarily implemented in code, but useful to think of it this way): 
  a. State(towerPair) = {towerPair.currentPostitiveUnits, towerPair.currentNegativeUnits}
  b. State(whole system) = {State(towerPair) for all towerPairs}
4. The 'Division Line' is the visual line that separates positive and negative sides of the screen.
5. An 'Operation' is a leads to a change of state of the system.
Therefore, if there is a single tower pair, the operation is applied to the tower pair.
But if there are multiple tower pair, a single operation might have to operate on multiple tower pairs.

OPERATIONS:

The following operations are to be built:
  a. Increment(n, side): increment positive or negative side by n. So adds either a +n or -n to the expression.
  This is implemented with unit increments via initiateIncrementPositive or initiateIncrementNegative.
  Called by touching with n fingers.
  b. Flip(): Multiplies expression by -1.
  all positive blocks across all towers switch to negative and vice versa.
  Called by swiping across division line.
  c. Subtract(n, side): removes n blocks from either the positive or negative side.
  d. Neutralize(): Removes a +1 and a -1 from the system. Does nothing to the overall expression.
  Called by pinching in.
  e. ReverseNeutralize(): Adds a +1 and a -1 to the system. Does nothing to the overall expression.
  Called by pinching out.


ANIMATION FLOW CONTROL LOGIC:

Animations represent transitions between states (except for some animations like zoom in/zoom out).
Most animations are associated with a mathematical operation on the integer expression.
This means that there needs to be a change of state at the end of the state transition animation.

The general strategy is:
- For each operation there will be two methods/functions: one is operation() and the other is initiateOperation().
- initiateOperation() is to be called once when a relevant touch event occurs. This sets an operation trigger to true.
- The operation implmentation itself is spread out over time because of the animation. Therefore it is to be called in draw
- As long as the operation trigger is true, the operation() function is to be called continuously in draw().
- Inside the operation() function two main things are done: 
    (a) Animation being called continuously
    (b) Once animation is terminated, a block of code is to be run a single time.
        This is done by wrapping it into a conditional for when the animation control variable reaches its terminal value.
        In this block of code, the state change associated with the operation is implemented.
        In the same block, the operation trigger is set to false, and the animation control variable is reset.



TOUCH FUNCTIONS:

1. Tap with n fingers
2. Swipe Across division Line
3. Swipe across blocks
4. Pinch In
5. Pinch Out

When user touches for pinching and swiping, a trick has to be applied to prevent the automatic registration of a tap.
This is done by using the function prepareTap() which sets off a timer.
If a swipe or pinch event is registered within (tapDelay) milliseconds of calling prepareTap, then unprepare the tap.
If you ever run into issues like swiping or pinching leading to unwanted increments or increments being too delayed,
try messing around with the value of 'tapDelay'.

*/

let currentObjectIndex = -1;
let objectList = [];
let lastTouchTime = 0;
let dragObject = null;
let towerPair = new TowerPair();

let canvasContainer;
let canvas;

function setup() {

  //Using a container the same size as the canvas for hammer.js to detect touch events
  canvasContainer = document.getElementById('swipe-container');
  canvas = createCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
  canvas.parent(canvasContainer);
  canvas.position(0, 0); 

  //setupColors
  setupColors();


  //anchor tower pair to center
  towerPair.setPosition(width / 2, height / 2)

  //setup touch funcctions
  // setupTouch();

  //Listening for touch events and preventing the default behaviors - scrolling, screenshot, etc.
  preventDefaultTouchEvents();

  //While debugging/developing
  // setupOperatorButtons();
}

function draw() {
  background(230);




  //Draw line across screen
  renderDividingLine();




  //Interaction
  triggerTouchEvents();

  //Drawing on each side
  towerPair.renderPositive();
  towerPair.renderNegative();

  
  //FOR DEBUGGING: To visualize tap and swipe coordinates 
  // showTapAndSwipe();


  //Animations and operations
  if (currentlyAnimating.INCREMENTING_POSITIVE) {
    // console.log("Incrementing Positive")
    towerPair.incrementPositive();
  }
  if (currentlyAnimating.INCREMENTING_NEGATIVE) {
    // console.log("Incrementing Negative")
    towerPair.incrementNegative();
  }

  if (currentlyAnimating.FLIPPING) {
    towerPair.flip();
  }


  if (currentlyAnimating.PINCHING_IN) {
    // console.log("PINCHING INN")
    towerPair.pinchIn();
  }

  if (currentlyAnimating.PINCHING_OUT) {
    // console.log("PINCHING OUT")
    towerPair.pinchOut();
  }

  if (currentlyAnimating.SUBTRACTING) {
    // console.log("SUBTRACTING")
    towerPair.subtract(currentSubtrahend)
  }

  // Dynamic Expression Rendering
  showDynamicExpression();


  //Resetting Anything that needs be reset
  resetTouchEvents();



}

