// Initialize or load users from localStorage
let users = JSON.parse(localStorage.getItem("users")) || {
    Executive_Eagle: { password: "341479", role: "admin" },
    Test: { password: "Employee123", role: "employee" }
};

// Save users to localStorage to persist changes
if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(users));
}

// Initialize pending users if not exists
if (!localStorage.getItem("pendingUsers")) {
    localStorage.setItem("pendingUsers", JSON.stringify([]));
}

// Check for announcements updates every 10 seconds
const ANNOUNCEMENT_CHECK_INTERVAL = 10000; // 10 seconds
let lastAnnouncementTimestamp = Date.now();

// Toggle between login and signup forms
function toggleForms() {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    
    if (loginForm && signupForm) {
        if (loginForm.style.display === "none") {
            loginForm.style.display = "block";
            signupForm.style.display = "none";
        } else {
            loginForm.style.display = "none";
            signupForm.style.display = "block";
        }
    }
}

// Signup Function
function signup() {
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const messageElement = document.getElementById("signup-message");
    
    // Basic validation
    if (!username || !password) {
        messageElement.textContent = "Username and password are required!";
        return;
    }
    
    if (password !== confirmPassword) {
        messageElement.textContent = "Passwords do not match!";
        return;
    }
    
    // Load latest users list
    users = JSON.parse(localStorage.getItem("users")) || {};
    
    if (users[username]) {
        messageElement.textContent = "Username already exists!";
        return;
    }
    
    // Add to pending users
    let pendingUsers = JSON.parse(localStorage.getItem("pendingUsers")) || [];
    pendingUsers.push({ username, password });
    localStorage.setItem("pendingUsers", JSON.stringify(pendingUsers));
    
    messageElement.textContent = "Sign-up request submitted! Waiting for admin approval.";
    
    // Clear form
    document.getElementById("new-username").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
}

// Login System
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    // Get latest users list
    users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[username] && users[username].password === password) {
        localStorage.setItem("currentUser", username);
        localStorage.setItem("userRole", users[username].role);
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("message").textContent = "Invalid login!";
    }
}

// Logout Function
function logout() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
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
        const newAnnouncement = {
            text: announcement,
            timestamp: new Date().toLocaleString(),
            date: Date.now(), // For sorting and comparing
            author: localStorage.getItem("currentUser") || "Unknown"
        };
        announcements.push(newAnnouncement);
        localStorage.setItem("announcements", JSON.stringify(announcements));
        loadAnnouncements();
        loadAnnouncementsBanner();
        document.getElementById("new-announcement").value = "";
        lastAnnouncementTimestamp = Date.now();
    }
}

// Load & Display Announcements with Delete Option
function loadAnnouncements() {
    const list = document.getElementById("announcement-list");
    if (list) {
        list.innerHTML = "";
        let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
        announcements.forEach((announcement, index) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${announcement.author}</strong> (${announcement.timestamp}): ${announcement.text}`;

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
    loadAnnouncementsBanner();
    lastAnnouncementTimestamp = Date.now();
}

// Load Announcements Banner for display across the site
function loadAnnouncementsBanner() {
    const banner = document.getElementById("announcements-banner");
    if (banner) {
        banner.innerHTML = "";
        let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
        
        if (announcements.length > 0) {
            // Display the most recent announcement in the banner
            const latest = announcements[announcements.length - 1];
            banner.textContent = `📢 ${latest.text} - ${latest.author}`;
            banner.style.display = "block";
        } else {
            banner.style.display = "none";
        }
    }
}

// Check for new announcements regularly (cross-device)
function checkForAnnouncementUpdates() {
    // Load the current announcements
    let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
    
    if (announcements.length > 0) {
        const latestAnnouncement = announcements[announcements.length - 1];
        
        // If there's a newer announcement than what we last saw
        if (latestAnnouncement.date > lastAnnouncementTimestamp) {
            lastAnnouncementTimestamp = latestAnnouncement.date;
            loadAnnouncementsBanner();
            if (document.getElementById("announcement-list")) {
                loadAnnouncements();
            }
        }
    }
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
    const user = localStorage.getItem("currentUser") || "Unknown";
    const timestamp = new Date().toLocaleString();
    logs.push(`${user} (${timestamp}): ${logEntry}`);
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

// Load Pending Users for Admin Approval
function loadPendingUsers() {
    const list = document.getElementById("pending-users-list");
    if (list) {
        list.innerHTML = "";
        let pendingUsers = JSON.parse(localStorage.getItem("pendingUsers")) || [];
        
        if (pendingUsers.length === 0) {
            const li = document.createElement("li");
            li.textContent = "No pending user approvals.";
            list.appendChild(li);
            return;
        }
        
        pendingUsers.forEach((user, index) => {
            const li = document.createElement("li");
            li.textContent = user.username;
            
            // Add approve and deny buttons
            const approveBtn = document.createElement("button");
            approveBtn.textContent = "✅ Approve";
            approveBtn.className = "approve-btn";
            approveBtn.onclick = function() { approveUser(index); };
            
            const denyBtn = document.createElement("button");
            denyBtn.textContent = "❌ Deny";
            denyBtn.className = "deny-btn";
            denyBtn.onclick = function() { denyUser(index); };
            
            const buttonDiv = document.createElement("div");
            buttonDiv.appendChild(approveBtn);
            buttonDiv.appendChild(denyBtn);
            li.appendChild(buttonDiv);
            
            list.appendChild(li);
        });
    }
}

// Approve User
function approveUser(index) {
    let pendingUsers = JSON.parse(localStorage.getItem("pendingUsers")) || [];
    const user = pendingUsers[index];
    
    // Get latest users list
    users = JSON.parse(localStorage.getItem("users")) || {};
    
    // Add to users object and save to localStorage
    users[user.username] = { password: user.password, role: "employee" };
    localStorage.setItem("users", JSON.stringify(users));
    
    // Remove from pending users
    pendingUsers.splice(index, 1);
    localStorage.setItem("pendingUsers", JSON.stringify(pendingUsers));
    
    // Log the approval
    saveActivity(`Approved new user: ${user.username}`);
    
    // Reload the list
    loadPendingUsers();
    loadUserManagement();
    
    alert(`User ${user.username} has been approved!`);
}

// Deny User
function denyUser(index) {
    let pendingUsers = JSON.parse(localStorage.getItem("pendingUsers")) || [];
    const username = pendingUsers[index].username;
    
    // Remove from pending users
    pendingUsers.splice(index, 1);
    localStorage.setItem("pendingUsers", JSON.stringify(pendingUsers));
    
    // Log the denial
    saveActivity(`Denied user request: ${username}`);
    
    // Reload the list
    loadPendingUsers();
    
    alert(`User request for ${username} has been denied.`);
}

// Load User Management (Admin Only)
function loadUserManagement() {
    const list = document.getElementById("user-management-list");
    if (list) {
        list.innerHTML = "";
        
        // Get latest users data
        users = JSON.parse(localStorage.getItem("users")) || {};
        
        Object.entries(users).forEach(([username, userData]) => {
            const li = document.createElement("li");
            li.innerHTML = `<div><strong>${username}</strong> (${userData.role})</div>`;
            
            // Control buttons div
            const controlsDiv = document.createElement("div");
            
            // Skip delete/role changes for current user
            if (username !== localStorage.getItem("currentUser")) {
                // Add role toggle button
                const roleBtn = document.createElement("button");
                roleBtn.textContent = userData.role === "admin" ? "👨‍💼 Make Employee" : "🛡️ Make Admin";
                roleBtn.className = "role-btn";
                roleBtn.onclick = function() { toggleUserRole(username); };
                
                // Add delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "❌ Delete";
                deleteBtn.className = "deny-btn";
                deleteBtn.onclick = function() { deleteUser(username); };
                
                controlsDiv.appendChild(roleBtn);
                controlsDiv.appendChild(deleteBtn);
            } else {
                // Current user indicator
                const currentLabel = document.createElement("span");
                currentLabel.textContent = "Current User";
                currentLabel.className = "current-user-label";
                controlsDiv.appendChild(currentLabel);
            }
            
            li.appendChild(controlsDiv);
            list.appendChild(li);
        });
    }
}

// Add New User (Admin Function)
function addNewUser() {
    const username = document.getElementById("add-username").value;
    const password = document.getElementById("add-password").value;
    const role = document.getElementById("add-role").value;
    
    if (!username || !password) {
        alert("Username and password are required!");
        return;
    }
    
    // Get latest users data
    users = JSON.parse(localStorage.getItem("users")) || {};
    
    if (users[username]) {
        alert("Username already exists!");
        return;
    }
    
    // Add new user
    users[username] = { password, role };
    localStorage.setItem("users", JSON.stringify(users));
    
    // Log the addition
    saveActivity(`Added new user: ${username} with role: ${role}`);
    
    // Clear form and reload list
    document.getElementById("add-username").value = "";
    document.getElementById("add-password").value = "";
    loadUserManagement();
    
    alert(`User ${username} has been added successfully!`);
}

// Toggle User Role (Admin/Employee)
function toggleUserRole(username) {
    // Get latest users data
    users = JSON.parse(localStorage.getItem("users")) || {};
    
    if (users[username]) {
        // Toggle role
        const newRole = users[username].role === "admin" ? "employee" : "admin";
        users[username].role = newRole;
        localStorage.setItem("users", JSON.stringify(users));
        
        // Log the change
        saveActivity(`Changed role for user: ${username} to ${newRole}`);
        
        // Reload the list
        loadUserManagement();
        
        alert(`User ${username} is now an ${newRole}.`);
    }
}

// Delete User
function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user ${username}?`)) {
        // Get latest users data
        users = JSON.parse(localStorage.getItem("users")) || {};
        
        // Delete the user
        delete users[username];
        localStorage.setItem("users", JSON.stringify(users));
        
        // Log the deletion
        saveActivity(`Deleted user: ${username}`);
        
        // Reload the list
        loadUserManagement();
        
        alert(`User ${username} has been deleted.`);
    }
}

// Check User Permissions and Update UI
function checkPermissions() {
    const userRole = localStorage.getItem("userRole");
    
    // Hide admin-only elements for non-admin users
    if (userRole !== "admin") {
        // Hide admin-only buttons
        const adminElements = [
            "admin-logs-btn", 
            "pending-users-btn",
            "user-management-btn"
        ];
        
        adminElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = "none";
        });
    }
}

// Start announcement checking interval
let announcementCheckInterval;

// Ensure Data Loads When Dashboard Opens
window.onload = function() {
    // Load initial data
    loadAnnouncementsBanner();
    
    // Set up cross-device announcement checking
    clearInterval(announcementCheckInterval);
    announcementCheckInterval = setInterval(checkForAnnouncementUpdates, ANNOUNCEMENT_CHECK_INTERVAL);
    
    // Load page-specific elements
    if (window.location.href.includes("dashboard.html")) {
        loadAnnouncements();
        loadActivityLogs();
        loadPendingUsers();
        loadUserManagement();
        checkPermissions();
        
        // Show announcements tab by default
        showTab("announcements");
    }
};
