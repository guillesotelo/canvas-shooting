const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

class Proyectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white')
const projectiles = []
const enemies = []
const particules = []

const spawnEnemies = () => {
    setInterval(() => {
        const radius = Math.floor(Math.random() * 30) + 6
        let x, y

        if (Math.random() < .5) { // 50-50 chance
            x = Math.random() < .5 ? -radius : canvas.width + radius
            y = Math.random() * canvas.height + radius
        } else {
            x = Math.random() * canvas.width + radius
            y = Math.random() * canvas.height + radius
        }

        const enemyColor = `hsl(${Math.random() * 360}, 50%, 50%)`

        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        }
        enemies.push(new Enemy(
            x,
            y,
            radius,
            enemyColor,
            velocity
        ))
    }, 1000)
}
spawnEnemies()

let animationId
const animate = () => {
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

    particules.forEach((particule, l) => {
        if(particule.alpha <= 0) particules.splice(l, 1)
        else particule.update()
    })

    projectiles.forEach((projectile, k) => {
        projectile.update()

        // Remove projectiles off screen
        if (projectile.x - projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.x + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(k, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, i) => {
        enemy.update()

        // End game
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 1) {
            endGame()
        }

        projectiles.forEach((projectile, j) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // Projectile touches enemy
            if (dist - enemy.radius - projectile.radius < 1) {

                for (let i = 0; i < 8; i++) {
                    particules.push(new Particle(
                        projectile.x,
                        projectile.y,
                        3,
                        enemy.color,
                        {
                            x: Math.random() - .5,
                            y: Math.random() - .5
                        }
                    ))
                }

                if (enemy.radius - 10 > 5) {
                    // Transition for reducing enemy radio after hit
                    gsap.to(enemy, { radius: enemy.radius - 10 })
                    setTimeout(() => {
                        projectiles.splice(j, 1)
                    }, 0)
                } else {
                    setTimeout(() => {
                        projectiles.splice(j, 1)
                        enemies.splice(i, 1)
                    }, 0)
                }
            }
        })
    })
}
animate()

const endGame = () => {
    cancelAnimationFrame(animationId)
}

window.addEventListener('click', (e) => {

    // Calculate the angle from X and Y to get the Hypotenuse
    const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    }
    projectiles.push(new Proyectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        'white',
        velocity
    ))
})