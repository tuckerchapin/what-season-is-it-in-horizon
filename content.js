// List of the uploaded user's images
const userBackgrounds = {
    "winter": [
        "kml-1",
        "parkel421",
        "parkel422",
        "parkel423",
        "CCXGT1",
        "naixu1",
    ],
    "spring": [
    ],
    "summer": [
    ],
    "autumn": [
        "SkylineSonata1",
    ],
};

document.getElementById("season-splash").src = `images/${currentSeason}/${currentSeason}-splash.svg`;

if (userBackgrounds[currentSeason].length > 0) {
    // Randomly select a background appropriate for the season
    let selectedBackground = userBackgrounds[currentSeason][Math.floor(Math.random() * userBackgrounds[currentSeason].length)];
    document.getElementById("season-background").src = `images/${currentSeason}/backgrounds/${selectedBackground}.jpg`;

    // Art credit
    console.log("Background image courtesy of /u/" + selectedBackground.slice(0, -1));
} else {
    document.getElementById("season-background").src = `images/${currentSeason}/${currentSeason}-background-default.jpg`;
}

document.getElementById("days").textContent = daysTilNextSeason;
document.getElementById("hours").textContent = hoursTilNextSeason;
document.getElementById("minutes").textContent = hoursTilNextSeason;
document.getElementById("countdown-title").textContent = nextSeason + " starts in";
