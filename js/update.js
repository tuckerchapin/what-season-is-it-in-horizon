function update(check = true) {
    let times = calculateTimes();

    // Check if the season has changed or not
    if (!check || times.currentSeason != currentSeason) {
        setSeasonal(times.currentSeason, times.nextSeason);
        setBackgroundImage(times.currentSeason);
    }

    // Always set the countdown timer
    setCountdown(times.days, times.hours, times.minutes);
}

// Sets the page initially.
update(false);

// Update the time every minute
setInterval(() => update(), 60000)
