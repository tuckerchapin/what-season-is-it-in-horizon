function update() {
    let times = calculateTimes();

    // Check if the season has changed or not
    if (times.currentSeason !== lastCheckedSeason) {
        setSeasonal(times.currentSeason, times.nextSeason);
        lastCheckedSeason = times.currentSeason;
    }

    // Configure the countdown timer
    setCountdown(times.days, times.hours, times.minutes, times.seconds);

    // 
    if ((times.days === 0 && times.hours === 0) || (times.hours === 1 && times.minutes === 0)) {
        // If there are just minutes (or just seconds) left, update every second.
        if (!secondInterval) {
            clearInterval(minuteInterval);
            secondInterval = setInterval(() => update(), 1000);
        }
    } else {
        // If there are just minutes (or just seconds) left, update every second.
        if (!minuteInterval) {
            clearInterval(secondInterval);
            minuteInterval = setInterval(() => update(), 60000);
        }
    }
}

// Sets the page going.
update();
