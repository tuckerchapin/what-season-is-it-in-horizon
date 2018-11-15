function setBackgroundImage(currentSeason) {
    // Randomly select a background appropriate for the season
    let selectedBackground = userBackgrounds[currentSeason][Math.floor(Math.random() * userBackgrounds[currentSeason].length)];
    document.getElementById("season-background").src = `images/${currentSeason}/backgrounds/${selectedBackground}.jpg`;

    // Art credit
    console.log("Background image courtesy of /u/" + selectedBackground.slice(0, -2));
}

function setSeasonal(currentSeason, nextSeason) {
    document.title = "It's " + currentSeason + " in Horizon";
    document.getElementById("season-splash").src = `images/${currentSeason}/${currentSeason}-splash.svg`;
    document.getElementById("countdown-title").textContent = nextSeason + " starts in";

    setBackgroundImage(currentSeason);
}

function setCountdown(days, hours, minutes, seconds) {
    // Set all the times
    document.getElementById("days").textContent = days;
    document.getElementById("hours").textContent = hours;
    document.getElementById("minutes").textContent = minutes;
                                                    // Pad the seconds to two digits
                                                    console.log((seconds > 9) ? seconds : ("0" + seconds));
    document.getElementById("seconds").textContent = (seconds > 9) ? seconds : ("0" + seconds);

    if (days > 0) {
        // Reset the display style if previously hidden.
        document.getElementById("days").style.display = "";
        document.getElementById("days-label").style.display = "";
        document.getElementById("hours").style.display = "";
        document.getElementById("hours-label").style.display = "";

        // Hide the seconds
        document.getElementById("seconds").style.display = "none";
        document.getElementById("seconds-label").style.display = "none";
        document.getElementById("seconds-label").textContent = "S";
    } else if (hours > 0) {
        // If there are no full days, but a non-zero number of hours, display 2 values.
        // Hide the days
        document.getElementById("days").style.display = "none";
        document.getElementById("days-label").style.display = "none";

        // Hide the seconds
        document.getElementById("seconds").style.display = "none";
        document.getElementById("seconds-label").style.display = "none";
        document.getElementById("seconds-label").textContent = "S";
    } else if (minutes > 0){
        // Zero days, zero hours: display only minutes and seconds.
        // Hide the days and hours
        document.getElementById("days").style.display = "none";
        document.getElementById("days-label").style.display = "none";
        document.getElementById("hours").style.display = "none";
        document.getElementById("hours-label").style.display = "none";

        // Show the seconds
        document.getElementById("seconds").style.display = "";
        document.getElementById("seconds-label").style.display = "";
    } else {
        // Zero days, zero minutes, zero hours: display only seconds with the full word.
        // Hide the days and hours and minutes
        document.getElementById("days").style.display = "none";
        document.getElementById("days-label").style.display = "none";
        document.getElementById("hours").style.display = "none";
        document.getElementById("hours-label").style.display = "none";
        document.getElementById("minutes").style.display = "none";
        document.getElementById("minutes-label").style.display = "none";

        // Show the seconds
        document.getElementById("seconds").style.display = "";
        document.getElementById("seconds-label").style.display = "";
        document.getElementById("seconds-label").textContent = "SECONDS";
    }
}
