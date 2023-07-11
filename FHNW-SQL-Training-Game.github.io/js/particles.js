function getElementPosition(element) {
    if (element instanceof String) {
        element = document.getElementById(element);
    }
    if (element) {
        if (element.offsetLeft && element.offsetTop) {
            return {x: element.offsetLeft, y: element.offsetTop};
        }
        if (element.x && element.y) {
            return element;
        }
        if (element.getBoundingClientRect) {
            // This call is more expensive as it forces style evaluation, so it is last.
            const rect = element.getBoundingClientRect();
            return {x: rect.left, y: rect.top};
        }
    }
    return {x: 0, y: 0};
}

function clearParticles() {
    document.querySelectorAll('.particle').forEach(el => el.remove());
}

class Particle {
    constructor(element, initialPosition, initialVelocity) {
        this.element = element;
        this.x = initialPosition ? initialPosition.x : getElementPosition(element).x;
        this.y = initialPosition ? initialPosition.y : getElementPosition(element).y;
        this.vx = initialVelocity ? initialVelocity.x : 0;
        this.vy = initialVelocity ? initialVelocity.y : 0;

        this.animated = false;
    }

    applyForce({x, y}) {
        this.vx += x;
        this.vy += y;
    }

    updatePosition(framerateAdjust) {
        this.x += this.vx * framerateAdjust;
        this.y += this.vy * framerateAdjust;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    vectorTo(another) {
        let position;
        if (another instanceof Particle) {
            position = {x: another.x, y: another.y};
        } else {
            position = getElementPosition(another);
        }
        return {
            x: this.x - position.x,
            y: this.y - position.y,
            length: Math.sqrt(Math.abs(this.x * position.x) + Math.abs(this.y * position.y))
        };
    }

    getNormalizedVelocity() {
        const length = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        return {
            x: this.vx / length, y: this.vy / length
        }
    }

    frame() {
        // no-op, set animation elsewhere.
    }

    flyTo(to, specificsPerFrame) {
        this.animated = true;
        const particle = this;
        const target = getElementPosition(to);

        let previous;
        this.frame = function (time) {
            const firstFrame = !previous;
            const elapsed = firstFrame ? 0 : time - previous;
            previous = time;

            const framerateAdjust = firstFrame ? 1 : 16.666666666 / elapsed;
            particle.updatePosition(framerateAdjust);
            if (specificsPerFrame) specificsPerFrame();


            const direction = particle.vectorTo(target);
            particle.applyForce({
                x: -direction.x * framerateAdjust / direction.length,
                y: -direction.y * framerateAdjust / direction.length
            });

            if (Math.abs(direction.x) < 15 || Math.abs(direction.y) < 15) {
                this.animated = false;
                this.frame = function () {
                }
            }
        };
    }

    orbit(target) {
        this.animated = true;
        const particle = this;
        const center = getElementPosition(target);
        let previous;
        let start = 0;

        this.frame = function (time) {
            if (!start) start = time;
            const firstFrame = !previous;
            const sinceLastFrame = firstFrame ? 0 : time - previous;
            previous = time;

            const framerateAdjust = firstFrame ? 1 : 16.666666666 / sinceLastFrame;
            particle.updatePosition(framerateAdjust);

            const direction = particle.vectorTo(center);
            if (firstFrame) {
                const vel = particle.getNormalizedVelocity();
                particle.vx = vel.x * direction.length / 40;
                particle.vy = vel.y * direction.length / 40;
            }
            const distPow2 = direction.length / 2;
            particle.applyForce({
                x: -direction.x * framerateAdjust / distPow2,
                y: -direction.y * framerateAdjust / distPow2
            });
            // Keep particle on the screen
            if (particle.x < 0) {
                particle.applyForce({x: 2, y: 0});
            }
            if (particle.x > window.innerWidth) {
                particle.applyForce({x: -2, y: 0});
            }
            if (particle.y < 0) {
                particle.applyForce({x: 0, y: 2});
            }
            if (particle.y > window.innerHeight) {
                particle.applyForce({x: 0, y: -2});
            }
        };
    }
}

function insertStar(boundNextTo) {
    const id = `star-animated-${new Date().getTime()}`;
    document.getElementById(boundNextTo)
        .insertAdjacentHTML('afterend', `<i id="${id}" class="fa fa-star col-yellow star-animation particle"></i>`);

    return document.getElementById(id);
}

function createStarParticle(boundNextTo, initialPosition) {
    const star = insertStar(boundNextTo);
    const initialVelocity = {x: -Math.random() * 4 - 2, y: -Math.random() * 4 - 4};
    return new Particle(star, getElementPosition(initialPosition), initialVelocity);
}

function flyStarFromTo(boundNextTo, from, to) {
    if (!boundNextTo || !from || !to) return {animated: false};
    const particle = createStarParticle(boundNextTo, from);
    const star = particle.element;

    let firstFrame = true;
    particle.flyTo(to, () => {
        if (firstFrame) {
            firstFrame = false;
            star.style.transform = "scale(2)";
        }
    });
    return particle;
}

function insertFlame(boundNextTo) {
    const id = `flame-animated-${new Date().getTime()}`;
    document.getElementById(boundNextTo)
        .insertAdjacentHTML('afterend', `<div id="${id}" style="position: absolute" class="particle">${new Flame({
            id: 'flame-' + id,
            style: 'transform: scale(0.7);',
            evil: true
        }).render()}</div>`);

    return document.getElementById(id);
}

function createFlameParticle(boundNextTo, from) {
    const flame = insertFlame(boundNextTo);
    const initialVelocity = {x: -6 + Math.random() * 12, y: -1};
    return new Particle(flame, getElementPosition(from), initialVelocity);
}

function flyFlameFromTo(boundNextTo, from, to) {
    const particle = createFlameParticle(boundNextTo, from);
    particle.flyTo(to);
    return particle;
}

class Flame {
    constructor(options) {
        this.id = options.id ? options.id : '';
        this.classes = options.classes ? options.classes : '';
        this.onclick = options.onclick ? options.onclick : '';
        this.style = options.style ? options.style : '';

        this.evil = options.evil;
        this.dead = options.dead;
    }

    renderEvilFlame() {
        return `<svg enable-background="new 0 0 125 189.864" height="189.864px" id="${this.id}"
                     style="${this.style} filter: hue-rotate(-125deg) brightness(0.9);" class="${this.classes}" onclick="${this.onclick}"
                     version="1.1" viewBox="0 0 125 189.864"
                     width="125px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"
                     y="0px">
<path class="flame-main" d="M76.553,186.09c0,0-10.178-2.976-15.325-8.226s-9.278-16.82-9.278-16.82s-0.241-6.647-4.136-18.465
\tc0,0,3.357,4.969,5.103,9.938c0,0-5.305-21.086,1.712-30.418c7.017-9.333,0.571-35.654-2.25-37.534c0,0,13.07,5.64,19.875,47.54
\tc6.806,41.899,16.831,45.301,6.088,53.985" fill="#F36E21"/>
                    <path class="flame-main one" d="M61.693,122.257c4.117-15.4,12.097-14.487-11.589-60.872c0,0,32.016,10.223,52.601,63.123
\tc20.585,52.899-19.848,61.045-19.643,61.582c0.206,0.537-19.401-0.269-14.835-18.532S57.576,137.656,61.693,122.257z"
                          fill="#F6891F"/>
                    <path class="flame-main two" d="M81.657,79.192c0,0,11.549,24.845,3.626,40.02c-7.924,15.175-21.126,41.899-0.425,64.998
\tC84.858,184.21,125.705,150.905,81.657,79.192z" fill="#FFD04A"/>
                    <path class="flame-main three" d="M99.92,101.754c0,0-23.208,47.027-12.043,80.072c0,0,32.741-16.073,20.108-45.79
\tC95.354,106.319,99.92,114.108,99.92,101.754z" fill="#FDBA16"/>
                    <path class="flame-main four" d="M103.143,105.917c0,0,8.927,30.753-1.043,46.868c-9.969,16.115-14.799,29.041-14.799,29.041
\tS134.387,164.603,103.143,105.917z" fill="#F36E21"/>
                    <path class="flame-main five"
                          d="M62.049,104.171c0,0-15.645,67.588,10.529,77.655C98.753,191.894,69.033,130.761,62.049,104.171z"
                          fill="#FDBA16"/>
</svg>`
    }

    renderGoodFlame() {
        return `<svg enable-background="new 0 0 125 189.864" height="189.864px" id="${this.id}"
                         version="1.1" viewBox="0 0 125 189.864" class="${this.classes}" onclick="${this.onclick}"
                         width="125px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"
                         y="0px">
<path class="flame-main" d="M76.553,186.09c0,0-10.178-2.976-15.325-8.226s-9.278-16.82-9.278-16.82s-0.241-6.647-4.136-18.465
\tc0,0,3.357,4.969,5.103,9.938c0,0-5.305-21.086,1.712-30.418c7.017-9.333,0.571-35.654-2.25-37.534c0,0,13.07,5.64,19.875,47.54
\tc6.806,41.899,16.831,45.301,6.088,53.985" fill="#16AAFD"/>
                        <path class="flame-main one" d="M61.693,122.257c4.117-15.4,12.097-14.487-11.589-60.872c0,0,32.016,10.223,52.601,63.123
\tc20.585,52.899-19.848,61.045-19.643,61.582c0.206,0.537-19.401-0.269-14.835-18.532S57.576,137.656,61.693,122.257z"
                              fill="#4AB8FF"/>
                        <path class="flame-main two" d="M81.657,79.192c0,0,11.549,24.845,3.626,40.02c-7.924,15.175-21.126,41.899-0.425,64.998
\tC84.858,184.21,125.705,150.905,81.657,79.192z" fill="#1FD7F6"/>
                        <path class="flame-main three" d="M99.92,101.754c0,0-23.208,47.027-12.043,80.072c0,0,32.741-16.073,20.108-45.79
\tC95.354,106.319,99.92,114.108,99.92,101.754z" fill="#21F0F3"/>
                        <path class="flame-main four" d="M103.143,105.917c0,0,8.927,30.753-1.043,46.868c-9.969,16.115-14.799,29.041-14.799,29.041
\tS134.387,164.603,103.143,105.917z" fill="#16AAFD"/>
                        <path class="flame-main five"
                              d="M62.049,104.171c0,0-15.645,67.588,10.529,77.655C98.753,191.894,69.033,130.761,62.049,104.171z"
                              fill="#21F0F3"/>
</svg>`
    }

    render() {
        if (this.dead) return '<img src="img/glass-jar.png" alt="glass jar" class="captured-flame-jar">' + this.renderEvilFlame();
        return this.evil ? this.renderEvilFlame() : this.renderGoodFlame();
    }
}