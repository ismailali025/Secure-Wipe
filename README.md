SecureWipe 🛡️

Secure Data Wiping for a Trustworthy IT Asset Circular Economy.

A project by Team CodeHex for the Smart India Hackathon 2025.

Introduction
India's escalating e-waste crisis, intensified by data security fears, hinders IT asset recycling and locks away significant economic value. SecureWipe offers a robust solution: a USB-driven tool utilizing a lightweight OS and Python scripts to perform strong, NIST-compliant data erasure by overwriting device storage. To ensure complete trust and compliance, it generates a verifiable status report. This user-friendly, plug-and-play system builds confidence among individuals and enterprises, promoting the responsible disposal and reuse of electronics.

Live Demo
Here is the complete end-to-end flow of SecureWipe in action:

Check out the live project:
Frontend Dashboard: https://secur-ewipe.vercel.app/
Backend Server: https://securewipe-backend.onrender.com/

✨ Key Features
Remote Wipe Command: Trigger a secure data wipe from a simple, elegant web dashboard.
USB-Driven Agent: A bootable Linux agent (using Linux Mint) bypasses the host OS for direct hardware access.
NIST-Compliant Erasure: Uses the shred utility to perform overwrites, making data forensically unrecoverable.
Light/Dark Mode: A sleek, user-friendly interface with a theme toggle.
Multi-Page Experience: A complete landing page, dashboard, and "How It Works" section.
Scalable Architecture: Deployed on modern cloud platforms (Vercel & Render) for reliability.

⚙️ How It Works
The SecureWipe process is designed for simplicity and security.
Boot from USB: The target computer is booted from a pendrive running a live Linux OS.
Run the Agent: A Python script (wipe_agent.py) is executed from the terminal.
Register with Server: The agent sends its unique machine ID to the backend server to register itself.
View on Dashboard: The device instantly appears on the SecureWipe web dashboard.
Issue Wipe Command: The administrator clicks the "WIPE" button for the target device on the dashboard.
Execute & Confirm: The agent receives the command on its next poll, executes the shred command on the target file/drive, and reports the completion status back to the server.

💻 Technology Stack
Frontend: HTML5, CSS3, JavaScript (ES6), TailwindCSS, Vercel
Backend: Python, Flask, Render
Wipe Agent: Python (requests, subprocess), Linux Mint, shred
Version Control: Git & GitHub

🚀 Getting Started
To run this project locally, follow these steps:
Prerequisites
Python 3.8+ and pip
A bootable Linux Mint USB drive
Git
Backend Setup

Clone the repository:
git clone [https://github.com/your-username/securewipe.git](https://github.com/your-username/securewipe.git)
cd securewipe/backend

Install dependencies:
pip install -r requirements.txt
Run the server:
python server.py
The server will be running on http://127.0.0.1:5000.

Frontend Usage
Simply open the index.html file from the frontend folder in your browser, or visit the deployed Vercel link.
Update the SERVER_URL in script.js to your local address if you are not using the deployed backend.
Agent Setup
Boot the target computer using your Linux Mint USB.
Open a Terminal and navigate to the agent folder.

Create a test file to wipe:
echo "This is a test file for SecureWipe" > wipe_me.txt

Run the agent:
python3 wipe_agent.py

🏆 Project Context
This project was developed by Team CodeHex as a submission for the Smart India Hackathon 2025. Our goal was to address the critical need for secure data sanitization to promote a safe and sustainable circular economy for IT assets in India.

👥 Team Members
Ismail (Team Lead)
Khader
Hyder
Ather
Shreya
Alia

📄 License
This project is licensed under the MIT License - see the LICENSE.md file for details.
