document.addEventListener('DOMContentLoaded', () => {
    // --- All Elements ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');
    const connectButton = document.getElementById('connect-button');
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const deviceList = document.getElementById('device-list');

    // --- State & Config ---
    const SERVER_URL = "https://securewipe-backend.onrender.com";
    const POLLING_INTERVAL = 3000;
    let isConnected = false;
    let pollingId = null;

    // --- Page Navigation Logic ---
    const showPage = (pageId) => {
        pages.forEach(page => page.classList.toggle('page-hidden', page.id !== `page-${pageId}`));
        window.scrollTo(0, 0);
        if (pageId !== 'dashboard' && isConnected) {
            stopPolling();
        }
    };
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.dataset.page);
        });
    });

    // --- Theme Toggle Logic (Defaults to LIGHT) ---
    const applyTheme = (isDark) => {
        if (isDark) {
            document.body.classList.remove('light-mode');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.add('light-mode');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
            localStorage.setItem('theme', 'light');
        }
    };
    themeToggleButton.addEventListener('click', () => applyTheme(document.body.classList.contains('light-mode')));
    const savedTheme = localStorage.getItem('theme');
    applyTheme(savedTheme === 'dark'); // Load saved theme, or default to light if 'dark' is not saved

    // --- Your Dashboard Functions ---
    async function fetchDevices() {
        try {
            const response = await fetch(`${SERVER_URL}/api/devices`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const devices = await response.json();
            updateDeviceList(devices);
            updateConnectionStatus(true);
        } catch (error) {
            console.error("Could not fetch devices:", error);
            deviceList.innerHTML = `<p class="loading" style="color: #ef4444;">Connection to backend failed. Is the server running?</p>`;
            stopPolling();
        }
    }

    function updateDeviceList(devices) {
        if (Object.keys(devices).length === 0) {
            deviceList.innerHTML = `<p class="loading">Connected. Waiting for agents to register...</p>`;
            return;
        }
        deviceList.innerHTML = ''; 
        for (const machineId in devices) {
            const device = devices[machineId];
            let statusClass = (device.status || '').toLowerCase().split(':')[0]; // Get base status like 'completed'
            const deviceCard = document.createElement('div');
            // ADDED dashboard-card class for hover effect
            deviceCard.className = 'device-card dashboard-card';
            deviceCard.innerHTML = `
                <div class="device-info">
                    <h3>${machineId}</h3>
                    <p class="text-sm">Status: <span class="status ${statusClass}">${device.status || 'Unknown'}</span></p>
                    <p class="text-xs">Last Seen: ${new Date(device.last_seen).toLocaleString()}</p>
                </div>
                <button class="wipe-button" onclick="triggerWipe('${machineId}')">WIPE</button>`;
            deviceList.appendChild(deviceCard);
        }
    }

    window.triggerWipe = async function(machineId) {
        if (!isConnected) {
            alert("You must be connected to the server to issue a wipe command.");
            return;
        }
        if (confirm(`ARE YOU ABSOLUTELY SURE?\n\nThis will issue a WIPE command to: ${machineId}`)) {
            try {
                await fetch(`${SERVER_URL}/api/wipe/${machineId}`, { method: 'POST' });
                alert("Wipe command issued successfully!");
                fetchDevices();
            } catch (error) {
                alert("Error: Could not issue wipe command.");
            }
        }
    }

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
        deviceList.innerHTML = `<p class="loading">Press "Connect" to fetch agent status.</p>`;
    }

    function updateConnectionStatus(connected, text = null) {
        statusText.textContent = text || (connected ? 'Connected' : 'Disconnected');
        statusIndicator.className = `status-light ${connected ? 'connected' : 'disconnected'}`;
        connectButton.textContent = connected ? 'Disconnect' : 'Connect';
        connectButton.classList.toggle('active', connected);
    }

    connectButton.addEventListener('click', () => {
        if (isConnected) stopPolling();
        else startPolling();
    });

    // --- Initial Page Load ---
    showPage('home');
});