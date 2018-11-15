function setSeasonal(currentSeason, nextSeason) {
    document.title = "It's " + currentSeason + " in Horizon";
    document.getElementById("season-splash").src = `images/${currentSeason}/${currentSeason}-splash.svg`;
    document.getElementById("countdown-title").textContent = nextSeason + " starts in";
}

function setBackgroundImage(currentSeason) {
    // Randomly select a background appropriate for the season
    let selectedBackground = userBackgrounds[currentSeason][Math.floor(Math.random() * userBackgrounds[currentSeason].length)];
    document.getElementById("season-background").src = `images/${currentSeason}/backgrounds/${selectedBackground}.jpg`;

    // Art credit
    console.log("Background image courtesy of /u/" + selectedBackground.slice(0, -2));
}

function setCountdown(days, hours, minutes) {
    if (days > 0) {
        // If there are a non-zero number of days, display all 3 values.
        document.getElementById("days").textContent = days;
        document.getElementById("hours").textContent = hours;
        document.getElementById("minutes").textContent = minutes;
    } else if (hours > 0) {
        // If there are no full days, but a non-zero number of days, display 2 values.
        document.getElementById("days").style.display = "none";
        document.getElementById("days-label").style.display = "none";
        document.getElementById("hours").textContent = hours;
        document.getElementById("minutes").textContent = minutes;
    } else {
        // Zero days, zero hours: display only minutes with full word.
        document.getElementById("days").style.display = "none";
        document.getElementById("days-label").style.display = "none";
        document.getElementById("hours").style.display = "none";
        document.getElementById("hours-label").style.display = "none";
        document.getElementById("minutes").textContent = minutes;
        document.getElementById("minutes-label").textContent = "MINUTES";
    }
}
