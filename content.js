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
        "spring"
    ],
    "summer": [
        "summer"
    ],
    "autumn": [
        "autumn"
    ],
};

document.getElementById("season-splash").src = `images/${currentSeason}/${currentSeason}-splash.svg`;

// Randomly select a background appropraite for the season
let selectedBackground = userBackgrounds[currentSeason][Math.floor(Math.random() * userBackgrounds[currentSeason].length)];
document.getElementById("season-background").src = `images/${currentSeason}/user/${selectedBackground}`;

document.getElementById("days").textContent = daysTilNextSeason;
document.getElementById("hours").textContent = hoursTilNextSeason;
document.getElementById("minutes").textContent = hoursTilNextSeason;
document.getElementById("countdown-title").textContent = nextSeason + " starts in";

// let countdownContainer = document.getElementById("countdown-container");
// let blurredBackground = document.createElement("img");
// blurredBackground.id = "blurred-background";
// blurredBackground.src = `images/${currentSeason}/user/${selectedBackground}`;
// // console.log(countdownContainer.offsetWidth);
// // console.log(blurredBackground.style.width);
// blurredBackground.style.width = countdownContainer.offsetWidth + "px";
// blurredBackground.style.height = countdownContainer.offsetHeight + "px";
// document.body.insertBefore(blurredBackground, document.getElementById("countdown-container"));
