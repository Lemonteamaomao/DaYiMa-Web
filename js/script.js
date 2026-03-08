// ================================
// GLOBAL BACKEND URL
// ================================
const BACKEND_URL = "https://dayima-backend.onrender.com";

// ================================
// 1. TOGGLE LOGIC
// ================================
function toggleCard(headerElement) {
    const card = headerElement.closest(".booking-card");
    if (card) {
        card.classList.toggle("is-expanded");
    }
}

// ================================
// 2. CAROUSEL LOGIC
// ================================
function startCarousel() {
    const images = document.querySelectorAll(".carousel img");
    if (images.length === 0) return;

    let currentIndex = 0;
    // Set initial active class
    images.forEach((img, i) => {
        img.classList.toggle("active", i === 0);
    });

    setInterval(() => {
        images[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add("active");
    }, 3000);
}

// ================================
// 3. LOAD DASHBOARD DATA
// ================================
async function loadBookings() {
    const container = document.getElementById("bookingsList");
    if (!container) return;

    try {
        // CHANGED: Using live BACKEND_URL and /api/bookings route
        const response = await fetch(`${BACKEND_URL}/api/bookings`);
        const bookings = await response.json();

        container.innerHTML = ""; 

        if (!bookings || bookings.length === 0) {
            container.innerHTML = "<p style='text-align:center;'>No current bookings found.</p>";
            return;
        }

        bookings.forEach((b) => {
            const div = document.createElement("div");
            div.className = "booking-card";

            const displayTag = b.workshopType || "Workshop Request";
            // Check if these fields exist in your DB; otherwise default to false
            const isSeen = b.isSeen ? "active" : "";
            const isReplied = b.isReplied ? "active" : "";

            div.innerHTML = `
                <div class="card-header" onclick="toggleCard(this)">
                    <div class="header-left">
                        <span class="tag">${displayTag}</span>
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
                        <p><img src="assets/images/icons/email.png" class="card-icon" onerror="this.style.display='none'"> <strong>Email:</strong> ${b.email || "No email"}</p>
                        <p><img src="assets/images/icons/phone.png" class="card-icon" onerror="this.style.display='none'"> <strong>Phone:</strong> ${b.phone || "No phone"}</p>
                        <p><img src="assets/images/icons/calendar.png" class="card-icon" onerror="this.style.display='none'"> <strong>Date:</strong> ${b.preferredDate || "TBD"}</p>
                        <p><img src="assets/images/icons/group.png" class="card-icon" onerror="this.style.display='none'"> <strong>Size:</strong> ${b.participants || 0} pax</p>
                    </div>

                    ${b.message ? `
                        <div class="notes-box">
                            <img src="assets/images/icons/notes.png" class="card-icon" onerror="this.style.display='none'"> 
                            <strong>Notes:</strong> ${b.message}
                        </div>` : ""
                    }

                    <button class="btn-cancel" onclick="cancelBooking('${b._id}')">
                        Cancel Request →
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error("❌ Error:", err);
        container.innerHTML = "<p style='color:red; text-align:center;'>Could not connect to the backend server.</p>";
    }
}

// ================================
// 4. DELETE BOOKING
// ================================
async function cancelBooking(id) {
    if (!confirm("Are you sure you want to delete this request?")) return;
    try {
        const response = await fetch(`${BACKEND_URL}/api/book-hygiene/${id}`, {
            method: "DELETE",
        });
        if (response.ok) {
            loadBookings(); 
        } else {
            alert("Delete failed on server.");
        }
    } catch (err) {
        alert("Delete failed. Check your connection.");
    }
}

// ================================
// 5. SUBMIT NEW BOOKING
// ================================
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
            preferredDate: document.getElementById("date").value, // Key changed to preferredDate to match backend
            participants: document.getElementById("participants").value,
            message: document.getElementById("notes").value, // Key changed to message to match backend
        };

        try {
            const response = await fetch(`${BACKEND_URL}/api/book-hygiene`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("🎉 Request submitted successfully!");
                hygieneForm.reset();
                loadBookings();
            } else {
                alert("Submission failed. Please try again.");
            }
        } catch (err) {
            console.error("❌ Submission Error:", err);
            alert("Could not connect to the server.");
        }
    });
}

// ================================
// 6. INITIALIZE
// ================================
document.addEventListener("DOMContentLoaded", () => {
    startCarousel();
    loadBookings();
});
