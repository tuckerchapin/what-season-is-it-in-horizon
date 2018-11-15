// List of the uploaded user's images
const userBackgrounds = {
    "winter": [
        "kml-1.jpg",
        "parkel421.jpg",
        "parkel422.jpg",
        "parkel423.jpg",
        "CCXGT1.png",
        "naixu1.png",
    ],
    "spring": [
    ],
    "summer": [
    ],
    "autumn": [
        "SkylineSonata1.jpg",
    ],
};

document.getElementById("season-splash").src = `images/${currentSeason}/${currentSeason}-splash.svg`;

// Randomly select a background appropraite for the season
if (userBackgrounds[currentSeason].length > 0) {
    let selectedBackground = userBackgrounds[currentSeason][Math.floor(Math.random() * userBackgrounds[currentSeason].length)];
    document.getElementById("season-background").src = `images/${currentSeason}/backgrounds/${selectedBackground}`;
} else {
    document.getElementById("season-background").src = `images/${currentSeason}/${currentSeason}-background-default.jpg`;
}

document.getElementById("days").textContent = daysTilNextSeason;
document.getElementById("hours").textContent = hoursTilNextSeason;
document.getElementById("minutes").textContent = hoursTilNextSeason;
document.getElementById("countdown-title").textContent = nextSeason + " starts in";

// Art credit
console.log("Background image courtesy of " + selectedBackground.replace(/\.[^/.]+$/, "").slice(0, -1));
