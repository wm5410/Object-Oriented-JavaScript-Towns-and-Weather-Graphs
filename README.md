# Object-Oriented JavaScript: Towns and Weather Graphs

This web application provides an interactive page for viewing information about New Zealand towns and generating weather graphs for selected towns. It utilizes JavaScript web page components (widgets) and object-oriented programming principles.

## Features:

* **Town Widgets:** Users can select towns from a dropdown list, which adds a "town widget" to a dashboard. Each widget displays information about the selected town.
* **Weather Graphs:**
    * Widgets include UI elements to request a graph of recent weather for that town.
    * Clicking a graph button displays temperatures for the last 24 hours for the selected town.
    * The canvas is cleared and replaced with a new graph each time a different town graph is selected.
* **Comparison Graphs:** Users can select a "Comparison Graph" option to choose two (or more) currently displayed towns to create a combined weather graph.
* **Widget Management:** Users can add and remove as many widgets as desired (maximum of one per town).
* **Dynamic Content:** Multiple widgets can be displayed on the page simultaneously.

## Technologies Used:

* HTML (without inline formatting, well-formed tags)
* Cascading Style Sheets (CSS)
* JavaScript (object-oriented style, DHTML)
* Asynchronous requests to a server-side database and external APIs
* PHP (for database queries)
* Chart.js (external JavaScript library for graph functions)
* app.tomorrow.io (external API for historical weather data)

## Setup:

1.  **MySQL Database:** Import the provided `towns.sql` file into your database to create a table of town information.
2.  **Tomorrow.io API Key:** Register for a free API key at [https://docs.tomorrow.io/reference/historical](https://docs.tomorrow.io/reference/historical). Be aware of the free key's request restrictions (25 per hour, 500 per day). It's recommended to use the provided `townOneData.js` and `townTwoData.js` files during development and switch to live requests later.
3.  **Code Structure:** All application files should be within a directory named `compx322assn2` inside your `course_html` directory.

## Development Notes:

* **Page Load:** When the HTML page loads, it displays an empty canvas element and a dropdown list of towns populated from an SQL query.
* **Town Data Handling:** An asynchronous request is made to the town database table to get all town information. The returned data must be stored client-side in an Array of object literals (one for each town). This array is then sorted alphabetically by town name to populate the dropdown list.
* **Town Widget Implementation:** The Town widget must be implemented as a JavaScript object using a constructor function. This function will include town data and construct the necessary page elements and UI elements (buttons, etc.).
* **Weather Data Retrieval:** Asynchronous requests are used to retrieve hourly weather history for the last 24 hours from app.tomorrow.io for selected towns.
* **Graph Creation:** Methods are needed to create individual and combined line graphs from the weather data using the Chart.js library, displayed in the canvas element.
