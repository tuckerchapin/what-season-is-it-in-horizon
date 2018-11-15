function setBackgroundImage(currentSeason) {
    // Randomly select a background appropriate for the season
    let selectedBackground = userBackgrounds[currentSeason][Math.floor(Math.random() * userBackgrounds[currentSeason].length)];
    document.getElementById("season-background").src = `images/${currentSeason}/backgrounds/${selectedBackground}.jpg`;

    // Art credit
    console.log(`Background image courtesy of /u/${selectedBackground.slice(0, -2)}`);
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
    document.getElementById("seconds").textContent = (seconds > 9) ? seconds : ("0" + seconds);

    // Hide the days if there are zero full days left
    if (days === 0) {
        document.getElementById("days").style.display = "none";
        document.getElementById("days-label").style.display = "none";
    } else {
        document.getElementById("days").style.display = "";
        document.getElementById("days-label").style.display = "";
    }

    // Hide the hours if there are zero full hours AND days left
    if (hours === 0 && days === 0) {
        document.getElementById("hours").style.display = "none";
        document.getElementById("hours-label").style.display = "none";
    } else {
        document.getElementById("hours").style.display = "";
        document.getElementById("hours-label").style.display = "";
    }

    // Hide the minutes if there are zero full minutes, hours, AND days left
    if (minutes === 0 && hours === 0 && days === 0) {
        document.getElementById("minutes").style.display = "none";
        document.getElementById("minutes-label").style.display = "none";
    } else {
        document.getElementById("minutes").style.display = "";
        document.getElementById("minutes-label").style.display = "";
    }

    if (days === 0 && hours === 0) {
        // If there are no full hours or days left, show the seconds
        document.getElementById("seconds").style.display = "";
        document.getElementById("seconds-label").style.display = "";

        // If there are also no minutes left, show the full "seconds" label
        if (minutes === 0) {
            document.getElementById("seconds-label").textContent = "SECONDS";
        } else {
            document.getElementById("seconds-label").textContent = "S";
        }
    } else {
        document.getElementById("seconds").style.display = "none";
        document.getElementById("seconds-label").style.display = "none";
    }
}
