// ================== BASIC INIT ==================
(function () {
  console.log("✅ event.js loaded");

  if (window.AOS) {
    AOS.init({ duration: 800, once: true });
  }

  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
    });
  });
})();

function openFooterLocation() {
  window.open("https://www.google.com/maps?q=Fakhri+Manzil+Pune", "_blank");
}

// ================== DATE PARSER (IMPORTANT FIX) ==================
function parseSheetDate(dateStr) {
  // Expected: DD-MM-YY
  if (!dateStr) return null;

  const parts = dateStr.split("-");
  if (parts.length !== 3) return new Date(dateStr);

  const [dd, mm, yy] = parts;
  const fullYear = Number(yy) < 50 ? `20${yy}` : `19${yy}`;
  return new Date(`${fullYear}-${mm}-${dd}`);
}

// ================== EVENTS CONFIG ==================
const EVENTS_API = "https://sheetdb.io/api/v1/3d0bclw7470ao";

const upcomingContainer = document.getElementById("upcomingEventsContainer");
const pastContainer = document.getElementById("eventsList");

console.log("📡 Fetching events…");

// ================== FETCH & PROCESS ==================
fetch(EVENTS_API)
  .then(res => res.json())
  .then(data => {
    console.log("📊 Total rows:", data.length);
    console.log("📋 First event:", data[0]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];
    const past = [];

    data.forEach(event => {
      // SheetDB fields (CASE SENSITIVE)
      const title = event.Title;
      const dateStr = event.Date;

      if (!title || !dateStr) return;

      const eventDate = parseSheetDate(dateStr);
      if (!eventDate || isNaN(eventDate)) return;

      eventDate.setHours(0, 0, 0, 0);

      if (eventDate >= today) upcoming.push(event);
      else past.push(event);
    });

    console.log("🟢 Upcoming:", upcoming.length);
    console.log("🔵 Past:", past.length);

    renderUpcomingEvents(upcoming);
    renderPastEvents(past);
  })
  .catch(err => {
    console.error("❌ Event fetch failed:", err);
    if (upcomingContainer) {
      upcomingContainer.innerHTML = `
        <div class="col-12 text-center text-danger">
          <h5>Failed to load events</h5>
        </div>`;
    }
  });

// ================== RENDER UPCOMING ==================
function renderUpcomingEvents(events) {
  if (!upcomingContainer) return;
  upcomingContainer.innerHTML = "";

  if (events.length === 0) {
    upcomingContainer.innerHTML = `
      <div class="col-md-4">
        <div class="card text-center">
          <img src="https://via.placeholder.com/400x250?text=No+Upcoming+Events" class="card-img-top">
          <div class="card-body">
            <h5>No Upcoming Events</h5>
          </div>
        </div>
      </div>`;
    return;
  }

  events.forEach((e, i) => {
    upcomingContainer.innerHTML += `
      <div class="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="${i * 100}">
        <div class="card h-100">
          <img src="${e.Image || 'https://via.placeholder.com/400x250'}" class="card-img-top">
          <div class="card-body">
            <h5>${e.Title}</h5>
            <p>${e.Description || "Details coming soon"}</p>
          </div>
          <div class="card-footer">
            <small>📅 ${formatDate(e.Date)}</small>
          </div>
        </div>
      </div>`;
  });
}

// ================== RENDER PAST ==================
function renderPastEvents(events) {
  if (!pastContainer) return;
  pastContainer.innerHTML = "";

  if (events.length === 0) {
    pastContainer.innerHTML = "<p class='text-center'>No past events</p>";
    return;
  }

  events.forEach(e => {
    pastContainer.innerHTML += `
      <div class="event-item">
        <div class="event-date">📅 ${formatDate(e.Date)}</div>
        <h4>${e.Title}</h4>
        <p>${e.Location || "Fakhri Manzil, Pune"}</p>
      </div>`;
  });
}

// ================== HELPERS ==================
function formatDate(dateStr) {
  const d = parseSheetDate(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// ================== PAST EVENTS TOGGLE ==================
const eventsBtn = document.getElementById("eventsBtn");

if (eventsBtn && pastContainer) {
  eventsBtn.addEventListener("click", () => {
    pastContainer.classList.toggle("active");
    eventsBtn.innerHTML = pastContainer.classList.contains("active")
      ? "✖ Close Events"
      : "📅 View Past Events";
  });
}

console.log("✅ event.js ready");


