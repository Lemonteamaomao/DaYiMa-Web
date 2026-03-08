// ==========================
// DaYiMa Frontend JS (Render-Ready)
// ==========================

// 1. Backend URL
const BACKEND_URL = "https://dayima-backend.onrender.com"; // <--- your live backend

// 2. TOGGLE LOGIC (Global Scope)
function toggleCard(headerElement) {
  const card = headerElement.closest(".booking-card");
  if (card) {
    card.classList.toggle("is-expanded");
  }
}

// 3. CAROUSEL LOGIC
function startCarousel() {
  const images = document.querySelectorAll(".carousel img");
  if (images.length === 0) return;

  let currentIndex = 0;
  images[0].classList.add("active");

  setInterval(() => {
    images[currentIndex].classList.remove("active");
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].classList.add("active");
  }, 3000);
}

// 4. LOAD DASHBOARD DATA
async function loadBookings() {
  const container = document.getElementById("bookingsList");
  if (!container) return;

  try {
    const response = await fetch(`${BACKEND_URL}/api/book-hygiene`);
    const bookings = await response.json();

    container.innerHTML = "";

    if (bookings.length === 0) {
      container.innerHTML =
        "<p style='text-align:center;'>No current bookings found.</p>";
      return;
    }

    bookings.forEach((b) => {
      const div = document.createElement("div");
      div.className = "booking-card";

      const displayTag = b.workshopType || "Workshop Request";
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
                <p><img src="assets/images/icons/user.png" class="card-icon"> <strong>Contact:</strong> ${b.contactPerson || "N/A"}</p>
                <p><img src="assets/images/icons/email.png" class="card-icon"> <strong>Email:</strong> ${b.email || "No email"}</p>
                <p><img src="assets/images/icons/phone.png" class="card-icon"> <strong>Phone:</strong> ${b.phone || "No phone"}</p>
                <p><img src="assets/images/icons/calendar.png" class="card-icon"> <strong>Date:</strong> ${b.date || "TBD"}</p>
                <p><img src="assets/images/icons/group.png" class="card-icon"> <strong>Size:</strong> ${b.participants || 0} pax</p>
            </div>

            ${
              b.notes
                ? `
                <div class="notes-box">
                    <img src="assets/images/icons/notes.png" class="card-icon"> 
                    <strong>Notes:</strong> ${b.notes}
                </div>`
                : ""
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
    container.innerHTML =
      "<p style='color:red; text-align:center;'>Cannot connect to backend. Check if the Render backend URL is correct.</p>";
  }
}

// 5. DELETE BOOKING
async function cancelBooking(id) {
  if (!confirm("Are you sure you want to delete this request?")) return;
  try {
    await fetch(`${BACKEND_URL}/api/book-hygiene/${id}`, {
      method: "DELETE",
    });
    loadBookings();
  } catch (err) {
    alert("Delete failed.");
  }
}

// 6. INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
  startCarousel();
  loadBookings();
});

// 7. SUBMIT NEW BOOKING
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
        const errorData = await response.json();
        alert("Submission failed: " + errorData.message);
      }
    } catch (err) {
      console.error("❌ Submission Error:", err);
      alert("Could not connect to the backend.");
    }
  });
}
