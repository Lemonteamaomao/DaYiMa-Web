// ================================
// GLOBAL BACKEND URL
// ================================
const BACKEND_URL = "https://dayima-backend.onrender.com";

// ================================
// 1. CAROUSEL (Fixed display logic)
// ================================
function startCarousel() {
    const carousel = document.getElementById("cardStack");
    if (!carousel) return;

    const images = carousel.querySelectorAll("img.card");
    if (!images.length) return;

    let currentIndex = 0;
    
    // Set initial state
    images.forEach((img, i) => {
        img.style.display = (i === 0) ? "block" : "none";
    });

    setInterval(() => {
        images[currentIndex].style.display = "none";
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].style.display = "block";
    }, 3000);
}

// ================================
// 2. TOGGLE BOOKING CARD
// ================================
function toggleCard(headerElement) {
    const card = headerElement.closest(".booking-card");
    if (card) card.classList.toggle("is-expanded");
}

// ================================
// 3. LOAD BOOKINGS (Updated Route)
// ================================
async function loadBookings() {
    const container = document.getElementById("bookingsList");
    if (!container) return;

    try {
        // CHANGED: Fetching from /api/bookings instead of /api/book-hygiene
        const res = await fetch(`${BACKEND_URL}/api/bookings`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        
        const bookings = await res.json();

        container.innerHTML = "";
        if (!bookings || bookings.length === 0) {
            container.innerHTML = "<p style='text-align:center;'>No bookings yet.</p>";
            return;
        }

        bookings.forEach((b) => {
            const div = document.createElement("div");
            div.className = "booking-card";
            div.innerHTML = `
                <div class="card-header" onclick="toggleCard(this)">
                    <div class="header-left">
                        <span class="tag">${b.workshopType || "Workshop"}</span>
                        <h3>${b.organization || "Unnamed Org"}</h3>
                    </div>
                    <div class="header-right"><span class="toggle-icon">▼</span></div>
                </div>
                <div class="card-content">
                    <div class="booking-details">
                        <p><strong>Contact:</strong> ${b.contactPerson}</p>
                        <p><strong>Email:</strong> ${b.email}</p>
                        <p><strong>Date:</strong> ${b.preferredDate}</p>
                    </div>
                    ${b.message ? `<div class="notes-box"><strong>Notes:</strong> ${b.message}</div>` : ""}
                    <button class="btn-cancel" onclick="cancelBooking('${b._id}')">Delete Request</button>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error("❌ Fetch Error:", err);
        container.innerHTML = `<p style='color:red;text-align:center;'>Error loading data. Check console.</p>`;
    }
}

// ================================
// 4. CANCEL BOOKING
// ================================
async function cancelBooking(id) {
    if (!confirm("Delete this booking?")) return;
    try {
        const res = await fetch(`${BACKEND_URL}/api/book-hygiene/${id}`, { method: "DELETE" });
        if (res.ok) loadBookings();
    } catch (err) {
        alert("Delete failed.");
    }
}

// ================================
// 5. SUBMIT FORM
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
            preferredDate: document.getElementById("date").value,
            participants: document.getElementById("participants").value,
            message: document.getElementById("notes").value,
        };

        try {
            const res = await fetch(`${BACKEND_URL}/api/book-hygiene`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error("Submission failed");
            alert("🎉 Request submitted!");
            hygieneForm.reset();
            loadBookings();
        } catch (err) {
            alert("Could not connect to backend.");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    startCarousel();
    loadBookings();
});
