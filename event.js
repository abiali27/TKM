// ========== EVENTS API CONFIGURATION ==========
const EVENTS_API = "https://sheetdb.io/api/v1/3d0bclw7470ao";

console.log("🔍 Fetching events from:", EVENTS_API);

fetch(EVENTS_API)
  .then(res => {
    console.log("📡 Response status:", res.status);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log("✅ Data received:", data);
    console.log("📊 Total rows:", data.length);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = [];
    const pastEvents = [];

    data.forEach((event, idx) => {
      console.log(`\n--- Row ${idx + 1} ---`);
      
      // Skip empty rows
      if (!event.date || !event.title) {
        console.log("⚠️ Skipped (missing date/title)");
        return;
      }

      // Parse date - handle multiple formats
      let eventDate;
      if (event.date.includes("/")) {
        // Format: DD/MM/YYYY
        const [dd, mm, yyyy] = event.date.split("/");
        eventDate = new Date(yyyy, mm - 1, dd);
      } else if (event.date.includes("-")) {
        // Format: YYYY-MM-DD
        eventDate = new Date(event.date);
      } else {
        eventDate = new Date(event.date);
      }

      console.log(`📅 Title: ${event.title}`);
      console.log(`📅 Date string: ${event.date}`);
      console.log(`📅 Parsed date: ${eventDate.toDateString()}`);
      console.log(`📅 Is upcoming?: ${eventDate >= today}`);

      if (eventDate >= today) {
        upcomingEvents.push(event);
        console.log("✅ Added to UPCOMING");
      } else {
        pastEvents.push(event);
        console.log("📁 Added to PAST");
      }
    });

    console.log("\n🎯 FINAL RESULTS:");
    console.log(`Upcoming: ${upcomingEvents.length}`, upcomingEvents);
    console.log(`Past: ${pastEvents.length}`, pastEvents);

    renderUpcomingEvents(upcomingEvents);
    renderPastEvents(pastEvents);
  })
  .catch(err => {
    console.error("❌ Events loading failed:", err);
    const container = document.getElementById("upcomingEventsContainer");
    if (container) {
      container.innerHTML = `<p class="text-danger text-center">Failed to load events. Please check console.</p>`;
    }
  });

/* ---------------- UPCOMING EVENTS ---------------- */

function renderUpcomingEvents(events) {
  const container = document.getElementById("upcomingEventsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (events.length === 0) {
    container.innerHTML = `
      <div class="col-md-4">
        <div class="card blank-event">
          <img src="https://via.placeholder.com/400x250?text=No+Upcoming+Events" class="card-img-top" alt="No Events">
          <div class="card-body text-center">
            <h5>No Upcoming Events</h5>
            <p>Check back soon!</p>
          </div>
        </div>
      </div>`;
    return;
  }

  events.forEach((event, i) => {
    container.innerHTML += `
      <div class="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="${i * 100}">
        <div class="card h-100">
          <img src="${event.image || 'https://via.placeholder.com/400x250'}" class="card-img-top" alt="${event.title}">
          <div class="card-body">
            <h5 class="card-title">${event.title}</h5>
            <p class="card-text">${event.description || "Event details will be updated soon."}</p>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <small class="text-muted">
              <i class="fas fa-calendar me-1"></i>
              ${formatDate(event.date)}
            </small>
            ${
              isEventNear(event.date)
                ? `<button class="btn btn-sm btn-get-location" onclick="openMap(${event.lat}, ${event.lng})">Get Location</button>`
                : `<a href="${event.registerLink || '#'}" class="btn btn-sm btn-custom" target="_blank">Register</a>`
            }
          </div>
        </div>
      </div>
    `;
  });
}

/* ---------------- PAST EVENTS ---------------- */

function renderPastEvents(events) {
  const container = document.getElementById("eventsList");
  if (!container) return;

  container.innerHTML = "";

  if (events.length === 0) {
    container.innerHTML = "<p class='text-center'>No past events found</p>";
    return;
  }

  events.forEach(event => {
    container.innerHTML += `
      <div class="event-item">
        <div class="event-date">
          <i class="far fa-calendar"></i>
          ${formatDate(event.date)}
        </div>
        <h4 class="event-title">${event.title}</h4>
        <div class="event-location">
          <i class="fas fa-map-marker-alt"></i>
          ${event.location || "Fakhri Manzil, Pune"}
        </div>
      </div>
    `;
  });
}

/* ---------------- HELPER FUNCTIONS ---------------- */

function formatDate(dateStr) {
  let date;
  
  // Parse date based on format
  if (dateStr.includes("/")) {
    const [dd, mm, yyyy] = dateStr.split("/");
    date = new Date(yyyy, mm - 1, dd);
  } else {
    date = new Date(dateStr);
  }
  
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function isEventNear(dateStr) {
  let eventDate;
  
  // Parse date based on format
  if (dateStr.includes("/")) {
    const [dd, mm, yyyy] = dateStr.split("/");
    eventDate = new Date(yyyy, mm - 1, dd);
  } else {
    eventDate = new Date(dateStr);
  }
  
  const diff = (eventDate - new Date()) / (1000 * 60 * 60 * 24);
  return diff <= 1 && diff >= 0;
}

function openMap(lat, lng) {
  if (!lat || !lng) {
    console.warn("⚠️ No coordinates provided for this event");
    return;
  }
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    "_blank"
  );
}

/* ---------------- TOGGLE PAST EVENTS ---------------- */

const eventsBtn = document.getElementById("eventsBtn");
const eventsList = document.getElementById("eventsList");

if (eventsBtn && eventsList) {
  eventsBtn.addEventListener("click", () => {
    eventsList.classList.toggle("active");
    eventsBtn.innerHTML = eventsList.classList.contains("active")
      ? '<i class="fas fa-times me-2"></i> Close Events'
      : '<i class="fas fa-calendar-alt me-2"></i> View Past Events';
  });
}
