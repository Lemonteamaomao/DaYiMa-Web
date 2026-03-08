// ==========================
// DaYiMa Frontend JS (Render Ready)
// ==========================

// Backend URL
const BACKEND_URL = "https://dayima-backend.onrender.com";

/* ---------------- TOGGLE CARD ---------------- */
function toggleCard(headerElement) {
  const card = headerElement.closest(".booking-card");
  if (card) {
    card.classList.toggle("is-expanded");
  }
}

/* ---------------- IMAGE CAROUSEL ---------------- */
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

/* ---------------- LOAD BOOKINGS ---------------- */
async function loadBookings() {
  const container = document.getElementById("bookingsList");
  if (!container) return;

  try {

    const response = await fetch(`${BACKEND_URL}/api/bookings`);
    const bookings = await response.json();

    container.innerHTML = "";

    if (!bookings || bookings.length === 0) {
      container.innerHTML =
        "<p style='text-align:center;'>No current bookings found.</p>";
      return;
    }

    bookings.forEach((b) => {

      const div = document.createElement("div");
      div.className = "booking-card";

      div.innerHTML = `
        <div class="card-header" onclick="toggleCard(this)">
            <div class="header-left">
                <span class="tag">${b.workshopType || "Workshop Request"}</span>
                <h3>${b.organization || "Unnamed Organization"}</h3>
            </div>

            <div class="header-right">
                <span class="toggle-icon">▼</span>
            </div>
        </div>

        <div class="card-content">
            <div class="booking-details">

                <p><strong>Contact:</strong> ${b.contactPerson || "N/A"}</p>
                <p><strong>Email:</strong> ${b.email || "No email"}</p>
                <p><strong>Phone:</strong> ${b.phone || "No phone"}</p>
                <p><strong>Date:</strong> ${b.preferredDate || "TBD"}</p>
                <p><strong>Participants:</strong> ${b.participants || 0}</p>

            </div>

            ${
              b.message
                ? `<div class="notes-box">
                    <strong>Notes:</strong> ${b.message}
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

    console.error("❌ Load Error:", err);

    container.innerHTML =
      "<p style='color:red;text-align:center;'>Cannot connect to backend.</p>";
  }
}

/* ---------------- DELETE BOOKING ---------------- */
async function cancelBooking(id) {

  if (!confirm("Are you sure you want to delete this request?")) return;

  try {

    const response = await fetch(`${BACKEND_URL}/api/book-hygiene/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    loadBookings();

  } catch (err) {

    console.error(err);
    alert("Delete failed.");

  }
}

/* ---------------- FORM SUBMISSION ---------------- */
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

      const response = await fetch(`${BACKEND_URL}/api/book-hygiene`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),

      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert("🎉 Request submitted successfully!");

      hygieneForm.reset();

      loadBookings();

    } catch (err) {

      console.error("❌ Submission Error:", err);

      alert("Could not connect to the backend.");

    }

  });

}

/* ---------------- INITIALIZE ---------------- */
document.addEventListener("DOMContentLoaded", () => {

  startCarousel();
  loadBookings();

});
