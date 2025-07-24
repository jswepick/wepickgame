class PikachuVolleyball {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.keys = {};
        
        this.player1Score = 0;
        this.player2Score = 0;
        
        this.gravity = 0.8;
        this.friction = 0.85;
        this.bounceDecay = 0.95;
        
        this.selectedCharacters = {
            player1: 'pikachu',
            player2: 'pikachu'
        };
        
        this.characters = {
            pikachu: { color: '#FFD700', eyeColor: '#000', cheekColor: '#FF69B4', earColor: '#FF0000' },
            raichu: { color: '#FFA500', eyeColor: '#000', cheekColor: '#FF1493', earColor: '#8B4513' },
            squirtle: { color: '#87CEEB', eyeColor: '#000', cheekColor: '#FFB6C1', earColor: '#4169E1' }
        };
        
        this.initializeGame();
        this.bindEvents();
        this.setupCharacterSelection();
    }
    
    initializeGame() {
        this.player1 = {
            x: 150,
            y: 300,
            width: 60,
            height: 60,
            velocityX: 0,
            velocityY: 0,
            onGround: false,
            color: '#FFD700',
            eyeColor: '#000',
            cheekColor: '#FF69B4',
            earColor: '#FF0000',
            speed: 5,
            jumpPower: 15
        };
        
        this.player2 = {
            x: 590,
            y: 300,
            width: 60,
            height: 60,
            velocityX: 0,
            velocityY: 0,
            onGround: false,
            color: '#FF6B6B',
            eyeColor: '#000',
            cheekColor: '#FF69B4',
            earColor: '#FF0000',
            speed: 5,
            jumpPower: 15
        };
        
        this.ball = {
            x: 400,
            y: 100,
            radius: 20,
            velocityX: 1.5,
            velocityY: 0,
            color: '#FFA500'
        };
        
        this.setBallAboveRandomPlayer();
        
        this.net = {
            x: 380,
            y: 250,
            width: 40,
            height: 150
        };
        
        this.ground = this.canvas.height - 50;
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('reset-game').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('back-to-selection').addEventListener('click', () => {
            this.showCharacterSelection();
        });
    }
    
    setupCharacterSelection() {
        const characterBtns = document.querySelectorAll('.character-btn');
        characterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const player = e.target.dataset.player;
                const character = e.target.dataset.character;
                
                // Remove selected class from other buttons for this player
                document.querySelectorAll(`[data-player="${player}"]`).forEach(b => {
                    b.classList.remove('selected');
                });
                
                // Add selected class to clicked button
                e.target.classList.add('selected');
                
                // Store selection
                this.selectedCharacters[`player${player}`] = character;
            });
        });
        
        document.getElementById('start-selection').addEventListener('click', () => {
            this.showGameArea();
            this.updatePlayerAppearances();
            this.drawInitialState();
        });
    }
    
    showCharacterSelection() {
        document.getElementById('character-selection').style.display = 'block';
        document.getElementById('game-area').style.display = 'none';
        this.gameRunning = false;
    }
    
    showGameArea() {
        document.getElementById('character-selection').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
    }
    
    updatePlayerAppearances() {
        const char1 = this.characters[this.selectedCharacters.player1];
        const char2 = this.characters[this.selectedCharacters.player2];
        
        this.player1.color = char1.color;
        this.player1.eyeColor = char1.eyeColor;
        this.player1.cheekColor = char1.cheekColor;
        this.player1.earColor = char1.earColor;
        this.player1.useImage = char1.useImage;
        this.player1.image = char1.image;
        
        this.player2.color = char2.color;
        this.player2.eyeColor = char2.eyeColor;
        this.player2.cheekColor = char2.cheekColor;
        this.player2.earColor = char2.earColor;
        this.player2.useImage = char2.useImage;
        this.player2.image = char2.image;
    }
    
    addCustomCharacter(name, imagePath) {
        const img = new Image();
        img.onload = () => {
            this.characters[name] = {
                color: '#FFD700',
                eyeColor: '#000', 
                cheekColor: '#FF69B4', 
                earColor: '#FF0000',
                useImage: true,
                image: img
            };
            
            // Add button to character selection
            this.addCharacterButton(name);
        };
        img.src = imagePath;
    }
    
    addCharacterButton(characterName) {
        const player1Options = document.querySelector('.player-selection:first-child .character-options');
        const player2Options = document.querySelector('.player-selection:last-child .character-options');
        
        // Add button for player 1
        const btn1 = document.createElement('button');
        btn1.className = 'character-btn';
        btn1.dataset.player = '1';
        btn1.dataset.character = characterName;
        btn1.textContent = characterName;
        player1Options.appendChild(btn1);
        
        // Add button for player 2
        const btn2 = document.createElement('button');
        btn2.className = 'character-btn';
        btn2.dataset.player = '2';
        btn2.dataset.character = characterName;
        btn2.textContent = characterName;
        player2Options.appendChild(btn2);
        
        // Add event listeners
        [btn1, btn2].forEach(btn => {
            btn.addEventListener('click', (e) => {
                const player = e.target.dataset.player;
                const character = e.target.dataset.character;
                
                document.querySelectorAll(`[data-player="${player}"]`).forEach(b => {
                    b.classList.remove('selected');
                });
                
                e.target.classList.add('selected');
                this.selectedCharacters[`player${player}`] = character;
            });
        });
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.player1Score = 0;
        this.player2Score = 0;
        this.updateScore();
        this.initializeGame();
        this.drawInitialState();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.updatePlayers();
        this.updateBall();
        this.checkCollisions();
        this.checkScore();
    }
    
    updatePlayers() {
        [this.player1, this.player2].forEach((player, index) => {
            const controls = index === 0 ? 
                { left: 'a', right: 'd', jump: 'w' } : 
                { left: 'arrowleft', right: 'arrowright', jump: 'arrowup' };
            
            if (this.keys[controls.left]) {
                player.velocityX = -player.speed;
            } else if (this.keys[controls.right]) {
                player.velocityX = player.speed;
            } else {
                player.velocityX *= this.friction;
            }
            
            if (this.keys[controls.jump] && player.onGround) {
                player.velocityY = -player.jumpPower;
                player.onGround = false;
            }
            
            player.velocityY += this.gravity;
            
            player.x += player.velocityX;
            player.y += player.velocityY;
            
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > this.canvas.width) {
                player.x = this.canvas.width - player.width;
            }
            
            if (player.y + player.height >= this.ground) {
                player.y = this.ground - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            
            if (index === 0 && player.x + player.width > this.net.x) {
                player.x = this.net.x - player.width;
            }
            if (index === 1 && player.x < this.net.x + this.net.width) {
                player.x = this.net.x + this.net.width;
            }
        });
    }
    
    updateBall() {
        this.ball.velocityY += this.gravity * 0.5;
        
        this.ball.x += this.ball.velocityX;
        this.ball.y += this.ball.velocityY;
        
        if (this.ball.x - this.ball.radius <= 0 || this.ball.x + this.ball.radius >= this.canvas.width) {
            this.ball.velocityX *= -this.bounceDecay;
            if (this.ball.x - this.ball.radius <= 0) this.ball.x = this.ball.radius;
            if (this.ball.x + this.ball.radius >= this.canvas.width) this.ball.x = this.canvas.width - this.ball.radius;
        }
        
        if (this.ball.y + this.ball.radius >= this.ground) {
            this.ball.y = this.ground - this.ball.radius;
            this.ball.velocityY *= -this.bounceDecay;
            this.ball.velocityX *= this.friction;
        }
        
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.y = this.ball.radius;
            this.ball.velocityY *= -this.bounceDecay;
        }
    }
    
    checkCollisions() {
        [this.player1, this.player2].forEach(player => {
            const dx = this.ball.x - (player.x + player.width / 2);
            const dy = this.ball.y - (player.y + player.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.ball.radius + 30) {
                const playerCenter = player.x + player.width / 2;
                const ballRelativeX = this.ball.x - playerCenter;
                
                const horizontalForce = 3 + (Math.random() - 0.5) * 1;
                const upwardForce = -10 + (Math.random() - 0.5) * 2;
                
                // 공이 플레이어의 어느 쪽에 있는지에 따라 방향 결정 (자연스러운 물리)
                const direction = ballRelativeX > 0 ? 1 : -1;
                
                this.ball.velocityX = direction * horizontalForce;
                this.ball.velocityY = upwardForce;
                
                // 공을 플레이어에서 떨어뜨려서 충돌 반복 방지
                const angle = Math.atan2(dy, dx);
                this.ball.x = player.x + player.width / 2 + Math.cos(angle) * (this.ball.radius + 35);
                this.ball.y = player.y + player.height / 2 + Math.sin(angle) * (this.ball.radius + 35);
            }
        });
        
        if (this.ball.x + this.ball.radius > this.net.x && 
            this.ball.x - this.ball.radius < this.net.x + this.net.width &&
            this.ball.y + this.ball.radius > this.net.y) {
            
            if (this.ball.x < this.net.x + this.net.width / 2) {
                this.ball.x = this.net.x - this.ball.radius;
            } else {
                this.ball.x = this.net.x + this.net.width + this.ball.radius;
            }
            this.ball.velocityX *= -this.bounceDecay;
        }
    }
    
    checkScore() {
        if (this.ball.y + this.ball.radius >= this.ground) {
            let winner;
            if (this.ball.x < this.canvas.width / 2) {
                this.player2Score++;
                winner = 'player2';
            } else {
                this.player1Score++;
                winner = 'player1';
            }
            this.updateScore();
            this.resetPlayersAndBall(winner);
        }
    }
    
    setBallAboveRandomPlayer() {
        const randomPlayer = Math.random() > 0.5 ? this.player1 : this.player2;
        this.ball.x = randomPlayer.x + randomPlayer.width / 2;
        this.ball.y = randomPlayer.y - 100;
        this.ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * 1;
        this.ball.velocityY = 0;
    }
    
    resetPlayersAndBall(winner) {
        // Reset players to initial positions
        this.player1.x = 150;
        this.player1.y = 300;
        this.player1.velocityX = 0;
        this.player1.velocityY = 0;
        this.player1.onGround = false;
        
        this.player2.x = 590;
        this.player2.y = 300;
        this.player2.velocityX = 0;
        this.player2.velocityY = 0;
        this.player2.onGround = false;
        
        // Set ball above winning player
        const winningPlayer = winner === 'player1' ? this.player1 : this.player2;
        this.ball.x = winningPlayer.x + winningPlayer.width / 2;
        this.ball.y = winningPlayer.y - 100;
        this.ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * 1;
        this.ball.velocityY = 0;
    }
    
    resetBall() {
        this.setBallAboveRandomPlayer();
    }
    
    updateScore() {
        document.getElementById('player1-score').textContent = this.player1Score;
        document.getElementById('player2-score').textContent = this.player2Score;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        this.drawNet();
        this.drawPlayer(this.player1);
        this.drawPlayer(this.player2);
        this.drawBall();
    }
    
    drawInitialState() {
        this.draw();
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#F0E68C');
        gradient.addColorStop(1, '#90EE90');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.ground, this.canvas.width, 50);
    }
    
    drawNet() {
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.net.x, this.net.y, this.net.width, this.net.height);
        
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 5; j++) {
                this.ctx.strokeRect(
                    this.net.x + j * 8,
                    this.net.y + i * 20,
                    8,
                    20
                );
            }
        }
    }
    
    drawPlayer(player) {
        if (player.useImage && player.image && player.image.complete) {
            // Draw custom image
            this.ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
        } else {
            // Draw default rectangle character
            // Body
            this.ctx.fillStyle = player.color;
            this.ctx.fillRect(player.x, player.y, player.width, player.height);
            
            // Eyes
            this.ctx.fillStyle = player.eyeColor;
            this.ctx.fillRect(player.x + 15, player.y + 15, 8, 8);
            this.ctx.fillRect(player.x + 37, player.y + 15, 8, 8);
            
            // Cheeks
            this.ctx.fillStyle = player.cheekColor;
            this.ctx.fillRect(player.x + 20, player.y + 35, 20, 5);
            
            // Ears
            this.ctx.fillStyle = player.earColor;
            this.ctx.fillRect(player.x + 10, player.y + 5, 15, 8);
            this.ctx.fillRect(player.x + 35, player.y + 5, 15, 8);
        }
    }
    
    drawBall() {
        this.ctx.fillStyle = this.ball.color;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius - 2, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.ball.x - this.ball.radius + 5, this.ball.y);
        this.ctx.lineTo(this.ball.x + this.ball.radius - 5, this.ball.y);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius / 2, 0, Math.PI * 2);
        this.ctx.stroke();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new PikachuVolleyball();
    
    // 커스텀 캐릭터 추가
    game.addCustomCharacter('서', 'seo.png');
    game.addCustomCharacter('고', 'go.png');
});