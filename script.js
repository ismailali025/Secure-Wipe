const SERVER_URL = "https://certiwipe-backend.onrender.com"; // Your deployed server URL
const POLLING_INTERVAL = 3000;

// Global variables to control the connection state
let isConnected = false;
let pollingId = null; 

// References to HTML elements
const connectButton = document.getElementById('connect-button');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const deviceList = document.getElementById('device-list');

// Function to fetch device data from the backend
async function fetchDevices() {
    try {
        const response = await fetch(`${SERVER_URL}/api/devices`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const devices = await response.json();
        updateDeviceList(devices);
        updateConnectionStatus(true);
    } catch (error) {
        console.error("Could not fetch devices:", error);
        deviceList.innerHTML = '<p class="loading" style="color: #e53935;">Connection to backend failed. Check if the server is running.</p>';
        stopPolling();
    }
}

// Function to update the HTML with the latest device list
function updateDeviceList(devices) {
    if (Object.keys(devices).length === 0) {
        deviceList.innerHTML = '<p class="loading">Connected. Waiting for agents to register...</p>';
        return;
    }
    deviceList.innerHTML = ''; 

    for (const machineId in devices) {
        const device = devices[machineId];
        let statusClass = (device.status || '').toLowerCase();

        const deviceCard = document.createElement('div');
        deviceCard.className = 'device-card';
        deviceCard.innerHTML = `
            <div class="device-info">
                <h3>${machineId}</h3>
                <p>Status: <span class="status ${statusClass}">${device.status || 'Unknown'}</span></p>
                <p>Last Seen: ${new Date(device.last_seen).toLocaleString()}</p>
            </div>
            <button class="wipe-button" onclick="triggerWipe('${machineId}')">WIPE</button>
        `;
        deviceList.appendChild(deviceCard);
    }
}

// Function called when the 'WIPE' button is clicked
async function triggerWipe(machineId) {
    if (!isConnected) {
        alert("You must be connected to the server to issue a wipe command.");
        return;
    }
    const confirmation = confirm(`ARE YOU ABSOLUTELY SURE?\n\nThis will permanently erase data on machine: ${machineId}`);
    
    if (confirmation) {
        try {
            const response = await fetch(`${SERVER_URL}/api/wipe/${machineId}`, { method: 'POST' });
            if (!response.ok) throw new Error("Failed to issue wipe command.");
            alert("Wipe command issued successfully! The agent will execute on its next check-in.");
            fetchDevices();
        } catch (error) {
            console.error("Wipe command error:", error);
            alert("Error: Could not issue wipe command.");
        }
    }
}

// Functions to manage the connection
function startPolling() {
    isConnected = true;
    updateConnectionStatus(true, "Connecting...");
    fetchDevices(); 
    pollingId = setInterval(fetchDevices, POLLING_INTERVAL);
}

function stopPolling() {
    isConnected = false;
    clearInterval(pollingId); 
    updateConnectionStatus(false);
    deviceList.innerHTML = '<p class="loading">Press "Connect" to fetch agent status.</p>';
}

function updateConnectionStatus(connected, text = null) {
    if (connected) {
        statusText.textContent = text || 'Connected';
        statusIndicator.className = 'status-light connected';
        connectButton.textContent = 'Disconnect';
        connectButton.classList.add('active');
    } else {
        statusText.textContent = 'Disconnected';
        statusIndicator.className = 'status-light disconnected';
        connectButton.textContent = 'Connect';
        connectButton.classList.remove('active');
    }
}

connectButton.addEventListener('click', () => {
    if (isConnected) {
        stopPolling();
    } else {
        startPolling();
    }
});