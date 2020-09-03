document.addEventListener('DOMContentLoaded', function(){ // Аналог $(document).ready(function(){

    let menuWrap = document.getElementById("menu_wrap");
    let playButton = document.getElementById("play_button");
    let gameScore = document.getElementById("game_score_span");
    let gameCanvas = document.getElementById("game_canvas");
    let ctx = gameCanvas.getContext("2d");

    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;

    
    let gameConf = {
        startGame: false,
        map: {
            width: gameCanvas.width,
            height: gameCanvas.height
        },
        stars: {
            color: "yellow",
            radius: 8,
            xMaxSpeed: 4, // random speed for every star
            xMinSpeed: 2,
            yMaxSpeed: 4,
            yMinSpeed: 2,
            speedChangeInterval: 3000,
            maxCount: 100
        }, 
        player: {
            color: "red",
            radius: 8,
            xSpeed: 10,
            ySpeed: 10,
            deathParticles: {
                color: "red",
                radius: 1,
                maxCount: 10
            }
        },
        score: {
            interval: 100,
            perInterval: 1
        }
    };

    let startGameConf = JSON.parse(JSON.stringify(gameConf)); // copy opbject without it's link 

    let player = {
        x: 500,
        y: 500
    };
    let stars = [];
    let score = 0;

    let currentClientX;
    let currentClientY;

    let updateScoreInterval;
    let increaseStarsSpeedInterval;

    
    let increaseStarsSpeed = ()=>{
        if(gameConf.startGame) {
            gameConf.stars.xMaxSpeed+=0.15;
            gameConf.stars.xMinSpeed+=0.15;
            gameConf.stars.yMaxSpeed+=0.15;
            gameConf.stars.yMinSpeed+=0.15;
            console.log("Speed increased! " + gameConf.stars.xMaxSpeed + " " + gameConf.stars.xMinSpeed);
        }
        else {
            for(let i = 0; i < stars.length; i++) { // normalize stars speed to start config
                stars[i].xSpeed = Math.floor(Math.random()*(startGameConf.stars.xMaxSpeed-startGameConf.stars.xMinSpeed)) + startGameConf.stars.xMinSpeed,
                stars[i].ySpeed = Math.floor(Math.random()*(startGameConf.stars.yMaxSpeed-startGameConf.stars.yMinSpeed)) + startGameConf.stars.yMinSpeed
            }
            clearInterval(increaseStarsSpeedInterval);
        }
    }

    let updateScore = ()=>{
        if(gameConf.startGame) {
            score += gameConf.score.perInterval;
            gameScore.textContent = score;
        }   
        else {
            clearInterval(updateScoreInterval);
        } 
    }

    let generateStars = ()=>{
        for(let i = 0; i < gameConf.stars.maxCount; i++) {
            stars[i] = 
            {
                x: Math.floor(Math.random()*(gameConf.map.width*2)),
                y: -(Math.floor(Math.random()*(gameConf.map.height)) + gameConf.map.height/3),
                xSpeed: Math.floor(Math.random()*(gameConf.stars.xMaxSpeed-gameConf.stars.xMinSpeed)) + gameConf.stars.xMinSpeed,
                ySpeed: Math.floor(Math.random()*(gameConf.stars.yMaxSpeed-gameConf.stars.yMinSpeed)) + gameConf.stars.yMinSpeed
            };
        }
    }

    let deathAnimation = ()=>{


        window.requestAnimationFrame(deathAnimation);
    }

    let drawStars = ()=>{
        if(stars.length < 1) {
            generateStars();
        }
        for(let i = 0; i < gameConf.stars.maxCount; i++) {
            ctx.fillStyle = gameConf.stars.color;
            ctx.strokeStyle = gameConf.stars.color;

            ctx.beginPath();
            ctx.arc(stars[i].x, stars[i].y, gameConf.stars.radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();

            if(stars[i].x < 0 || stars[i].y > gameConf.map.height) {
                stars.splice(i, 1);
                stars.push({
                    x: Math.floor(Math.random()*(gameConf.map.width*2)),
                    y: -(Math.floor(Math.random()*(gameConf.map.height))),
                    xSpeed: Math.floor(Math.random()*(gameConf.stars.xMaxSpeed-gameConf.stars.xMinSpeed)) + gameConf.stars.xMinSpeed,
                    ySpeed: Math.floor(Math.random()*(gameConf.stars.yMaxSpeed-gameConf.stars.yMinSpeed)) + gameConf.stars.yMinSpeed
                });

                score+=1;
                i--; // exlude lags with next iteration 
                    // arr = [12, 51, 43, 82]
                    // arr -> 0,  !1,  2,  3  
                    // arr = [12, 43,  82]
            } else {
                stars[i].x -= stars[i].xSpeed;
                stars[i].y += stars[i].ySpeed;
            }
        }
    }

    let checkCollisions = ()=> {
        for(let i = 0; i < stars.length; i++) {
            let playerLeftPos = player.x - gameConf.player.radius; // the position of the player left extreme side
            let playerTopPos = player.y - gameConf.player.radius; 
            let starLeftPos = stars[i].x - gameConf.stars.radius; // the position of the star left extreme side
            let starTopPos = stars[i].y - gameConf.stars.radius; 
            if(
                (playerLeftPos >= starLeftPos && playerLeftPos <= starLeftPos + gameConf.stars.radius*2)&&
                (playerTopPos >= starTopPos && playerTopPos <= starTopPos + gameConf.stars.radius*2)
            )
            {
                console.log("coll");
                console.log(startGameConf);
                window.requestAnimationFrame(deathAnimation);
                //gameConf.startGame = false;
                //gameConf = JSON.parse(JSON.stringify(startGameConf));
                //updateScore();
                //increaseStarsSpeed();
            }
        }
    }

    
    let drawPlayer = ()=>{
        ctx.fillStyle = gameConf.player.color;
        ctx.strokeStyle = gameConf.player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, gameConf.player.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    let clear = ()=>{
        ctx.fillStyle = "rgb(21, 21, 49)";
        ctx.fillRect(0, 0, gameConf.map.width, gameConf.map.height);
    }

    let loop = ()=>{
        clear();
        if(gameConf.startGame) {
            drawPlayer();
            checkCollisions();
        } 
        else {
            playButton.disabled = false;
            menuWrap.style.display = "block";
        }
        drawStars();
        window.requestAnimationFrame(loop);
    }

    let playerAnimation = ()=>{
        document.body.removeEventListener("mousemove", mouseListener);
    }

    let mouseListener = (e)=>{
        currentClientX = e.clientX;
        currentClientY = e.clientY;
        player.x = currentClientX;
        player.y = currentClientY;
    }


    playButton.addEventListener("click", (event)=>{
        playButton.disabled = true;
        menuWrap.style.display = "none";
        score = 0;
        gameScore.textContent = score;
        gameConf.startGame = true;
        // updateScore();
        // increaseStarsSpeed();
        updateScoreInterval = setInterval(updateScore, gameConf.score.interval);
        increaseStarsSpeedInterval = setInterval(increaseStarsSpeed, gameConf.stars.speedChangeInterval);
    });

    document.body.addEventListener("mousemove", mouseListener);

    window.requestAnimationFrame(loop);
    //drawStars();


});