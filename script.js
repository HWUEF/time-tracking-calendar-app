document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const dayViewBtn = document.getElementById('day-view');
    const threeDayViewBtn = document.getElementById('three-day-view');
    const weekViewBtn = document.getElementById('week-view');
    const viewButtons = [dayViewBtn, threeDayViewBtn, weekViewBtn];
    const todayBtn = document.getElementById('today-btn');
    const prevPeriodBtn = document.getElementById('prev-period-btn');
    const nextPeriodBtn = document.getElementById('next-period-btn');

    const calendarGrid = document.querySelector('.calendar-grid');
    const calendarHeader = document.querySelector('.calendar-header h2');
    const themeToggleButton = document.querySelector('.theme-toggle');

    // --- State ---
    let currentDate = new Date();
    // Keep track of the current view (1, 3, or 7 days)
    // Initialize to 7 as it's the default active view
    let currentViewDays = 7;

    // --- Formatters ---
    const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
    const dateFormatter = new Intl.DateTimeFormat('en-US', { day: 'numeric' });

    // --- Core Functions ---

    /**
     * Renders the calendar grid for the specified number of days.
     * @param {number} numDays - The number of days to display (1, 3, or 7).
     */
    const renderCalendar = (numDays) => {
        // 1. Clear previous state and update header
        calendarGrid.innerHTML = '';
        calendarGrid.classList.add('populated');
        updateHeader(numDays);

        // 2. Determine the start date for the view
        const startDate = new Date(currentDate);
        if (numDays === 7) {
            // For week view, start on the most recent Sunday
            startDate.setDate(startDate.getDate() - startDate.getDay());
        }

        // 3. Set up CSS Grid columns
        // 1 column for time labels, and 'numDays' columns for the days
        calendarGrid.style.gridTemplateColumns = `55px repeat(${numDays}, 1fr)`;

        // 4. Create and append grid cells
        
        // Top-left empty corner cell
        const cornerCell = document.createElement('div');
        cornerCell.classList.add('grid-cell', 'corner-cell');
        calendarGrid.appendChild(cornerCell);

        // Day header cells
        const today = new Date();
        for (let i = 0; i < numDays; i++) {
            const day = new Date(startDate);
            day.setDate(day.getDate() + i);
            
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('grid-cell', 'day-header');
            
            // Check if the current header is for today
            if (day.toDateString() === today.toDateString()) {
                dayHeader.classList.add('today');
            }

            dayHeader.innerHTML = `
                <span class="day-name">${dayFormatter.format(day)}</span>
                <span class="day-number">${dateFormatter.format(day)}</span>
            `;
            calendarGrid.appendChild(dayHeader);
        }

        // Time rows (from 12 AM to 11 PM)
        for (let hour = 0; hour < 24; hour++) {
            // Time label cell
            const timeLabel = document.createElement('div');
            timeLabel.classList.add('grid-cell', 'time-label');
            const d = new Date();
            d.setHours(hour);
            // Format time like "9 AM", "1 PM"
            timeLabel.textContent = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            calendarGrid.appendChild(timeLabel);

            // Time slot cells for each day
            for (let i = 0; i < numDays; i++) {
                const timeSlot = document.createElement('div');
                timeSlot.classList.add('grid-cell', 'time-slot');
                timeSlot.dataset.hour = hour;
                // You can add event listeners here to handle creating events
                calendarGrid.appendChild(timeSlot);
            }
        }
    };

    /**
     * Updates the main calendar header text based on the view.
     * @param {number} numDays 
     */
    const updateHeader = (numDays) => {
        if (numDays === 1) {
            calendarHeader.textContent = 'Day View';
        } else if (numDays === 3) {
            calendarHeader.textContent = '3-Day View';
        } else {
            calendarHeader.textContent = 'Week View';
        }
    };

    /**
     * Handles click events on view toggle buttons.
     * @param {number} numDays 
     * @param {HTMLElement} clickedButton 
     */
    const handleViewChange = (numDays, clickedButton) => {
        currentViewDays = numDays; // Update the state
        // Update active class on buttons
        viewButtons.forEach(button => button.classList.remove('active'));
        clickedButton.classList.add('active');
        
        // Re-render the calendar with the new view
        renderCalendar(numDays);
    };

    // --- Event Listeners ---
    dayViewBtn.addEventListener('click', () => handleViewChange(1, dayViewBtn));
    threeDayViewBtn.addEventListener('click', () => handleViewChange(3, threeDayViewBtn));
    weekViewBtn.addEventListener('click', () => handleViewChange(7, weekViewBtn));

    todayBtn.addEventListener('click', () => {
        currentDate = new Date(); // Reset to today
        renderCalendar(currentViewDays);
    });

    prevPeriodBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - currentViewDays);
        renderCalendar(currentViewDays);
    });

    nextPeriodBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + currentViewDays);
        renderCalendar(currentViewDays);
    });


    // --- Dynamic Theming Engine ---

    /**
     * Converts a HEX color string to an HSL array.
     * @param {string} hex - The hex color string (e.g., "#RRGGBB").
     * @returns {number[]} - An array [hue, saturation, lightness].
     */
    const hexToHsl = (hex) => {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];
        } else if (hex.length == 7) {
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }
        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;
        if (delta == 0) h = 0;
        else if (cmax == r) h = ((g - b) / delta) % 6;
        else if (cmax == g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);
        return [h, s, l];
    };

    /**
     * Generates a full M3-style theme from a single source color.
     * @param {string} sourceHex - The base color to generate the theme from.
     */
    const applyThemeFromSourceColor = (sourceHex) => {
        const [h, s, l] = hexToHsl(sourceHex);

        // Generate HSL color strings for different roles
        const C = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

        // Define the tonal palette using HSL adjustments
        const lightTheme = {
            '--md-sys-color-primary': C(h, s, 40),
            '--md-sys-color-on-primary': C(h, s, 100),
            '--md-sys-color-primary-container': C(h, s, 90),
            '--md-sys-color-on-primary-container': C(h, s, 10),
            '--md-sys-color-secondary': C(h, s - 10, 40),
            '--md-sys-color-on-secondary': C(h, s, 100),
            '--md-sys-color-secondary-container': C(h, s - 10, 90),
            '--md-sys-color-on-secondary-container': C(h, s - 10, 10),
            '--md-sys-color-surface': C(h, s, 99),
            '--md-sys-color-on-surface': C(h, s, 10),
            '--md-sys-color-surface-variant': C(h, s - 5, 90),
            '--md-sys-color-on-surface-variant': C(h, s - 5, 30),
            '--md-sys-color-surface-container': C(h, s - 15, 95),
            '--md-sys-color-surface-container-high': C(h, s - 15, 92),
            '--md-sys-color-surface-container-highest': C(h, s - 15, 90),
            '--md-sys-color-outline': C(h, s - 10, 50),
            '--md-sys-color-outline-variant': C(h, s - 10, 80),
        };

        const darkTheme = {
            '--md-sys-color-primary': C(h, s, 80),
            '--md-sys-color-on-primary': C(h, s, 20),
            '--md-sys-color-primary-container': C(h, s, 30),
            '--md-sys-color-on-primary-container': C(h, s, 90),
            '--md-sys-color-secondary': C(h, s - 10, 80),
            '--md-sys-color-on-secondary': C(h, s - 10, 20),
            '--md-sys-color-secondary-container': C(h, s - 10, 30),
            '--md-sys-color-on-secondary-container': C(h, s - 10, 90),
            '--md-sys-color-surface': C(h, s, 6),
            '--md-sys-color-on-surface': C(h, s, 90),
            '--md-sys-color-surface-variant': C(h, s - 5, 30),
            '--md-sys-color-on-surface-variant': C(h, s - 5, 80),
            '--md-sys-color-surface-container': C(h, s - 15, 12),
            '--md-sys-color-surface-container-high': C(h, s - 15, 17),
            '--md-sys-color-surface-container-highest': C(h, s - 15, 22),
            '--md-sys-color-outline': C(h, s - 10, 60),
            '--md-sys-color-outline-variant': C(h, s - 10, 30),
        };

        // Create CSS rule strings
        const lightRules = Object.entries(lightTheme).map(([key, value]) => `${key}: ${value};`).join('\n');
        const darkRules = Object.entries(darkTheme).map(([key, value]) => `${key}: ${value};`).join('\n');

        // Inject styles into the head
        let styleElement = document.getElementById('dynamic-theme-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-theme-styles';
            document.head.appendChild(styleElement);
        }
        styleElement.innerHTML = `
            :root {
                ${lightRules}
            }
            body[data-theme="dark"] {
                ${darkRules}
            }
        `;
    };

    /** Initializes the theme toggle button and loads user preference. */
    const initializeThemeToggle = () => {
        if (!themeToggleButton) return;

        const applyTheme = (isDark) => {
            if (isDark) {
                document.body.setAttribute('data-theme', 'dark');
                // In dark mode, show the sun icon to switch to light mode
                themeToggleButton.innerHTML = `<span class="material-symbols-outlined">light_mode</span>`;
            } else {
                document.body.removeAttribute('data-theme');
                // In light mode, show the moon icon to switch to dark mode
                themeToggleButton.innerHTML = `<span class="material-symbols-outlined">dark_mode</span>`;
            }
            localStorage.setItem('isDarkMode', isDark);
        };

        themeToggleButton.addEventListener('click', () => {
            const isCurrentlyDark = document.body.hasAttribute('data-theme');
            applyTheme(!isCurrentlyDark);
        });

        // Load saved preference
        const savedPreference = localStorage.getItem('isDarkMode') === 'true';
        applyTheme(savedPreference);
    }

    // --- Initial Render ---
    // 1. Define your single source color here.
    // Try other colors like "#B3261E" (Red), "#006D3D" (Green), or "#3B5998" (Blue)
    var sourceColor = "#2c83bdff";

    // Ensure sourceColor is a 6-digit hex for the HSL converter
    if (sourceColor.length === 9) { // handles #RRGGBBAA
        sourceColor = sourceColor.slice(0, 7); // becomes #RRGGBB
    }

    // 2. Generate and apply the theme based on the source color.
    applyThemeFromSourceColor(sourceColor);

    // 3. Initialize the theme toggle based on the new HTML button
    initializeThemeToggle();

    // Render the default view (7 days) on page load
    renderCalendar(currentViewDays);
});
