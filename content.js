document.getElementById("season-splash").src = `images/${currentSeason}/${currentSeason}-splash.svg`;

// Background image
if (userBackgrounds[currentSeason].length > 0) {
    // Randomly select a background appropriate for the season
    let selectedBackground = userBackgrounds[currentSeason][Math.floor(Math.random() * userBackgrounds[currentSeason].length)];
    document.getElementById("season-background").src = `images/${currentSeason}/backgrounds/${selectedBackground}.jpg`;

    // Art credit
    console.log("Background image courtesy of /u/" + selectedBackground.slice(0, -1));
} else {
    document.getElementById("season-background").src = `images/${currentSeason}/${currentSeason}-background-default.jpg`;
}

// Timer
document.getElementById("countdown-title").textContent = nextSeason + " starts in";
if (daysTilNextSeason > 0) { // If there are a non-zero number of days, display all 3 values.
    document.getElementById("days").textContent = daysTilNextSeason;
    document.getElementById("hours").textContent = hoursTilNextSeason;
    document.getElementById("minutes").textContent = minutesTilNextSeason;
} else if (hoursTilNextSeason > 0) { // If there are no full days, but a non-zero number of days, display 2 values.
    document.getElementById("days").style.display = "none";
    document.getElementById("days-label").style.display = "none";
    document.getElementById("hours").textContent = hoursTilNextSeason;
    document.getElementById("minutes").textContent = minutesTilNextSeason;
} else { // Zero days, zero hours: display only minutes with full word.
    document.getElementById("days").style.display = "none";
    document.getElementById("days-label").style.display = "none";
    document.getElementById("hours").style.display = "none";
    document.getElementById("hours-label").style.display = "none";
    document.getElementById("minutes").textContent = minutesTilNextSeason;
    document.getElementById("minutes-label").textContent = "MINUTES";
}
