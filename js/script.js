const BACKEND_URL = "https://dayima-backend.onrender.com";

// 1. Toggle booking card
function toggleCard(headerElement) {
  const card = headerElement.closest(".booking-card");
  if (card) card.classList.toggle("is-expanded");
}

// 2. Carousel logic
function startCarousel() {
  const carousel = document.getElementById("cardStack");
  if (!carousel) return;
  const images = carousel.querySelectorAll("img.card");
  if (!images.length) return;

  let currentIndex = 0;
  images.forEach((img, i) => img.style.display = i === 0 ? "block" : "none");

  setInterval(() => {
    images[currentIndex].style.display = "none";
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].style.display = "block";
  }, 3000);
}

// 3. Load bookings
async function loadBookings() {
  const container = document.getElementById("bookingsList");
  if (!container) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/book-hygiene`);
    const bookings = await res.json();

    container.innerHTML = "";
    if (!bookings.length) {
      container.innerHTML = "<p style='text-align:center;'>No bookings yet.</p>";
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
          <div class="header-right"><span class="toggle-icon">▼</span></div>
        </div>
        <div class="card-content">
          <div class="booking-details">
            <p><strong>Contact:</strong> ${b.contactPerson || "N/A"}</p>
            <p><strong>Email:</strong> ${b.email || "No email"}</p>
            <p><strong>Phone:</strong> ${b.phone || "No phone"}</p>
            <p><strong>Date:</strong> ${b.preferredDate || "TBD"}</p>
            <p><strong>Participants:</strong> ${b.participants || 0}</p>
          </div>
          ${b.message ? `<div class="notes-box"><strong>Notes:</strong> ${b.message}</div>` : ""}
          <button class="btn-cancel" onclick="cancelBooking('${b._id}')">Cancel Request →</button>
        </div>
      `;
      container.appendChild(div);
    });

  } catch {
    container.innerHTML = "<p style='color:red;text-align:center;'>Cannot connect to backend.</p>";
  }
}

// 4. Cancel booking
async function cancelBooking(id) {
  if (!confirm("Delete this booking?")) return;
  try {
    await fetch(`${BACKEND_URL}/api/book-hygiene/${id}`, { method: "DELETE" });
    loadBookings();
  } catch (err) {
    alert("Failed to delete booking.");
    console.error(err);
  }
}

// 5. Form submission
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
      if (!res.ok) throw new Error();
      alert("🎉 Request submitted successfully!");
      hygieneForm.reset();
      loadBookings();
    } catch {
      alert("Could not connect to the backend.");
    }
  });
}

// 6. Initialize
document.addEventListener("DOMContentLoaded", () => {
  startCarousel();
  loadBookings();
});
