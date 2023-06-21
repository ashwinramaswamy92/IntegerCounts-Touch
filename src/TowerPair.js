class TowerPair {
  constructor() {
    this.objectId = 0;
    this.currentPositiveUnits = 0;
    this.currentNegativeUnits = 0;
    this.blockSize = [40, 40];
    this.position = [0, 0];     //The midpoint of the intersection base of both towers.
    this.time = 0;
    this.dragOffset = [0, 0];

    //Animation state tracking variables
    this.newPositiveBlockAlpha = 0;
    this.newNegativeBlockAlpha = 0;
    this.positiveTowerAlpha = 255;
    this.negativeTowerAlpha = 255;
    this.fractionDisappeared = 0; //Tracks how far into the (dis)appearing animation of a block we are, as a fraction of 1.
    this.flipFactor = 1; //To be implemented as scale(1, flipFactor) in a transformation matrix during rendering.
  }




  //--------------------------------------------SETTERS-----------------------------------------//

  setPosition(x, y) {
    this.position = [x, y];
  }


  //-------------------------------------------- GETTERS --------------------------------------//

  getBlockHeadTargetPositions(){
    //Returns a object containing x and y of subtraction target of each block of each side.
    let positiveArray = [];
    let negativeArray = [];

    for (let i = 0; i < this.currentPositiveUnits; i++){
      let point = {
        x : this.position[0],
        y : this.position[1] - (i + 1)*this.blockSize[1]
      }
      positiveArray.push(point);
    }
    
    for (let i = 0; i < this.currentNegativeUnits; i++){
      let point = {
        x : this.position[0],
        y : this.position[1] + (i + 1)*this.blockSize[1]
      }
      negativeArray.push(point);
    }

    let returnObject = {
      positive : positiveArray,
      negative : negativeArray
    }
    return returnObject;
  }

  getHitBoxRadius(){
    //Returns the computed radius of the hitbox for subtraction based on block size
    return this.blockSize[1]*hitBoxAccuracy;
  }


  //---------------------------------ANIMATION + OPERATION INITIATORS--------------------------------------//

  //These methods trigger off an animation which ends in the relevant operation being performed.

  initiateIncrementPositive() {
    //Call this when you want to add one to positive side, and this will call addPositive() while taking care of the animation timing

    // console.log("Initiated Incremented Postive"); 
    currentlyAnimating.INCREMENTING_POSITIVE = true;
  }

  initiateIncrementNegative() {
    //Call this when you want to add one to positive side, and this will call addPositive() while taking care of the animation timing
    // console.log("Initiated Incremented Negative");  
    currentlyAnimating.INCREMENTING_NEGATIVE = true;
  }

  initiateFlip() {
    currentlyAnimating.FLIPPING = true;
  }

  initiatePinchIn() {
    //Only works if theres at least one of each side
    // if(this.currentNegativeUnits >= 1 && this.currentPositiveUnits >= 1){
    // console.log("Initiated Pinch IN");
    currentlyAnimating.PINCHING_IN = true;
    // } else{
    //   console.log("Cant pinch in when theres no block pair")
    // }
  }

  initiatePinchOut() {
    currentlyAnimating.PINCHING_OUT = true;
  }

  initiateSubtract() {
    currentlyAnimating.SUBTRACTING = true;
  }

  incrementPositive() {
    //To be called continuously in draw under a control structure. While the primary purpose of this function is to increment this.currentPositiveUnits, we could transition into this state via an animation.
    //preparedTapIncrements[0] is a global that stores the number of positive taps prepared.

    //Animation part: animates appearance of a single block by increasing its alpha:
    let startXY = [this.position[0] - this.blockSize[0] / 2, this.position[1] - this.blockSize[1]];
    this.newPositiveBlockAlpha += 25;     //The main animating step
    stroke(0, this.newPositiveBlockAlpha);
    strokeWeight(2);
    fill(255, 0, 0, this.newPositiveBlockAlpha);
    for (let i = 0; i < preparedTapIncrements[0]; i++) {
      rect(startXY[0], startXY[1] - ((i + this.currentPositiveUnits) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
    }
    //Once animation termination is reached, perform the function's primary action, and then reset termination criteria for animations
    if (this.newPositiveBlockAlpha >= 255) {
      //Changes to state variables required of the function
      this.currentPositiveUnits += preparedTapIncrements[0];

      //Reset termination criteria
      currentlyAnimating.INCREMENTING_POSITIVE = false; //Stop calling this function in draw()
      this.newPositiveBlockAlpha = 0;   //Reset all animation state variables to allow future animations
    }
  }


  incrementNegative() {    
    //To be called continuously in draw under a control structure. While the primary purpose of this function is to increment this.currentNegativeUnits, we could transition into this state via an animation.
    //preparedTapIncrements[1] is a global that stores the number of negative taps prepared.

    //Animation part: animates appearance of a single block by increasing its alpha:
    let startXY = [this.position[0] - this.blockSize[0] / 2, this.position[1]];
    this.newNegativeBlockAlpha += 25;     //The main animating step
    stroke(0, this.newNegativeBlockAlpha);
    strokeWeight(2);
    fill(0, 0, 255, this.newNegativeBlockAlpha);
    for (let i = 0; i < preparedTapIncrements[1]; i++) {
      rect(startXY[0], startXY[1] + ((i + this.currentNegativeUnits) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
    }
    //Once animation termination is reached, perform the function's primary action, and then reset termination criteria for animations
    if (this.newNegativeBlockAlpha >= 255) {

      //Changes to state variables required of the function
      this.currentNegativeUnits += preparedTapIncrements[1];

      //Reset termination criteria
      currentlyAnimating.INCREMENTING_NEGATIVE = false;
      this.newNegativeBlockAlpha = 0;
    }
  }

  flip() {
    //This multiplies the whole expression by -1

    if (this.flipFactor > -1) {
      //Animation to flip these along z-axis
      this.flipFactor -= SPEED.flipping;     //The main animating step
      //Note that flipfactor is implmented as a scaling variable in the rendering methods.
      //flipFactor = -1 means the object being drawn is flipped completely about y axis.

    } else {
      //Perform the main operation
      let temp = this.currentPositiveUnits;
      this.currentPositiveUnits = this.currentNegativeUnits;
      this.currentNegativeUnits = temp;

      //Reset animation control variable
      this.flipFactor = 1;
      //Terminate function calls
      currentlyAnimating.FLIPPING = false;
    }
  }

  pinchIn() {
    //Nullifies the basemost (closest to baseline) pair of positive and negative units, if such a pair exists

    //First animate the pinch - create a white rectangle with increasing transparency at disappearing blocks
    this.fractionDisappeared += SPEED.disappearing;       //The main animating step
    let startXYPositive = [this.position[0] - this.blockSize[0] / 2, this.position[1] - this.blockSize[1]];
    let startXYNegative = [this.position[0] - this.blockSize[0] / 2, this.position[1]];
    stroke(255);
    strokeWeight(2);
    fill(255, 255 * this.fractionDisappeared);

    rect(startXYNegative[0], startXYNegative[1] + ((0) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
    rect(startXYPositive[0], startXYPositive[1] - ((0) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);


    //Then check for termination condition, and perform the pinching in operation
    if (this.fractionDisappeared >= 1) {

      //Perform changes to state variables required of the function
      this.currentNegativeUnits -= 1;
      this.currentPositiveUnits -= 1;

      //reset termination
      this.fractionDisappeared = 0;

      //break out of calling the method in draw()
      currentlyAnimating.PINCHING_IN = false;
    }
  }

  pinchOut() {
    //Adds one each of positive and negative units

    //First animate the pinch - create a white rectangle with decreasing transparency where new blocks should appear
    this.fractionDisappeared += SPEED.disappearing;       //The main animating step
    let startXYPositive = [this.position[0] - this.blockSize[0] / 2, this.position[1] - this.blockSize[1]];
    let startXYNegative = [this.position[0] - this.blockSize[0] / 2, this.position[1]];
    stroke(255);
    strokeWeight(2);
    fill(255, 255 - 255 * this.fractionDisappeared);

    rect(startXYNegative[0], startXYNegative[1] + ((this.currentNegativeUnits) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
    rect(startXYPositive[0], startXYPositive[1] - ((this.currentPositiveUnits) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);


    //Then check for termination condition, and perform the pinching in operation
    if (this.fractionDisappeared >= 1) {

      //Perform changes to state variables required of the function
      this.currentNegativeUnits += 1;
      this.currentPositiveUnits += 1;

      //reset termination
      this.fractionDisappeared = 0;

      //break out of calling the method in draw()
      currentlyAnimating.PINCHING_OUT = false;
    }


  }

  subtract(subtrahend) {
    //Removes n = subtrahend blocks from either positive or negative tower.
    //The subtrahend is a signed integer, the sign determines which tower (+ or -) is operated on

    //First animate the subtraction
    if (subtrahend > 0 && this.currentPositiveUnits >= Math.abs(subtrahend)) { //Positive tower subtraction

      //Animate the disappearance - create a white rectangle with increasing transparency at disappearing blocks
      this.fractionDisappeared += SPEED.disappearing;     //The main animating step
      let startXY = [this.position[0] - this.blockSize[0] / 2, this.position[1] - this.blockSize[1]];
      stroke(255);
      strokeWeight(2);
      fill(255, 255 * this.fractionDisappeared);
      for (let i = 0; i < Math.abs(subtrahend); i++) {
        rect(startXY[0], startXY[1] - (i * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
      }
    }
    else if (subtrahend < 0 && this.currentNegativeUnits >= Math.abs(subtrahend)) { //Negative tower subtraction

      //Animate the disappearance - create a white rectangle with increasing transparency at disappearing blocks
      this.fractionDisappeared += SPEED.disappearing;     //The main animating step
      let startXY = [this.position[0] - this.blockSize[0] / 2, this.position[1]];
      stroke(255);
      strokeWeight(2);
      fill(255, 255 * this.fractionDisappeared);
      for (let i = 0; i < Math.abs(subtrahend); i++) {
        rect(startXY[0], startXY[1] + (i * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
      }
    }


    //Finally perform the operation after animation control variable reaches terminal value
    if (this.fractionDisappeared >= 1) {  //ie if animation has ended
      if (subtrahend > 0 && this.currentPositiveUnits >= Math.abs(subtrahend)) {
        this.currentPositiveUnits -= Math.abs(subtrahend);
      } else if (subtrahend < 0 && this.currentNegativeUnits >= Math.abs(subtrahend)) {
        this.currentNegativeUnits -= Math.abs(subtrahend);
      }
      //Resetting animation control variable
      this.fractionDisappeared = 0;
      //break out of calling the method in draw()
      currentlyAnimating.SUBTRACTING = false;
    }

  }

  multiplyPositive(multiplicand) {
    // Implement the multiplication logic for positive units
  }

  multiplyNegative(multiplicand) {
    // Implement the multiplication logic for negative units
  }


  //------------------------------------------ RENDERERS ----------------------------------------------------//


  renderPositive() {
    //Rendering it within a transformation matrix so that flipping can be implemented as scaling

    push();
    //translate(x, y) means that within this push-pop block (0, 0) is now going to be at (x, y) of original canvas.
    translate(this.position[0], this.position[1]);

    //scale(dx, dy) means that anything drawn within push-pop block will be stretched/shrunk by factors of...
    //...dx along x-axis and dy along y-axxis (wrt the new origin if translate(x, y) is called first like here).

    //Note that flipfactor is 1 throughout the simulation except for when a flipping animation is occurring
    scale(1, this.flipFactor)

    let startXY = [0 - this.blockSize[0] / 2, 0 - this.blockSize[1]];
    stroke(0);
    strokeWeight(2);
    // transparency(this.positiveTowerAlpha);

    //To keep colors congruent with sign during flipping, we temporarily swap colors during the flip in animation
    if (this.flipFactor > 0) {
      fill(positiveTowerColor);
    } else {
      fill(negativeTowerColor);
    }

    for (let i = 0; i < this.currentPositiveUnits; i++) {
      rect(startXY[0], startXY[1] - i * this.blockSize[1], this.blockSize[0], this.blockSize[1]);
    }
    pop();
  }

  renderNegative() {
    //Rendering it within a transformation matrix so that flipping can be implemented as scaling

    push();
    //translate(x, y) means that within this push-pop block (0, 0) is now going to be at (x, y) of original canvas.
    translate(this.position[0], this.position[1]);

    //scale(dx, dy) means that anything drawn within push-pop block will be stretched/shrunk...
    //... by factors of dx along x axis and dy along y axxis, wrt the new origin (if translate(x, y) is called first).

    //Note that flipfactor is 1 throughout the simulation except for when a flipping animation is occurring
    scale(1, this.flipFactor);

    let startXY = [0 - this.blockSize[0] / 2, 0];
    stroke(0);
    strokeWeight(2);
    // transparency(this.negativeTowerAlpha); //If one must implement this, we need to use Color.setAlpha instead

    //To keep colors congruent with sign during flipping, we temporarily swap colors during the flip in animation
    if (this.flipFactor > 0) {
      fill(negativeTowerColor);
    } else {
      fill(positiveTowerColor);
    }

    for (let i = 0; i < this.currentNegativeUnits; i++) {
      rect(startXY[0], startXY[1] + i * this.blockSize[1], this.blockSize[0], this.blockSize[1]);
    }
    pop();
  }

  tryDrag(mouseX, mouseY) {
    let minX = this.position[0];
    let maxX = this.position[0] + this.blockSize[0];
    let minY = this.position[1];
    let maxY = this.position[1] + this.blockSize[1];
    if ((mouseX >= minX - 15 && mouseX <= maxX + 15 && mouseY >= minY - 15 && mouseY <= maxY + 15)) {
      this.dragOffset[0] = mouseX - this.position[0];
      this.dragOffset[1] = mouseY - this.position[1];
      currentlyAnimating.DRAGGING = true;
    }
  }
  drag(mouseX, mouseY) {
    if (currentlyAnimating.DRAGGING) {
      this.position[0] = mouseX - this.dragOffset[0];
      this.position[1] = mouseY - this.dragOffset[1];
    }
  }
}
