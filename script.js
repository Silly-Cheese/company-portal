// Hardcoded Users (Admins and Employees)
const users = {
    Executive_Eagle: { password: "341479", role: "admin" },
    Test: { password: "Employee123", role: "employee" },
    Seak: { password: "Freaky", role: "admin"}
};

// Login System
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (users[username] && users[username].password === password) {
        localStorage.setItem("userRole", users[username].role);
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("message").textContent = "Invalid login!";
    }
}

// Logout Function
function logout() {
    localStorage.removeItem("userRole");
    window.location.href = "index.html";
}

// Tabs System
function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.style.display = "none";
    });
    document.getElementById(tabId).style.display = "block";
}

// Save & Load Announcements
function postAnnouncement() {
    const announcement = document.getElementById("new-announcement").value;
    if (announcement) {
        let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
        announcements.push(announcement);
        localStorage.setItem("announcements", JSON.stringify(announcements));
        loadAnnouncements();
        document.getElementById("new-announcement").value = "";
    }
}

// Load & Display Announcements with Delete Option
function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    if (list) {
        list.innerHTML = "";
        let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
        announcements.forEach((text, index) => {
            const li = document.createElement("li");
            li.textContent = text;

            // Add delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "❌";
            deleteBtn.onclick = function() { deleteAnnouncement(index); };
            li.appendChild(deleteBtn);

            list.appendChild(li);
        });
    }
}

// Delete Announcement
function deleteAnnouncement(index) {
    let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
    announcements.splice(index, 1);
    localStorage.setItem("announcements", JSON.stringify(announcements));
    loadAnnouncements();
}

// Log Activity Function (Prompts Based on Selection)
function logActivity() {
    const game = prompt("Select the game:\n1. Training Center\n2. Main Game");

    if (game === "1") {
        const staffTraining = confirm("Were you part of a staff group that hosted and trained?");
        saveActivity(`Training Center - Staff Training: ${staffTraining ? "Yes" : "No"}`);
    } else if (game === "2") {
        const observationHeld = confirm("Was an observation held?");
        if (observationHeld) {
            const duration = prompt("How long was the observation? (in minutes)");
            saveActivity(`Main Game - Observation Held: Yes, Duration: ${duration} min`);
        } else {
            saveActivity("Main Game - Observation Held: No");
        }
    } else {
        alert("Invalid selection.");
    }
}

// Save Activity Log
function saveActivity(logEntry) {
    let logs = JSON.parse(localStorage.getItem("activityLogs")) || [];
    logs.push(logEntry);
    localStorage.setItem("activityLogs", JSON.stringify(logs));
    alert("Activity logged successfully!");
}

// Load Activity Logs for Admins
function loadActivityLogs() {
    const list = document.getElementById("activity-log-list");
    if (list) {
        list.innerHTML = "";
        let logs = JSON.parse(localStorage.getItem("activityLogs")) || [];
        logs.forEach(text => {
            const li = document.createElement("li");
            li.textContent = text;
            list.appendChild(li);
        });
    }
}

// Ensure Data Loads When Dashboard Opens
window.onload = function() {
    loadAnnouncements();
    loadActivityLogs();
};
