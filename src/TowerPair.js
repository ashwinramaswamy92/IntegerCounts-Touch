class TowerPair {
  constructor() {
    this.objectId = 0;
    this.currentPositiveUnits = 0;
    this.currentNegativeUnits = 0;
    this.blockSize = [20, 80];
    this.position = [0, 0];     //The midpoint of the intersection base of both towers.
    this.time = 0;
    this.dragOffset = [0,0];

    //Animation state tracking variables
    this.newBlockAlpha = 0;
    this.fractionPinched = 0; //Tracks how far into the pinching animation we are, as a fraction of 1.
    this.fractionPinchedOut = 0;
    this.flipFactor = 1; //To be implemented as scale(1, flipFactor) in a transformation matrix.

    this.pinchingWhitenessFraction = 0; //makeshift whitening of new block.

  }




//-------------------------------------------------SETTERS--------------------------------------//

setPosition(x, y){
  this.position = [x, y];
}


//---------------------------------ANIMATION + OPERATION INITIATORS--------------------------------------//

//These methods trigger off an animation which ends in the relevant operation being performed.

  initiateIncrementPositive(){
    //Call this when you want to add one to positive side, and this will call addPositive() while taking care of the animation timing
   
    console.log("Initiated Incremented Postive"); 
    currentlyAnimating.INCREMENTING_POSITIVE = true;
  }

  initiateIncrementNegative(){
    //Call this when you want to add one to positive side, and this will call addPositive() while taking care of the animation timing
    console.log("Initiated Incremented Negative");  
    currentlyAnimating.INCREMENTING_NEGATIVE = true;
  }
  
  initiateFlip(){
    currentlyAnimating.FLIPPING = true;
  }

  initiatePinchIn(){
    //Only works if theres at least one of each side
    // if(this.currentNegativeUnits >= 1 && this.currentPositiveUnits >= 1){
      // console.log("Initiated Pinch IN");
    currentlyAnimating.PINCHING_IN = true;
    // } else{
    //   console.log("Cant pinch in when theres no block pair")
    // }
  }

  initiatePinchOut(){
    currentlyAnimating.PINCHING_OUT = true;
  }
  
  incrementPositive() {
    //To be called continuously in draw under a control structure. While the primary purpose of this function is to increment this.currentPositiveUnits, we could transition into this state via an animation.

    //Animation part: animates appearance of a single block by increasing its alpha:
        let startXY = [this.position[0] - this.blockSize[0]/2, this.position[1] - this.blockSize[1]];
        this.newBlockAlpha += 25;
        stroke(0, this.newBlockAlpha);
        strokeWeight(2);
        fill(255, 0, 0, this.newBlockAlpha);
        rect(startXY[0], startXY[1] - ((this.currentPositiveUnits) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
    
    //Once animation termination is reached, perform the function's primary action, and then reset termination criteria for animations
        if(this.newBlockAlpha >= 255){
          //Changes to state variables required of the function
            this.currentPositiveUnits += 1;

          //Reset termination criteria
            currentlyAnimating.INCREMENTING_POSITIVE = false;
            this.newBlockAlpha = 0;
        }
  }


  incrementNegative() {    //To be called continuously in draw under a control structure. While the primary purpose of this function is to increment this.currentNegativeUnits, we could transition into this state via an animation.

    //Animation part: animates appearance of a single block by increasing its alpha:
        let startXY = [this.position[0] - this.blockSize[0]/2, this.position[1]];
        this.newBlockAlpha += 25;
        stroke(0, this.newBlockAlpha);
        strokeWeight(2);
        fill(0, 0, 255, this.newBlockAlpha);
        rect(startXY[0], startXY[1] + ((this.currentNegativeUnits) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
    
    //Once animation termination is reached, perform the function's primary action, and then reset termination criteria for animations
        if(this.newBlockAlpha >= 255){
          
          //Changes to state variables required of the function
            this.currentNegativeUnits += 1;

          //Reset termination criteria
            currentlyAnimating.INCREMENTING_NEGATIVE = false;
            this.newBlockAlpha = 0;
        }
  }

  flip() {
    //This multiplies the whole expression by -1

    if(this.flipFactor > -1){
      //Animation to flip these along z-axis
      this.flipFactor -= SPEED.flipping;

    } else{
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
      this.fractionPinched += 25/255;
      let startXYPositive = [this.position[0] - this.blockSize[0]/2, this.position[1] - this.blockSize[1]];
      let startXYNegative = [this.position[0] - this.blockSize[0]/2, this.position[1]];
      stroke(255);
      strokeWeight(2);
      fill(255, 255*this.fractionPinched);
      
      rect(startXYNegative[0], startXYNegative[1] + ((0) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
      rect(startXYPositive[0], startXYPositive[1] - ((0) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
      

      //Then check for termination condition, and perform the pinching in operation
      if(this.fractionPinched >= 1){

        //Perform changes to state variables required of the function
        this.currentNegativeUnits -= 1;
        this.currentPositiveUnits -= 1;

        //reset termination
        this.fractionPinched = 0;

        //break out of calling the method in draw()
        currentlyAnimating.PINCHING_IN = false;
      }
  }

  pinchOut() {
    //Adds one each of positive and negative units
    
      //First animate the pinch - create a white rectangle with decreasing transparency where new blocks should appear
      this.fractionPinched += 25/255;
      let startXYPositive = [this.position[0] - this.blockSize[0]/2, this.position[1] - this.blockSize[1]];
      let startXYNegative = [this.position[0] - this.blockSize[0]/2, this.position[1]];
      stroke(255);
      strokeWeight(2);
      fill(255, 255 - 255*this.fractionPinched);
      
      rect(startXYNegative[0], startXYNegative[1] + ((this.currentNegativeUnits) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
      rect(startXYPositive[0], startXYPositive[1] - ((this.currentPositiveUnits) * this.blockSize[1]), this.blockSize[0], this.blockSize[1]);
      

      //Then check for termination condition, and perform the pinching in operation
      if(this.fractionPinched >= 1){

        //Perform changes to state variables required of the function
        this.currentNegativeUnits += 1;
        this.currentPositiveUnits += 1;

        //reset termination
        this.fractionPinched = 0;

        //break out of calling the method in draw()
        currentlyAnimating.PINCHING_OUT = false;
      }    


  }

  simplify() {
    //This simplifies the whole expression. Basically pinches in as many times as possible all at once

    let difference = this.currentPositiveUnits - this.currentNegativeUnits;

    if (difference >= 0) {
      this.currentPositiveUnits = difference;
      this.currentNegativeUnits = 0;
    } else {
      this.currentNegativeUnits = Math.abs(difference);
      this.currentPositiveUnits = 0;
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
    
    push();
      translate(this.position[0], this.position[1]);
      scale(1, this.flipFactor)
      let startXY = [0 - this.blockSize[0]/2, 0 - this.blockSize[1]];
      stroke(0);
      strokeWeight(2);
      
      //To keep colors congruent with sign during flipping, we temporarily swap colors during the flip in animation
      if(this.flipFactor > 0){
        fill(positiveTowerColor);
      } else{
        fill(negativeTowerColor);
      }

      for (let i = 0; i < this.currentPositiveUnits; i++) {
        rect(startXY[0], startXY[1] - i * this.blockSize[1], this.blockSize[0], this.blockSize[1]);
      }
    pop();
  }

  renderNegative() {
    push();
      translate(this.position[0], this.position[1]);
      scale(1, this.flipFactor);
      let startXY = [0 - this.blockSize[0]/2, 0];
      stroke(0);
      strokeWeight(2);

      //To keep colors congruent with sign during flipping, we temporarily swap colors during the flip in animation
      if(this.flipFactor > 0){
        fill(negativeTowerColor);
      } else{
        fill(positiveTowerColor);
      }

      for (let i = 0; i < this.currentNegativeUnits; i++) {
        rect(startXY[0], startXY[1] + i * this.blockSize[1], this.blockSize[0], this.blockSize[1]);
      }
    pop();
  }

  tryDrag(mouseX, mouseY){
    let minX = this.position[0];
    let maxX = this.position[0] + this.blockSize[0];
    let minY = this.position[1];
    let maxY = this.position[1] + this.blockSize[1];
    if ((mouseX >= minX - 15 && mouseX <= maxX + 15 && mouseY >= minY - 15 && mouseY <= maxY + 15)){
      this.dragOffset[0] = mouseX - this.position[0];
      this.dragOffset[1] = mouseY - this.position[1];
      currentlyAnimating.DRAGGING = true;
    }
  }
  drag(mouseX,mouseY){
    if(currentlyAnimating.DRAGGING){
    this.position[0] = mouseX - this.dragOffset[0];
    this.position[1] = mouseY - this.dragOffset[1];
    }
  }
}