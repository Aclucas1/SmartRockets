//dna
var dnaMag = .1;

// rocket
var count = 0;
var lifespan = 350;

// population
var generation = 1;
var population;
var popSize = 100;

//draw
var target;
var lifeP;
var genP;
var fitP


// rectangle obstacles
var rx = 150;
var ry = 200;
var rw = 200;
var rh = 10;

var rx2 = 50;
var ry2 = 50;
var rw2 = 10;
var rh2 = 200;

var rx3 = 450;
var ry3 = 50;
var rw3 = 10;
var rh3 = 200;


var rocketIMG;


function setup() {
  // put setup code here
  createCanvas(500,500);
  population = new Population();
  lifeP = createP();
  genP = createP();
  fitP = createP();
  target = createVector(width/2, 50);
  
  //rocketIMG = loadImage("assets/rocket.png");
}

function draw() {
	// put drawing code here
	background(0);
	population.run();
	lifeP.html("Count: " + count + " of " + lifespan);
	genP.html("Generation: " + generation);
	
	if(count == lifespan){
		 population.evaluate();
		 population.selection();
		 count = 0;
		 generation++;
	}
	
	fill(0,255,100);
	ellipse(target.x, target.y, 16, 16);
	
	fill(255,0,22);
	rect(rx, ry, rw, rh);
	rect(rx2, ry2, rw2, rh2);
	rect(rx3, ry3, rw3, rh3);
	count++;
	
}

function Population(){
	
	this.rockets = [];
	this.matingPool = [];
	
	for(var i = 0; i < popSize; i++){	
		this.rockets[i] = new Rocket();
	}
	
	this.evaluate = function(){
		var maxFit = 0;
		this.matingPool = [];
				
		for(var i = 0; i < popSize; i++){
			this.rockets[i].calcFitness();
			if(this.rockets[i].fitness > maxFit){
				maxFit = this.rockets[i].fitness;
			}
		}
		
		for(var i = 0; i < popSize; i++){
			this.rockets[i].fitness /= maxFit; 
			
		}
		
		for(var i = 0; i < popSize; i++){
			var n = (this.rockets[i].fitness * 100);
			
			for(var j = 0; j < (n); j++){
				this.matingPool.push(this.rockets[i])
			}
		}
		fitP.html("Fitness: " + maxFit);
	}
	
	this.selection = function(){
		
		var newRockets = [];
		for(var i = 0; i < popSize; i++){
			var parentA = random(this.matingPool).dna;
			var parentB = random(this.matingPool).dna;
		
			var child = parentA.crossover(parentB);
			child.mutation();
			newRockets[i] = new Rocket(child);
		}
		this.rockets = newRockets;
	}
	
	this.run = function(){
		for(var i = 0; i < popSize; i++){
			this.rockets[i].update();
			this.rockets[i].show();
		}
	}
	
}

function DNA(genes){
	
	if(genes){
		this.genes = genes;
	}else{
		this.genes = [];	
		for(var i = 0; i < lifespan; i++){
			this.genes[i] = p5.Vector.random2D();
			this.genes[i].setMag(dnaMag);
		}
	}
	this.crossover = function(partner){
		var newgenes = [];
		var mid = floor(random(this.genes.length));
		for(var i = 0; i < this.genes.length; i++){
			if(i > mid){
				newgenes[i] = this.genes[i];
			}else{
				newgenes[i] = partner.genes[i];
			}
		}
		return new DNA(newgenes);
	}
	
	this.mutation = function(){
		for(var i = 0; i < this.genes.length; i++){
			if(random(1) < .01){
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(0.1);
			}
		}
	}
	
}

function Rocket(dna){
	this.pos = createVector(width/2, height);
	this.vel = createVector();
	this.acc = createVector();
	this.dna = new DNA();
	this.completed = false;
	this.completionTime = lifespan;
	
	if(dna){
		this.dna = dna;
	}
	this.fitness = 0.0;
	
	this.applyForce = function(force){
		this.acc.add(force);
	}
	
	this.update = function(){
		//Finished?
		var d = dist(this.pos.x, this.pos.y, target.x, target.y);
		if(d < 15){
			this.completed = true;
			this.pos = target.copy();
		}
		
		//Hit the red block
		if( this.pos.x > rx && 
			this.pos.x < rx + rw &&
			this.pos.y > ry &&
			this.pos.y < ry + rh){
			this.crashed = true;
		}
		
		//Hit the red block
		if( this.pos.x > rx2 && 
			this.pos.x < rx2 + rw2 &&
			this.pos.y > ry2 &&
			this.pos.y < ry2 + rh2){
			this.crashed = true;
		}
		
		//Hit the red block
		if( this.pos.x > rx3 && 
			this.pos.x < rx3 + rw3 &&
			this.pos.y > ry3 &&
			this.pos.y < ry3 + rh3){
			this.crashed = true;
		} 
		
		//keep them on the screen
		if( this.pos.x > width || 
			this.pos.x < 0 ||
			this.pos.y > height ||
			this.pos.y < 0){
			this.crashed = true;
		}
		
		if(this.completionTime == lifespan && (this.completed)){
			this.completionTime = count;
		}
		
		this.applyForce(this.dna.genes[count]);
		
		if(!this.completed && !this.crashed){
			this.vel.add(this.acc);
			this.pos.add(this.vel);
			this.acc.mult(0);
		}
	}
	
	this.calcFitness = function(){
		var d = dist(this.pos.x, this.pos.y, target.x, target.y);
		this.fitness = map(d, 0, width, width, 0);
		if(this.completed){
			this.fitness *= 10;
		}else if(this.crashed){
			this.fitness = 0;
		}
		if(this.completionTime < 400){
			this.fitness *= 2;
		}
		
	}
	
	this.show = function(){
		
			push();
			noStroke();
			translate(this.pos.x, this.pos.y);
			rotate(this.vel.heading());
			rectMode(CENTER);
			if(!this.crashed){
				fill(229,83,0);
				triangle(-12, 3, -25, 0, -12, -3);
				fill(255, 200);
			}
			else{
				fill(128,0,128);
			}
			rect(0,0, 20, 6);
			fill(0,59,174);
			triangle(10, 3, 15, 0, 10, -3);
			triangle(-15, 6, -15, -6, -7, 0);
			pop();
		
	}
}