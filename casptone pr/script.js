// ================= LOGIN =================

const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "admin123") {

        loginPage.style.display = "none";
        dashboard.classList.add("show");

    } else {

        alert("Invalid username or password!");

    }

});


// ================= LOGOUT =================

document.getElementById("logoutBtn").addEventListener("click", function () {

    dashboard.classList.remove("show");
    loginPage.style.display = "flex";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

});


// ================= PAGE NAVIGATION =================

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(function (link) {

    link.addEventListener("click", function (e) {

        e.preventDefault();

        const pageId = this.getAttribute("data-page");

        showPage(pageId);

        // Close sidebar on mobile
        document.getElementById("sidebar").classList.remove("open");

    });

});


function showPage(pageId) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(function (page) {
        page.classList.remove("active-page");
    });

    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }


    // Navigation active state

    navLinks.forEach(function (link) {

        link.classList.remove("active");

        if (link.getAttribute("data-page") === pageId) {
            link.classList.add("active");
        }

    });


    // Change title

    const titles = {
        dashboardPage: "Dashboard",
        membersPage: "Members",
        membershipPage: "Membership",
        salesPage: "Sales",
        reportsPage: "Reports",
        settingsPage: "Settings"
    };

    document.getElementById("pageTitle").textContent =
        titles[pageId] || "Dashboard";

}


// ================= MOBILE SIDEBAR =================

document.getElementById("menuBtn").addEventListener("click", function () {

    document.getElementById("sidebar").classList.toggle("open");

});


// ================= ADD MEMBER MODAL =================

const modal = document.getElementById("memberModal");

document.getElementById("addMemberBtn").addEventListener("click", function () {

    modal.classList.add("show");

});


document.getElementById("closeModal").addEventListener("click", function () {

    modal.classList.remove("show");

});


document.getElementById("cancelModal").addEventListener("click", function () {

    modal.classList.remove("show");

});


// Close modal when clicking outside

modal.addEventListener("click", function (e) {

    if (e.target === modal) {
        modal.classList.remove("show");
    }

});


// ================= ADD MEMBER =================

document.getElementById("memberForm").addEventListener("submit", function (e) {

    e.preventDefault();

    const name = document.getElementById("newName").value;
    const email = document.getElementById("newEmail").value;
    const phone = document.getElementById("newPhone").value;
    const plan = document.getElementById("newPlan").value;


    const initials = name
        .split(" ")
        .map(word => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();


    const row = document.createElement("tr");

    row.innerHTML = `

        <td>
            <div class="member-info">

                <div class="avatar">
                    ${initials}
                </div>

                <div>
                    <strong>${name}</strong>
                    <small>${email}</small>
                </div>

            </div>
        </td>

        <td>${phone}</td>

        <td>${plan}</td>

        <td>New Member</td>

        <td>
            <span class="badge active-badge">
                Active
            </span>
        </td>

        <td>

            <button class="small-btn">
                View
            </button>

            <button class="delete-btn">
                Delete
            </button>

        </td>

    `;


    document
        .getElementById("membersTable")
        .appendChild(row);


    // Add delete function

    const deleteButton = row.querySelector(".delete-btn");

    deleteButton.addEventListener("click", function () {

        if (confirm("Delete this member?")) {

            row.remove();

            updateMemberCount();

        }

    });


    updateMemberCount();


    // Reset form

    document.getElementById("memberForm").reset();

    modal.classList.remove("show");

    alert("Member successfully added!");

});


// ================= DELETE EXISTING MEMBERS =================

document.querySelectorAll(".delete-btn").forEach(function (button) {

    button.addEventListener("click", function () {

        const row = this.closest("tr");

        if (confirm("Are you sure you want to delete this member?")) {

            row.remove();

            updateMemberCount();

        }

    });

});


// ================= UPDATE MEMBER COUNT =================

function updateMemberCount() {

    const rows =
        document.querySelectorAll("#membersTable tr").length;

    document.getElementById("totalMembers").textContent = rows + 245;

}


// ================= MEMBER SEARCH =================

document.getElementById("memberSearch").addEventListener(
    "keyup",
    function () {

        const search =
            this.value.toLowerCase();

        const rows =
            document.querySelectorAll("#membersTable tr");


        rows.forEach(function (row) {

            const text =
                row.textContent.toLowerCase();

            if (text.includes(search)) {

                row.style.display = "";

            } else {

                row.style.display = "none";

            }

        });

    }
);


// ================= SAVE SETTINGS =================

document.querySelector(".save-btn").addEventListener(
    "click",
    function () {

        alert("Settings saved successfully!");

    }
);


// ================= NOTIFICATION =================

document.querySelector(".notification").addEventListener(
    "click",
    function () {

        alert(
            "Notifications:\n\n" +
            "• 3 memberships expiring soon\n" +
            "• 5 new members today\n" +
            "• ₱8,500 sales today"
        );

    }
);