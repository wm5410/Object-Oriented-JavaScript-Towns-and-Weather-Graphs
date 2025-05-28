/////////////////////////////////////Get Towns/////////////////////////////////////

// Create instance
let request = new XMLHttpRequest();

// Function to send Ajax request to get data from SQL table
let getDataAjax = () => {
    let url = "fetchTown.php";

    request.onload = displayData;
    request.onerror = handleError;
    request.open("GET", url);
    request.send();
}

// Function to display data on the page as a dropdown
let displayData = () => {
    let response = request.responseText;
    let dropdown = document.getElementById("towns-dropdown");
    try {
        const jsonData = JSON.parse(response);
        //Storing Data in an Array of Object Literals
        townsArray = jsonData; 
        
        //The array of town objects is sorted alphabetically by town name.
        townsArray.sort((a, b) => a.name.localeCompare(b.name));

        // Clear existing options
        dropdown.innerHTML = '';

        // Add default option as the first item
        let defaultOption = document.createElement('option');
        defaultOption.textContent = "Add town widget";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        dropdown.appendChild(defaultOption);

        // Iterate through the sorted array and populate the dropdown
        townsArray.forEach(town => {
            let option = document.createElement('option');
            option.value = town.id; //Orderof the dropdown
            option.textContent = town.name;
            option.setAttribute('data-lat', town.lat);
            option.setAttribute('data-lon', town.lon);
            option.setAttribute('data-info', town.info);
            dropdown.appendChild(option);
        });

        // Add event listener to the dropdown to call a function when the user selects an option
        dropdown.addEventListener('change', function() {
            let selectedOption = this.options[this.selectedIndex];
            let townId = selectedOption.value;
            let lat = selectedOption.getAttribute('data-lat');
            let lon = selectedOption.getAttribute('data-lon');
            let name = selectedOption.textContent;
            let info = selectedOption.getAttribute('data-info');
            handleTownSelection(townId, lat, lon, name, info);
        });

    } catch (error) {
        console.error("Error parsing JSON:", error);
    }
}

// Error handling
let handleError = () => {
    console.error("Could not retrieve data.");
}


////////////////////////////Widgets////////////////////////////////////////


//Create the widget object from the selected town
function handleTownSelection(townId, lat, lon, name, info) {
    const townWidget = new TownWidget(townId, lat, lon, name, info);
    townWidget.init(); //Initalise the constructor
}

// Constructor function for creating town widgets
function TownWidget(townId, lat, lon, name, info) {
    this.townId = townId;
    this.lat = lat;
    this.lon = lon;
    this.name = name;
    this.info = info;

    this.init = function() {
        const dashboard = document.getElementById('dashboard');
        if (document.getElementById(`widget-${this.townId}`)) {
            console.log('Widget for this town already exists.');
            return;
        }

        //HTML elements for the widget
        const widget = document.createElement('div');
        widget.id = `widget-${this.townId}`;
        widget.className = 'town-widget';
        widget.innerHTML = `
        <h3>${this.name}</h3>  
        <p>Latitude: ${this.lat}, Longitude: ${this.lon}</p>
        <p>${this.info}</p> 
        <button onclick="singleGraph('${this.townId}', '${this.lat}', '${this.lon}', '${this.name}')">Show Weather</button>
        <br><br>
        <button onclick="removeWidget('${this.townId}')">Remove</button>
        <br><br>
        <input type="checkbox" id="compare-${this.townId}" class="compare-checkbox" data-town-id="${this.townId}" data-town-name="${this.name}" data-lat="${this.lat}" data-lon="${this.lon}">
        <label for="compare-${this.townId}">Compare</label>
        `;        
        
        dashboard.appendChild(widget);
    };
}

//Funcionality for Remove button
function removeWidget(townId) {
    const widgetToRemove = document.getElementById(`widget-${townId}`);
    if (widgetToRemove) {
        widgetToRemove.parentNode.removeChild(widgetToRemove);
        console.log(`Removed widget for Town ID: ${townId}`);
    }
}


/////////////////////Graphs/////////////////////////////////


//Funcionality for Show Weather button
async function singleGraph(townId, lat, lon, name) {
    try {
        const data = await fetchWeatherData(townId, lat, lon);

         //FOR TESTING PORPOSES
        // const data = townOneData;

        //Create a single town graph
        renderWeatherChart(data, name);
    } catch (error) {
        console.error('Error fetching or processing weather data:', error);
    }
}

//Getting weather data from a specified town
function fetchWeatherData(townId, lat, lon) {
    const apiKey = 'oyHAJWhdnKpPcCZNUnkZb52x5bBwQYzc';
    const apiUrl = `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=${apiKey}`;

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .catch(error => {
            alert('The API did not return properly');
            throw error;
        });
}

let myChart; // Global variable to hold the chart instance

function renderWeatherChart(weatherDatas, name) {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    
    // Check if the input is an array of datasets or a single dataset
    if (!Array.isArray(weatherDatas)) {
        weatherDatas = [weatherDatas];  // Convert single dataset to array for uniform processing
    }
        const labels = weatherDatas[0].timelines.hourly.map(hour => new Date(hour.time).toLocaleTimeString()); // Use the first dataset for labels
        const datasets = weatherDatas.map((weatherData, index) => {
        const temperatureData = weatherData.timelines.hourly.map(hour => hour.values.temperature);

        return {
            label: name, 
            data: temperatureData,
            borderColor: `rgb(255, ${99 + index * 50}, 132)`, // Change color dynamically
            backgroundColor: `rgba(255, ${99 + index * 50}, 132, 0.5)`,
            yAxisID: 'y',
        };
    });

    const data = {
        labels: labels,
        datasets: datasets
    };

    if (myChart) {
        // Update existing chart
        myChart.data.labels = labels;
        myChart.data.datasets = datasets;
        myChart.update();
    } else {
        // Create a new chart instance if it does not exist
        const config = {
            type: 'line',
            data: data,
            options: {
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                    }
                },
                animation: {
                    duration: 1000
                }
            }
        };
        // Create the chart
        myChart = new Chart(ctx, config);
    }
}


//////////////////////////////COMPARISON//////////////////////////////////////


document.addEventListener('DOMContentLoaded', function() {
    const compareButton = document.getElementById('compare');
    if (compareButton) {
        compareButton.addEventListener('click', async function() {
            const checkboxes = document.querySelectorAll('.compare-checkbox:checked');
            if (checkboxes.length < 2) {
                alert('Please select at least two towns to compare.');
                return;
            }

            // Collect all weather data promises, now also capturing town names
            let weatherPromises = Array.from(checkboxes).map(checkbox => {
                const townId = checkbox.getAttribute('data-town-id');
                const townName = checkbox.getAttribute('data-town-name');
                const lat = checkbox.getAttribute('data-lat');
                const lon = checkbox.getAttribute('data-lon');
                
                return fetchWeatherData(townId, lat, lon).then(weatherData => {
                    return { townName, weatherData };  // Bundle the townName with the fetched weather data
                });
            });

            try {
                const results = await Promise.all(weatherPromises);
                renderComparisonChart(results); 
            } catch (error) {
                console.error('Error fetching weather data for comparison:', error);
            }
        });
    } else {
        console.error('Comparison button not found!');
    }
});

function renderComparisonChart(weatherDatas) {
    const ctx = document.getElementById('weatherChart').getContext('2d');

    // If a chart already exists, destroy it to prepare for a new one
    if (myChart) {
        myChart.destroy();
    }

    // Prepare the labels and datasets for multiple towns
    const name = weatherDatas[0].weatherData.timelines.hourly.map(hour => new Date(hour.time).toLocaleTimeString()); 
    const datasets = weatherDatas.map((dataObj, index) => {
    const temperatureData = dataObj.weatherData.timelines.hourly.map(hour => hour.values.temperature);
        return {
            label: `${dataObj.townName}`,
            data: temperatureData,
            borderColor: `rgb(255, ${99 + index * 50}, 132)`, // Change color dynamically
            backgroundColor: `rgba(255, ${99 + index * 50}, 132, 0.5)`,
            yAxisID: 'y',
        };
    });

    // Configuration for the chart
    const data = {
        labels: name,
        datasets: datasets
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                }
            },
            animation: {
                duration: 1000
            }
        }
    };

    // Create the chart
    myChart = new Chart(ctx, config);
}
