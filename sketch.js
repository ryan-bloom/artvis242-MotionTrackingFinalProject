let video;
let poseNet;
let poses = [];
let mgr;

let num_dots = 8;
let center_size = 150;
let myCenter1;
let myCenter2;
let myDots = [];


let rand = false;
let draw3 = false;
let adder = false;

let arrow;

//Load in image of arrow for instruction scene
function preload(){
  arrow = loadImage("images/arrow2.png");
}

function setup() {
  textAlign(CENTER, CENTER);
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);

  //Set up scene managers
  mgr = new SceneManager();
  mgr.addScene(Animation1);
  mgr.addScene(Animation2);
  mgr.addScene(Animation3);
  mgr.addScene(Animation4);
  mgr.showNextScene();
}

//Called on final scene -- only need to turn camera on once user has reached final artwork scene
function setup2(){
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video);

  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function (results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();

  //col = document.getElementById("color_picker");
  myCenter1 = new Center(windowWidth/2, windowHeight/2, center_size, 255, ellipse);
  myCenter2 = new Center(windowWidth/2, windowHeight/2, center_size, 255, ellipse);
  for(let i=0; i<num_dots; i++){
      myDots[i] = new Dot(myCenter1.x, myCenter1.y, random(-10, 10), random(-10, 10), 20, 255, ellipse);
    }
}

function draw() {
  mgr.draw();
}
function mousePressed(){
  mgr.mousePressed();
}

//Title scene 
function Animation1(){
  this.draw = function(){
    print("HERE SCENE 1");
    //print(mgr.showNextScene());
    background(0);
    textSize(100);
    textFont("Shadows Into Light");
    fill(250);
    text("Body Tracking", windowWidth - 400, windowHeight/2 - 100);
    textSize(75);
    text("By Ryan Bloom", windowWidth - 350, windowHeight/2 + 25);
    textSize(25);
    text("Click To Advance!", windowWidth/2, windowHeight - 100);
  }

  this.mousePressed = function(){
    mgr.showNextScene();
  }
}

//Blank scene being skipped in scene manager for some reason... but it works.
function Animation2(){
  this.draw = function(){
  }
  this.mousePressed = function(){
    mgr.showNextScene();
  }
}

//Instruction scene tells user how to interact with the piece 
function Animation3(){
  this.draw = function(){
    print("HERE IN SCENE 2");
    background(0);
    textFont("Shadows Into Light");
    image(arrow, 15, 25, 50, 100);
    fill(250);
    textSize(15);
    text("Don't forget to check me out too!", 115, 60);
    
    textSize(75);
    text("Take a step back", windowWidth/2, windowHeight/2 - 275);
    text("and move the two big circles with your body!", windowWidth/2, windowHeight/2 - 200);
    var temp1 = new Center(windowWidth/2 - 100, windowHeight/2 - 50, center_size - 20, color(101, 183, 237), ellipse);
    temp1.display();
    var temp1 = new Center(windowWidth/2 + 100, windowHeight/2 - 50, center_size - 20, color(223, 161, 237), ellipse);
    temp1.display();
    fill(250);
    textSize(50);
    text("Catch (or avoid) the bouncers and see what happens!", windowWidth/2 , windowHeight/2 + 100);
    text("Try 'ENTER' and the 'UP' and 'DOWN' arrow keys too.", windowWidth/2 , windowHeight/2 + 150);
    textSize(25);
    text("(Don't forget to allow camera usage... and have fun!)", windowWidth/2, windowHeight - 200);
    text("Click To Advance!", windowWidth/2, windowHeight - 150);
  }

  this.mousePressed = function(){
    mgr.showNextScene();
  }
}

function Animation4(){
  this.draw = function(){
    if(!draw3){
      draw3 = true;
      setup2();
    }
    background(0)
    imageMode(CENTER);
    ellipseMode(CENTER);
    rectMode(CENTER);
  
    for(let i=0; i<myDots.length; i++){
      myDots[i].display();
      myDots[i].move();
      //Check if intersect center to reset color and size;
      if(myDots[i].intersects(myCenter1)){
          myDots[i].color = myCenter1.color;
          myDots[i].size = random(10, 50);
      }
      if(myDots[i].intersects(myCenter2)){
        myDots[i].color = myCenter2.color;
        myDots[i].size = random(10, 50);
      }
      //Check if intersect other dot to reset colors
      if(rand === true){
        for(let j=0; j<myDots.length; j++){
            if(j != i){
                if(myDots[i].intersects(myDots[j])){
                    myDots[i].color = color(random(255), random(255), random(255));
                    myDots[j].color = color(random(255), random(255), random(255));
                }
            }
        }
      }
    }
    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  //print(poses.length);
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = poses[i].pose.keypoints[j];
  
      //print(keypoint)
      rightwrist_point = poses[0].pose.keypoints[10]
      leftwrist_point = poses[0].pose.keypoints[9]
      rightshoulder_point = poses[0].pose.keypoints[6]
      leftshoulder_point = poses[0].pose.keypoints[5]

      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        //print("HERE MOVING CENTER");
        myCenter1.centerMove(leftshoulder_point.position['x'], leftshoulder_point.position['y']);
        myCenter2.centerMove(rightshoulder_point.position['x'], rightshoulder_point.position['y']);
        myCenter1.color = color(myCenter1.x*0.25, myCenter1.y*0.25, (myCenter1.y)*0.35);
        myCenter2.color = color(myCenter2.x*0.25, myCenter2.y*0.25, (myCenter2.y)*0.35);
      }
    }
  }
}


//Dot class
class Dot{
  constructor(tempX, tempY, tempVX, tempVY, tempSize, tempColor, tempShape){
      this.x = tempX;
      this.y = tempY;
      this.vx = tempVX;
      this.vy = tempVY;
      this.size = tempSize;
      this.color = tempColor;
      this.shape = tempShape;
      this.history = [];
  }

  //Keep track of prior locations in history to draw tail behind dots 
  display(){
      noStroke();
      fill(this.color);
      this.shape(this.x, this.y, this.size, this.size);
      for(var i=0; i<this.history.length; i++){
          var pos = this.history[i];
          this.shape(pos.x, pos.y, 8, 8);
      }
  }

  //Move the dot based on velocities (check for bouncing off walls)
  move(){
      this.x = this.x+this.vx;
      this.y = this.y+this.vy;
      if(this.x > width || this.x < 0){
          this.vx *= -1;
      }
      if(this.y>height || this.y<0){
          this.vy *= -1;
      }
      var v = createVector(this.x, this.y);
      this.history.push(v);
      //Only trace 200 positions prior 
      if(this.history.length > 200){
          this.history.splice(0,1);
      }
  }
  //Check for collisions
  intersects(arg){
      return(collideCircleCircle(this.x, this.y, this.size, arg.x, arg.y, arg.size));
  }
}

//myCenter object class
class Center{
  constructor(tempX, tempY, tempSize, tempColor, tempShape){
      this.x = tempX;
      this.y = tempY;
      this.size = tempSize;
      this.color = tempColor; 
      this.shape = tempShape;
  }
  //Display the object (just one)
  display(){
      noStroke();
      fill(this.color);
      this.shape(this.x, this.y, this.size, this.size);
  }
  //called using body tracking video camera to move center dot locations
  centerMove(x, y){
      this.x = x;
      this.y = y;
      this.display();
  }
}

//Handles all keyPressed instances 
function keyPressed(){
  //"ENTER" center object to white
  if(keyCode === ENTER){
    for(var i=0; i<myDots.length; i++){
      myDots[i].color = (255);
    }
  }
  //"up" add more dots
  if(keyCode === UP_ARROW){
    if(adder){
      var temp = myCenter1.shape;
      //myDots.push(new Dot(myCenter.x, myCenter.y, random(-10, 10), random(-10, 10), 20, 255, temp));
      myDots.push(new Dot(myCenter1.x, myCenter1.y, random(-10, 10), random(-10, 10), 20, myCenter1.color, ellipse));
      adder = false;
    }
    else{
      var temp = myCenter2.shape;
      //myDots.push(new Dot(myCenter.x, myCenter.y, random(-10, 10), random(-10, 10), 20, 255, temp));
      myDots.push(new Dot(myCenter2.x, myCenter2.y, random(-10, 10), random(-10, 10), 20, myCenter2.color, ellipse));
      adder = true;
    }
  }
  //"down" remove dots 
  if(keyCode === DOWN_ARROW){
      myDots.splice(0,1);
  }
  return false;
}

//Called when check box is clicked -- turn collision detection on and off
function toggleCollisions(){
  if(rand === false){rand = true;}
  else{rand = false;}
}

