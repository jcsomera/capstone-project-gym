const $ = id =>
    document.getElementById(id);

let lockTimer = null;


// =========================
// MONEY
// =========================

function money(number) {

    return "₱" +
        Number(number).toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2
            }
        );
}


// =========================
// LOGIN
// =========================

$("loginForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const button =
            document.querySelector(
                ".login-btn"
            );

        button.disabled = true;

        button.textContent =
            "Logging in...";

        try {

            const response =
                await fetch(
                    "/api/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            username:
                                $("username")
                                .value
                                .trim(),

                            password:
                                $("password")
                                .value

                        })
                    }
                );

            const data =
                await response.json();


            if (data.success) {

                $("loginPage")
                    .classList
                    .add("hidden");

                $("app")
                    .classList
                    .remove("hidden");

                $("adminName")
                    .textContent =
                    data.admin.username;

                loadDashboard();

                loadMembers();

                loadSales();

                return;
            }


            if (data.locked) {

                startCountdown(
                    data.remaining_seconds
                );

                return;
            }


            $("attemptMessage")
                .textContent =
                "Login attempts remaining: " +
                data.remaining_attempts;

            alert(
                data.message +
                "\n\nAttempts remaining: " +
                data.remaining_attempts
            );

        }

        catch (error) {

            alert(
                "Cannot connect to Python Flask backend."
            );
        }


        button.disabled = false;

        button.textContent =
            "Login";
    }
);


// =========================
// LOCKOUT TIMER
// =========================

function startCountdown(seconds) {

    clearInterval(lockTimer);

    $("username").disabled = true;

    $("password").disabled = true;

    const button =
        document.querySelector(
            ".login-btn"
        );

    button.disabled = true;

    let remaining = seconds;


    function updateTimer() {

        if (remaining <= 0) {

            clearInterval(lockTimer);

            lockTimer = null;

            $("username").disabled = false;

            $("password").disabled = false;

            button.disabled = false;

            button.textContent =
                "Login";

            $("attemptMessage")
                .textContent =
                "Login attempts remaining: 5";

            alert(
                "Account unlocked. You can try again."
            );

            return;
        }


        const minutes =
            Math.floor(
                remaining / 60
            );

        const seconds =
            remaining % 60;

        const time =
            minutes +
            ":" +
            String(seconds)
                .padStart(2, "0");


        $("attemptMessage")
            .innerHTML =
            "🔒 Account locked<br>" +
            "Try again in <strong>" +
            time +
            "</strong>";


        button.textContent =
            "Locked " + time;


        remaining--;
    }


    updateTimer();

    lockTimer =
        setInterval(
            updateTimer,
            1000
        );
}


// =========================
// NAVIGATION
// =========================

document
    .querySelectorAll(
        ".nav[data-page]"
    )
    .forEach(
        nav => {

            nav.addEventListener(
                "click",
                function() {

                    showPage(
                        nav.dataset.page
                    );

                }
            );

        }
    );


function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(
            pageElement => {

                pageElement
                    .classList
                    .add("hidden");

            }
        );


    $(page)
        .classList
        .remove("hidden");


    document
        .querySelectorAll(".nav")
        .forEach(
            nav => {

                nav.classList
                    .remove("active");

            }
        );


    const activeNav =
        document.querySelector(
            `.nav[data-page="${page}"]`
        );


    if (activeNav) {

        activeNav
            .classList
            .add("active");
    }


    $("pageTitle")
        .textContent =
        page
            .charAt(0)
            .toUpperCase() +
        page.slice(1);


    if (page === "members") {

        loadMembers();
    }


    if (page === "sales") {

        loadSales();
    }
}


// =========================
// DASHBOARD
// =========================

async function loadDashboard() {

    const response =
        await fetch(
            "/api/dashboard"
        );

    if (!response.ok) return;

    const data =
        await response.json();


    $("totalMembers")
        .textContent =
        data.stats.members;


    $("activeMembers")
        .textContent =
        data.stats.active;


    $("expiringMembers")
        .textContent =
        data.stats.expiring;


    $("totalSales")
        .textContent =
        money(
            data.stats.sales
        );
}


// =========================
// MEMBERS
// =========================

async function loadMembers() {

    const response =
        await fetch(
            "/api/members"
        );

    if (!response.ok) return;

    const data =
        await response.json();


    const table =
        $("membersTable");

    const recent =
        $("recentMembers");


    table.innerHTML = "";

    recent.innerHTML = "";


    data.members
        .forEach(
            member => {

                const statusClass =
                    member.status
                        .toLowerCase();


                table.innerHTML += `

                    <tr>

                        <td>
                            ${escapeHtml(
                                member.full_name
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                member.membership_plan
                            )}
                        </td>

                        <td>
                            ${member.membership_start}
                        </td>

                        <td>
                            ${member.membership_end}
                        </td>

                        <td
                            class="status
                            ${statusClass}"
                        >
                            ${member.status}
                        </td>

                        <td>

                            <button
                                onclick="deleteMember(
                                    ${member.id}
                                )"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>

                `;


                recent.innerHTML += `

                    <tr>

                        <td>
                            ${escapeHtml(
                                member.full_name
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                member.membership_plan
                            )}
                        </td>

                        <td
                            class="status
                            ${statusClass}"
                        >
                            ${member.status}
                        </td>

                        <td>
                            ${member.membership_end}
                        </td>

                    </tr>

                `;
            }
        );
}


// =========================
// ADD MEMBER MODAL
// =========================

function openMemberModal() {

    $("memberModal")
        .classList
        .remove("hidden");
}


function closeMemberModal() {

    $("memberModal")
        .classList
        .add("hidden");
}


// =========================
// ADD MEMBER
// =========================

$("memberForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const response =
                await fetch(
                    "/api/members",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                full_name:
                                    $("mName")
                                    .value,

                                email:
                                    $("mEmail")
                                    .value,

                                phone:
                                    $("mPhone")
                                    .value,

                                membership_plan:
                                    $("mPlan")
                                    .value,

                                membership_start:
                                    $("mStart")
                                    .value,

                                membership_end:
                                    $("mEnd")
                                    .value

                            })
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                alert(
                    "Member added successfully."
                );

                $("memberForm")
                    .reset();

                closeMemberModal();

                loadMembers();

                loadDashboard();

            }

            else {

                alert(
                    data.message
                );
            }

        }
    );


// =========================
// DELETE MEMBER
// =========================

async function deleteMember(id) {

    if (
        !confirm(
            "Delete this member?"
        )
    ) {
        return;
    }


    const response =
        await fetch(
            "/api/members/" + id,
            {
                method: "DELETE"
            }
        );


    const data =
        await response.json();


    if (data.success) {

        loadMembers();

        loadDashboard();

    }

    else {

        alert(
            data.message
        );
    }
}


// =========================
// SALES
// =========================

async function loadSales() {

    const response =
        await fetch(
            "/api/sales"
        );

    if (!response.ok) return;

    const data =
        await response.json();


    $("salesTable")
        .innerHTML =
        data.sales
            .map(
                sale => `

                    <tr>

                        <td>
                            ${escapeHtml(
                                sale.full_name ||
                                "Walk-in"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                sale.plan_name
                            )}
                        </td>

                        <td>
                            ${money(
                                sale.amount
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                sale.payment_method
                            )}
                        </td>

                        <td>
                            ${sale.sale_date}
                        </td>

                    </tr>

                `
            )
            .join("");
}


// =========================
// LOGOUT
// =========================

$("logout")
    .addEventListener(
        "click",
        async function() {

            await fetch(
                "/api/logout",
                {
                    method: "POST"
                }
            );

            location.reload();
        }
    );


// =========================
// FORGOT PASSWORD
// =========================

$("forgotLink")
    .addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            $("loginPage")
                .classList
                .add("hidden");

            $("forgotPage")
                .classList
                .remove("hidden");
        }
    );


$("backLogin")
    .addEventListener(
        "click",
        function() {

            $("forgotPage")
                .classList
                .add("hidden");

            $("loginPage")
                .classList
                .remove("hidden");

        }
    );


$("forgotForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const response =
                await fetch(
                    "/api/forgot-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                email:
                                    $("resetEmail")
                                    .value

                            })
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                alert(
                    data.message +

                    (
                        data.demo_token
                        ?
                        "\n\nDEMO RESET TOKEN:\n" +
                        data.demo_token
                        :
                        ""
                    )
                );

            }

            else {

                alert(
                    data.message
                );
            }

        }
    );


// =========================
// SECURITY
// =========================

function escapeHtml(value) {

    return String(value)
        .replace(
            /[&<>"']/g,
            character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            })[character]
        );


// =========================
// ADMIN TIME IN
// =========================

async function adminTimeIn() {

    const response =
        await fetch(
            "/api/admin/time-in",
            {
                method: "POST"
            }
        );

    const data =
        await response.json();

    alert(data.message);

    if (data.success) {

        loadAttendance();

    }

}


// =========================
// ADMIN TIME OUT
// =========================

async function adminTimeOut() {

    const confirmLogout =
        confirm(
            "Are you sure you want to Time Out?"
        );

    if (!confirmLogout) {
        return;
    }

    const response =
        await fetch(
            "/api/admin/time-out",
            {
                method: "POST"
            }
        );

    const data =
        await response.json();

    alert(data.message);

    if (data.success) {

        loadAttendance();

    }

}


// =========================
// LOAD ATTENDANCE
// =========================

async function loadAttendance() {

    const response =
        await fetch(
            "/api/admin/attendance"
        );

    if (!response.ok) {
        return;
    }

    const data =
        await response.json();

    if (
        !data.success ||
        data.attendance.length === 0
    ) {

        $("todayTimeIn")
            .textContent = "--:--";

        $("todayTimeOut")
            .textContent = "--:--";

        return;
    }


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todayRecord =
        data.attendance.find(
            record =>
                record.attendance_date === today
        );


    if (!todayRecord) {

        $("todayTimeIn")
            .textContent = "--:--";

        $("todayTimeOut")
            .textContent = "--:--";

        return;
    }


    if (todayRecord.time_in) {

        $("todayTimeIn")
            .textContent =
            formatTime(
                todayRecord.time_in
            );
    }


    if (todayRecord.time_out) {

        $("todayTimeOut")
            .textContent =
            formatTime(
                todayRecord.time_out
            );
    }

}


// =========================
// FORMAT TIME
// =========================

function formatTime(dateTime) {

    const date =
        new Date(
            dateTime.replace(" ", "T")
        );

    return date.toLocaleTimeString(
        "en-PH",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );
  }
}