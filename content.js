document.body.addEventListener('touchmove', (e) => e.preventDefault(), false);

document.getElementById("season-splash").src = `images/${currentSeason}/${currentSeason}-splash.png`;
document.getElementById("season-background").src = `images/${currentSeason}/${currentSeason}-background.jpg`;

document.getElementById("days").textContent = daysTilNextSeason;
document.getElementById("hours").textContent = hoursTilNextSeason;
document.getElementById("minutes").textContent = hoursTilNextSeason;
document.getElementById("countdown-title").textContent = nextSeason + " starts in";
