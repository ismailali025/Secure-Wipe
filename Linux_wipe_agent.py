import requests # pyright: ignore[reportMissingModuleSource]
import uuid
import time
import subprocess
import json
import os

# --- CONFIGURATION ---
# The Backend Lead will provide this URL. For now, we use a placeholder.
SERVER_URL = "https://securewipe-backend.onrender.com/api" # Example: local Flask server
POLL_INTERVAL = 5 # Check for commands every 5 seconds

def phone_home():
    """Gets a unique machine ID and registers it with the server."""
    try:
        # Get the machine's MAC address as a unique ID
        machine_id = ':'.join(['{:02x}'.format((uuid.getnode() >> i) & 0xff) for i in range(0,8*6,8)][::-1])
        print(f"This machine's unique ID is: {machine_id}")
        
        print("Registering with the Secure Wipe server...")
        response = requests.post(f"{SERVER_URL}/agent/register", json={"machine_id": machine_id})
        
        if response.status_code == 200:
            print("Successfully registered with server.")
            return machine_id
        else:
            print(f"Error registering. Server responded with: {response.status_code}")
            return None
    except requests.exceptions.ConnectionError as e:
        print(f"FATAL: Could not connect to the server at {SERVER_URL}. Is it running?")
        return None

def listen_for_commands(machine_id):
    """Polls the server waiting for a 'wipe' command."""
    while True:
        print(f"Polling server for commands for machine {machine_id}...")
        try:
            response = requests.get(f"{SERVER_URL}/agent/{machine_id}/status")
            if response.status_code == 200:
                command = response.json().get("command")
                if command == "wipe":
                    print("WIPE COMMAND RECEIVED!")
                    target_drive = response.json().get("target_drive", "/dev/sda") # Default to /dev/sda if not specified
                    return target_drive # Exit the loop and return the drive to wipe
            else:
                print(f"Server returned status {response.status_code}. Retrying...")

        except requests.exceptions.ConnectionError:
            print("Connection to server lost. Retrying...")

        time.sleep(POLL_INTERVAL)

def find_drives():
    """Finds all physical storage drives on the system."""
    print("Finding storage drives...")
    try:
        result = subprocess.run(['lsblk', '-J', '-o', 'NAME,TYPE,SIZE,MODEL'], capture_output=True, text=True, check=True)
        drives = json.loads(result.stdout)
        physical_drives = [d for d in drives['blockdevices'] if d['type'] == 'disk']
        print(f"Found physical drives: {[d['name'] for d in physical_drives]}")
        return physical_drives
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Could not find drives. Make sure you are on a Linux system with 'lsblk' installed.")
        return []

def execute_wipe(target_drive_path):
    """Executes a secure wipe on the target path."""
    print(f"--- WARNING: PREPARING TO WIPE {target_drive_path} ---")

    # !! CRITICAL SAFETY CHECK FOR DEVELOPMENT !!
    # This prevents you from accidentally wiping your own computer.
    # For the demo, we will only allow wiping a file named 'dummy_disk.txt'.
    if "dummy_disk.txt" not in target_drive_path:
        print("SAFETY LOCK ENABLED: Aborting wipe. Target is not a safe test file.")
        # In a real scenario, you'd report this error back to the server.
        requests.post(f"{SERVER_URL}/agent/report_status", json={"status": "error", "message": "Safety Lock Enabled"})
        return False
        
    try:
        print("Starting wipe process...")
        # The actual wipe command. -v shows progress, -n 1 overwrites once.
        process = subprocess.run(['shred', '-v', '-n', '1', '-u', target_drive_path], check=True)
        print(f"SUCCESS: Successfully wiped {target_drive_path}")
        # Report completion back to the server
        requests.post(f"{SERVER_URL}/agent/report_status", json={"status": "completed", "drive": target_drive_path})
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(f"FATAL: Error during wipe process for {target_drive_path}")
        requests.post(f"{SERVER_URL}/agent/report_status", json={"status": "error", "message": "Shred command failed"})
        return False

# --- Main Execution Block ---
if __name__ == "__main__":
    machine_id = phone_home()
    
    if machine_id:
        target_drive_to_wipe = listen_for_commands(machine_id)
        
        # For the hackathon demo, we will ignore the server's target
        # and use a safe, local dummy file.
        print("DEMO MODE: Overriding target drive to a safe test file.")
        
        # Create a dummy file to test on:
        # In your terminal, run: `echo This is the main Document file > dummy_disk.txt`
        safe_test_target = "dummy_disk.txt"

        if os.path.exists(safe_test_target):
            execute_wipe(safe_test_target)
        else:
            print(f"FATAL: Test file '{safe_test_target}' not found.")
            print("Please create it by running: echo This is the main Document file > dummy_disk.txt")
