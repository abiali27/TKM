// UI and helpers moved from inline script in index.html
(function() {
  console.log("✅ Event.js loaded successfully");
  
  if (window.AOS) {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    console.log("✅ AOS initialized");
  }

  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 50) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
      }
    });
  });

})();

function openFooterLocation() {
  window.open("https://www.google.com/maps?q=Fakhri+Manzil+Pune", "_blank");
}

// ========== EVENTS API CONFIGURATION & RENDERING ==========
const EVENTS_API = "https://sheetdb.io/api/v1/3d0bclw7470ao";

console.log("🔍 Fetching events from:", EVENTS_API);
console.log("⏰ Current time:", new Date().toLocaleString());

// Check if container exists before fetching
const upcomingContainer = document.getElementById("upcomingEventsContainer");
console.log("📦 Upcoming container found:", !!upcomingContainer);

fetch(EVENTS_API)
  .then(res => {
    console.log("📡 Response received:", res.status, res.statusText);
    console.log("📡 Response headers:", res.headers);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log("✅ Data received successfully");
    console.log("📊 Total events:", data.length);
    console.log("📋 Full data:", data);
    console.log("📋 First event:", data[0]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("📅 Today's date (midnight):", today.toDateString());

    const upcomingEvents = [];
    const pastEvents = [];

    data.forEach((event, idx) => {
      console.log(`\n--- Processing Event ${idx + 1} ---`);
      console.log("Event data:", event);
      
      if (!event.date || !event.title) {
        console.warn("⚠️ Skipping - missing date or title");
        return;
      }

      // Parse date - handle multiple formats
      let eventDate;
      if (event.date.includes("/")) {
        const [dd, mm, yyyy] = event.date.split("/");
        eventDate = new Date(yyyy, mm - 1, dd);
        console.log(`📅 Parsed DD/MM/YYYY: ${dd}/${mm}/${yyyy} -> ${eventDate}`);
      } else if (event.date.includes("-")) {
        eventDate = new Date(event.date);
        console.log(`📅 Parsed ISO date: ${event.date} -> ${eventDate}`);
      } else {
        eventDate = new Date(event.date);
        console.log(`📅 Parsed other format: ${event.date} -> ${eventDate}`);
      }

      console.log(`📅 Event date: ${eventDate.toDateString()}`);
      console.log(`📅 Is upcoming?: ${eventDate >= today}`);

      if (eventDate >= today) {
        upcomingEvents.push(event);
        console.log("✅ Added to UPCOMING");
      } else {
        pastEvents.push(event);
        console.log("📁 Added to PAST");
      }
    });

    console.log("\n🎯 SORTING COMPLETE:");
    console.log(`Upcoming events: ${upcomingEvents.length}`, upcomingEvents);
    console.log(`Past events: ${pastEvents.length}`, pastEvents);

    renderUpcomingEvents(upcomingEvents);
    renderPastEvents(pastEvents);
  })
  .catch(err => {
    console.error("❌ FETCH ERROR:", err);
    console.error("❌ Error name:", err.name);
    console.error("❌ Error message:", err.message);
    console.error("❌ Error stack:", err.stack);
    
    const container = document.getElementById("upcomingEventsContainer");
    if (container) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            <h5>❌ Failed to load events</h5>
            <p><strong>Error:</strong> ${err.message}</p>
            <p><strong>API:</strong> ${EVENTS_API}</p>
            <button class="btn btn-sm btn-outline-danger mt-2" onclick="location.reload()">
              🔄 Reload Page
            </button>
          </div>
        </div>
      `;
    } else {
      console.error("❌ Container 'upcomingEventsContainer' not found!");
    }
  });

function renderUpcomingEvents(events) {
  console.log("\n🎨 RENDERING UPCOMING EVENTS");
  
  const container = document.getElementById("upcomingEventsContainer");
  if (!container) {
    console.error("❌ Container 'upcomingEventsContainer' not found!");
    return;
  }

  container.innerHTML = "";
  console.log("🧹 Container cleared");

  if (events.length === 0) {
    console.log("📭 No upcoming events - showing placeholder");
    container.innerHTML = `
      <div class="col-md-4">
        <div class="card blank-event">
          <img src="https://via.placeholder.com/400x250?text=No+Upcoming+Events" class="card-img-top" alt="No Events">
          <div class="card-body text-center">
            <h5>📅 No Upcoming Events</h5>
            <p>Check back soon!</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  console.log(`🎨 Rendering ${events.length} upcoming events`);
  
  events.forEach((event, i) => {
    console.log(`🎨 Rendering event ${i + 1}:`, event.title);
    
    container.innerHTML += `
      <div class="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="${i * 100}">
        <div class="card h-100">
          <img src="${event.image || 'https://via.placeholder.com/400x250'}" class="card-img-top" alt="${event.title}">
          <div class="card-body">
            <h5 class="card-title">${event.title}</h5>
            <p class="card-text">${event.description || "Event details coming soon"}</p>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <small>
              <i class="fas fa-calendar"></i>
              ${formatDate(event.date)}
            </small>
            ${
              isEventNear(event.date)
                ? `<button class="btn btn-sm btn-get-location" onclick="openMap('${event.lat}', '${event.lng}')"><i class="fas fa-map-marker-alt"></i> Get Location</button>`
                : event.registerLink && event.registerLink !== '#'
                ? `<a href="${event.registerLink}" class="btn btn-sm btn-custom" target="_blank"><i class="fas fa-user-plus"></i> Register</a>`
                : `<button class="btn btn-sm btn-secondary" disabled><i class="fas fa-clock"></i> Coming Soon</button>`
            }
          </div>
        </div>
      </div>
    `;
  });
  
  console.log("✅ Upcoming events rendered successfully");
}

function renderPastEvents(events) {
  console.log("\n🎨 RENDERING PAST EVENTS");
  
  const container = document.getElementById("eventsList");
  if (!container) {
    console.error("❌ Container 'eventsList' not found!");
    return;
  }

  container.innerHTML = "";

  if (events.length === 0) {
    console.log("📭 No past events");
    container.innerHTML = "<p class='text-center'>No past events found</p>";
    return;
  }
  
  console.log(`🎨 Rendering ${events.length} past events`);
  
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
  
  console.log("✅ Past events rendered successfully");
}

function formatDate(dateStr) {
  let date;
  if (dateStr.includes("/")) {
    const [dd, mm, yyyy] = dateStr.split("/");
    date = new Date(yyyy, mm - 1, dd);
  } else {
    date = new Date(dateStr);
  }
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function isEventNear(dateStr) {
  let eventDate;
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
  console.log("🗺️ Opening map with coordinates:", lat, lng);
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
}

const eventsBtn = document.getElementById("eventsBtn");
const eventsList = document.getElementById("eventsList");

if (eventsBtn && eventsList) {
  console.log("✅ Past events toggle initialized");
  eventsBtn.addEventListener("click", () => {
    eventsList.classList.toggle("active");
    eventsBtn.innerHTML = eventsList.classList.contains("active")
      ? '<i class="fas fa-times me-2"></i> Close Events'
      : '<i class="fas fa-calendar-alt me-2"></i> View Past Events';
  });
} else {
  console.warn("⚠️ Events toggle button or list not found");
}

console.log("✅ Event.js initialization complete");

