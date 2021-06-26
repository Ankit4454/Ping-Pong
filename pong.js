const canvas = document.getElementById("pong");

const ctx = canvas.getContext('2d');

let time = document.getElementById("time");

let hit = new Audio();
let wall = new Audio();
let userScore = new Audio();
let comScore = new Audio();

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";

/*
window.onresize = function(event){
    canvas.width = (window.innerWidth)/1.536;
    canvas.height = (window.innerHeight)/1.084;
}
*/

const ball = {
    x : canvas.width/2,
    y : canvas.height/2,
    radius : 10,
    velocityX : 5,
    velocityY : 5,
    speed : 10,
    color : "WHITE"
}


const user = {
    x : 0, 
    y : (canvas.height - 100)/2, 
    width : 10,
    height : 100,
    score : 0,
    color : "WHITE"
}


const com = {
    x : canvas.width - 10, 
    y : (canvas.height - 100)/2, 
    width : 10,
    height : 100,
    score : 0,
    color : "WHITE"
}


const net = {
    x : (canvas.width - 2)/2,
    y : 0,
    height : 10,
    width : 2,
    color : "WHITE"
}


function drawRect(x, y, w, h, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}


function drawArc(x, y, r, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
}


canvas.addEventListener("mousemove", getMousePos);

function getMousePos(evt){
    let rect = canvas.getBoundingClientRect();
    
    user.y = evt.clientY - rect.top - user.height/2;
}

function resetBall(){
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 10;
}

function drawNet(){
    for(let i = 0; i <= canvas.height; i+=15){
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

function drawText(text,x,y){
    ctx.fillStyle = "#FFF";
    ctx.font = "60px fantasy";
    ctx.fillText(text, x, y);
}

function collision(b,p){
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;
    
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
    
    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}


function update(){
    
    // change the score of players, if the ball goes to the left "ball.x<0" computer win, else if "ball.x > canvas.width" the user win
    if( ball.x - ball.radius < 0 ){
        com.score++;
        comScore.play();
        resetBall();
    }else if( ball.x + ball.radius > canvas.width){
        user.score++;
        userScore.play();
        resetBall();
    }
    
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // computer plays for itself, and we must be able to beat it
    com.y += ((ball.y - (com.y + com.height/2)))*0.1;
    
    if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height){
        ball.velocityY = -ball.velocityY;
        wall.play();
    }
    
    let player = (ball.x + ball.radius < canvas.width/2) ? user : com;
    
    if(collision(ball,player)){
        // play sound
        hit.play();
        let collidePoint = (ball.y - (player.y + player.height/2));

        // normalize the value of collidePoint, we need to get numbers between -1 and 1.
        collidePoint = collidePoint / (player.height/2);
        
        let angleRad = (Math.PI/4) * collidePoint;
        
        let direction = (ball.x + ball.radius < canvas.width/2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        ball.speed += 0.1;
    }

}


function render(){
    
    // clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, "#000");

    // draw the user score to the left
    drawText(user.score,canvas.width/4,canvas.height/5);
    
    // draw the COM score to the right
    drawText(com.score,3*canvas.width/4,canvas.height/5);
    
    // draw the net
    drawNet();
    
    // draw the user's paddle
    drawRect(user.x, user.y, user.width, user.height, user.color);
    
    // draw the COM's paddle
    drawRect(com.x, com.y, com.width, com.height, com.color);
    
    // draw the ball
    drawArc(ball.x, ball.y, ball.radius, ball.color);
}

let countDown = 180;

function timer(){
    if (countDown==0){
        drawRect(canvas.width/4, canvas.height/3, canvas.width/2, canvas.height/4, "#000");
        if (user.score>com.score){
            ctx.textAlign = "center";
            drawText("You Win", canvas.width/2, canvas.height/2);
        }
        else if (com.score>user.score){
            ctx.textAlign = "center";
            drawText("You Lose", canvas.width/2, canvas.height/2);
        }
        else{
            ctx.textAlign = "center";
            drawText("Match Draw", canvas.width/2, canvas.height/2);
        }
        console.log("Times up!");
        clearInterval(loop);
        clearInterval(id);
        
        //Restart button
        let button = document.createElement("button");
        button.innerHTML = "Restart";

        let body = document.getElementsByTagName("body")[0];
        body.appendChild(button);

        button.addEventListener("click", function(){
            location.reload();
        });
    }
    if (countDown>0){
        countDown--;
        let min = Math.floor(countDown/60);
        let sec = countDown%60;
        time.innerHTML = ("0"+min).slice(-2)+":"+("0"+sec).slice(-2);
    }
}
    
let id = setInterval(timer,1000);
    
function game(){
    update();
    render();
}

let framePerSecond = 50;


//call the game function 50 times every 1 Sec
let loop = setInterval(game,1000/framePerSecond);
