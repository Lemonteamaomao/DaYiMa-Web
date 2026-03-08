// ================================
// CONFIG
// ================================
const BACKEND_URL = "https://dayima-backend.onrender.com";

// ================================
// 1. CAROUSEL & TOGGLE
// ================================
function toggleCard(headerElement) {
    const card = headerElement.closest(".booking-card");
    if (card) card.classList.toggle("is-expanded");
}

function startCarousel() {
    const images = document.querySelectorAll("#cardStack img.card");
    if (images.length === 0) return;

    let currentIndex = 0;
    // Set first image active
    images.forEach((img, i) => img.classList.toggle("active", i === 0));

    setInterval(() => {
        images[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add("active");
    }, 3000);
}

// ================================
// 2. DASHBOARD (Load Bookings)
// ================================
async function loadBookings() {
    const container = document.getElementById("bookingsList");
    if (!container) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/book-hygiene`);
        const bookings = await response.json();

        container.innerHTML = ""; 

        if (!bookings || bookings.length === 0) {
            container.innerHTML = "<p style='text-align:center;'>No current bookings found.</p>";
            return;
        }

        bookings.forEach((b) => {
            const div = document.createElement("div");
            div.className = "booking-card";

            const isSeen = b.isSeen ? "active" : "";
            const isReplied = b.isReplied ? "active" : "";

            div.innerHTML = `
                <div class="card-header" onclick="toggleCard(this)">
                    <div class="header-left">
                        <span class="tag">${b.workshopType || "Request"}</span>
                        <h3>${b.organization || "Unnamed Org"}</h3>
                    </div>
                    <div class="header-right">
                        <div class="status-tracker">
                            <div class="step active"><div class="dot"></div></div>
                            <div class="step-line ${isSeen}"></div>
                            <div class="step ${isSeen}"><div class="dot"></div></div>
                            <div class="step-line ${isReplied}"></div>
                            <div class="step ${isReplied}"><div class="dot"></div></div>
                        </div>
                        <span class="toggle-icon">▼</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="booking-details">
                        <p><img src="assets/images/icons/user.png" class="card-icon" onerror="this.style.display='none'"> <strong>Contact:</strong> ${b.contactPerson || "N/A"}</p>
                        <p><img src="assets/images/icons/email.png" class="card-icon" onerror="this.style.display='none'"> <strong>Email:</strong> ${b.email || "N/A"}</p>
                        <p><img src="assets/images/icons/phone.png" class="card-icon" onerror="this.style.display='none'"> <strong>Phone:</strong> ${b.phone || "N/A"}</p>
                        <p><img src="assets/images/icons/calendar.png" class="card-icon" onerror="this.style.display='none'"> <strong>Date:</strong> ${b.date || "TBD"}</p>
                        <p><img src="assets/images/icons/group.png" class="card-icon" onerror="this.style.display='none'"> <strong>Size:</strong> ${b.participants || 0} pax</p>
                    </div>
                    ${b.notes ? `<div class="notes-box"><strong>Notes:</strong> ${b.notes}</div>` : ""}
                    <button class="btn-cancel" onclick="cancelBooking('${b._id}')">Cancel Request →</button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        container.innerHTML = "<p style='color:red; text-align:center;'>Server connection failed. Please wait a moment.</p>";
    }
}

// ================================
// 3. ACTIONS (Delete & Submit)
// ================================
async function cancelBooking(id) {
    if (!confirm("Are you sure? This will delete the record and notify admin.")) return;
    try {
        await fetch(`${BACKEND_URL}/api/book-hygiene/${id}`, { method: "DELETE" });
        loadBookings();
    } catch (err) {
        alert("Delete failed.");
    }
}

const hygieneForm = document.getElementById("hygieneForm");
if (hygieneForm) {
    hygieneForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = {
            workshopType: document.getElementById("workshopType").value,
            organization: document.getElementById("organization").value,
            contactPerson: document.getElementById("contactPerson").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            date: document.getElementById("date").value,
            participants: document.getElementById("participants").value,
            notes: document.getElementById("notes").value,
        };

        try {
            const res = await fetch(`${BACKEND_URL}/api/book-hygiene`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                alert("🎉 Request submitted successfully!");
                hygieneForm.reset();
                loadBookings();
            }
        } catch (err) {
            alert("Submission error. Check your connection.");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    startCarousel();
    loadBookings();
});
