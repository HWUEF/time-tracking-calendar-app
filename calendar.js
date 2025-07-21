

// --- Configuration ---
// IMPORTANT: You must get these from the Google Cloud Console.
// 1. Go to https://console.cloud.google.com/
// 2. Select your Firebase project.
// 3. Go to "APIs & Services" > "Credentials".
// 4. Create an "API Key" and a "OAuth 2.0 Client ID" for a Web Application.
const API_KEY = "AIzaSyD5b-_8royvsrVzDduOCDfI8_qPIXjBRDY"; // Replace with your API Key
const CLIENT_ID = "1073442948302-uga7hluj4ojargd13ngufsbl1qhi0fpt.apps.googleusercontent.com"; // Replace with your Client ID

// The scope required to read a user's calendar events.
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

// Discovery document for the Calendar API.
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

/**
 * Loads the Google API client and initializes it.
 * @returns {Promise<void>} A promise that resolves when initialization is complete.
 */
const initGoogleClient = () => {
    return new Promise((resolve, reject) => {
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    scope: CALENDAR_SCOPE,
                    discoveryDocs: [DISCOVERY_DOC],
                });
                resolve();
            } catch (error) {
                console.error("Error initializing Google API client:", error);
                reject(error);
            }
        });
    });
};

/**
 * Fetches events from the user's primary Google Calendar within a given date range.
 * @param {Date} startDate - The start of the date range.
 * @param {Date} endDate - The end of the date range.
 * @returns {Promise<Array>} A promise that resolves with an array of calendar events.
 */
const fetchCalendarEvents = async (startDate, endDate) => {
    if (!gapi.client?.calendar) {
        console.error("Google Calendar API client is not initialized.");
        return [];
    }

    try {
        const response = await gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': startDate.toISOString(),
            'timeMax': endDate.toISOString(),
            'showDeleted': false,
            'singleEvents': true, // Expands recurring events into individual instances
            'orderBy': 'startTime'
        });

        return response.result.items || [];
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        // This could happen if the user didn't grant calendar scope.
        // You could add UI feedback here to ask the user to re-authenticate with the correct scope.
        alert("Could not fetch Google Calendar events. Please ensure you have granted calendar permissions.");
        return [];
    }
};

// Expose the functions to be used by other scripts
window.googleCalendar = {
    initGoogleClient,
    fetchCalendarEvents
};

/**
 * Creates a new event in the user's primary Google Calendar.
 * @param {object} eventData - An event resource object.
 * @returns {Promise<object>} A promise that resolves with the created event object.
 */
const createCalendarEvent = async (eventData) => {
    try {
        const response = await gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': eventData
        });
        console.log("Event created:", response.result);
        return response.result;
    } catch (error) {
        console.error("Error creating event:", error);
        alert("Could not create the event in Google Calendar.");
        return null;
    }
};

/**
 * Updates an existing event in the user's primary Google Calendar.
 * @param {string} eventId - The ID of the event to update.
 * @param {object} eventData - The updated event resource object.
 * @returns {Promise<object>} A promise that resolves with the updated event object.
 */
const updateCalendarEvent = async (eventId, eventData) => {
    try {
        const response = await gapi.client.calendar.events.update({
            'calendarId': 'primary',
            'eventId': eventId,
            'resource': eventData
        });
        console.log("Event updated:", response.result);
        return response.result;
    } catch (error) {
        console.error("Error updating event:", error);
        alert("Could not update the event in Google Calendar.");
        return null;
    }
};

/**
 * Deletes an event from the user's primary Google Calendar.
 * @param {string} eventId - The ID of the event to delete.
 */
const deleteCalendarEvent = async (eventId) => {
    try {
        await gapi.client.calendar.events.delete({
            'calendarId': 'primary',
            'eventId': eventId
        });
        console.log("Event deleted.");
        return true;
    } catch (error) {
        console.error("Error deleting event:", error);
        alert("Could not delete the event from Google Calendar.");
        return false;
    }
};

// Expose the new functions by updating the window.googleCalendar object
window.googleCalendar = {
    initGoogleClient,
    fetchCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent
};


// syntax for calendar
// const eventResource = {
//     'summary': 'Meeting with Team',
//     'location': 'Online',
//     'description': 'A quick sync to discuss project milestones.',
//     'start': {
//         'dateTime': '2025-07-22T09:00:00', // Use ISO 8601 format
//         'timeZone': 'Australia/Sydney',
//     },
//     'end': {
//         'dateTime': '2025-07-22T10:00:00',
//         'timeZone': 'Australia/Sydney',
//     }
// };