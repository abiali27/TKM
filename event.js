// ========== UI INITIALIZATION & HELPERS ==========
(function() {
  // Initialize AOS animations
  if (window.AOS) {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    AOS.init({ 
      duration: 800, 
      easing: 'ease-in-out', 
      once: true 
    });
  }

  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 50) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
        window.scrollTo({ 
          top: targetElement.offsetTop - 80, 
          behavior: 'smooth' 
        });
      }
    });
  });

})();

// Open Google Maps for footer location
function openFooterLocation() {
  window.open("https://www.google.com/maps?q=Fakhri+Manzil+Pune", "_blank");
}

// ========== EVENTS API CONFIGURATION & RENDERING ==========

// Add cache-busting and timestamp to prevent stale data
const EVENTS_API = "https://sheetdb.io/api/v1/3d0bclw7470ao";

console.log("🔍 Fetching events from:", EVENTS_API);
console.log("⏰ Current time:", new Date().toLocaleString());

// Fetch events with enhanced error handling
fetch(EVENTS_API)
  .then(res => {
    console.log("📡 Response status:", res.status);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log("📡 Response OK:", res.ok);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  })
  .then(data => {
    console.log("✅ Data received:", data);
    console.log("✅ Data received successfully");
    console.log("📊 Total rows:", data.length);
    console.log("📋 First event:", data[0]);

    // Get today's date at midnight for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = [];
    const pastEvents = [];

    // Sort events into upcoming and past
    data.forEach((event, idx) => {
      if (!event.date || !event.title) return;
      // Skip events without required fields
      if (!event.date || !event.title) {
        console.warn(`⚠️ Skipping event ${idx} - missing date or title:`, event);
        return;
      }

      let eventDate;
      
      // Handle DD/MM/YYYY format
      if (event.date.includes("/")) {
        const [dd, mm, yyyy] = event.date.split("/");
        eventDate = new Date(yyyy, mm - 1, dd);
      } else {
        // Handle ISO date format
        eventDate = new Date(event.date);
      }

      // Validate date
      if (isNaN(eventDate.getTime())) {
        console.warn(`⚠️ Invalid date for event: ${event.title} - ${event.date}`);
        return;
      }

      // Sort into upcoming or past
      if (eventDate >= today) {
        upcomingEvents.push(event);
      } else {
        pastEvents.push(event);
      }
    });

    console.log("📅 Upcoming events:", upcomingEvents.length);
    console.log("📅 Past events:", pastEvents.length);

    // Render both event lists
    renderUpcomingEvents(upcomingEvents);
    renderPastEvents(pastEvents);
  })
  .catch(err => {
    console.error("❌ Events loading failed:", err);
    console.error("📝 Error details:", err.message);
    console.error("🔗 API URL:", EVENTS_API);
    
    // Show user-friendly error message
    const container = document.getElementById("upcomingEventsContainer");
    if (container) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger text-center" role="alert">
            <h5>⚠️ Unable to Load Events</h5>
            <p>There was a problem connecting to the events database.</p>
            <small>Error: ${err.message}</small>
            <br>
            <button class="btn btn-sm btn-outline-danger mt-2" onclick="location.reload()">
              <i class="fas fa-redo"></i> Try Again
            </button>
          </div>
        </div>
      `;
    }
  });

// ========== RENDER UPCOMING EVENTS ==========
function renderUpcomingEvents(events) {
  const container = document.getElementById("upcomingEventsContainer");
  if (!container) {
    console.error("❌ upcomingEventsContainer not found in DOM");
    return;
  }
  
  container.innerHTML = "";

  // Show placeholder if no upcoming events
  if (events.length === 0) {
    container.innerHTML = `
      <div class="col-md-4">
        <div class="card blank-event">
          <img src="https://via.placeholder.com/400x250?text=No+Upcoming+Events" 
               class="card-img-top" 
               alt="No Events"
               loading="lazy">
          <div class="card-body text-center">
            <h5>📅 No Upcoming Events</h5>
            <p>Check back soon for new events!</p>
          </div>
        </div>
      </div>`;
    return;
  }

  // Render each upcoming event
  events.forEach((event, i) => {
    const eventCard = `
      <div class="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="${i * 100}">
        <div class="card h-100">
          <img src="${event.image || 'https://via.placeholder.com/400x250?text=Event+Image'}" 
               class="card-img-top" 
               alt="${event.title}"
               loading="lazy"
               onerror="this.src='https://via.placeholder.com/400x250?text=Image+Not+Available'">
          <div class="card-body">
            <h5 class="card-title">${event.title}</h5>
            <p class="card-text">${event.description || "Join us for this exciting event!"}</p>
          </div>
          <div class="card-footer d-flex justify-content-between align-items-center">
            <small>
              <i class="fas fa-calendar"></i>
              ${formatDate(event.date)}
            </small>
            ${renderEventButton(event)}
          </div>
        </div>
      </div>
    `;
    container.innerHTML += eventCard;
  });

  console.log("✅ Rendered", events.length, "upcoming events");
}

// ========== RENDER PAST EVENTS ==========
function renderPastEvents(events) {
  const container = document.getElementById("eventsList");
  if (!container) {
    console.error("❌ eventsList container not found in DOM");
    return;
  }
  
  container.innerHTML = "";

  // Show message if no past events
  if (events.length === 0) {
    container.innerHTML = "<p class='text-center text-muted'>No past events found</p>";
    return;
  }

  // Render each past event
  events.forEach(event => {
    const eventItem = `
      <div class="event-item">
        <div class="event-date">
          <i class="far fa-calendar"></i>
          <div class="date-text">
            <strong>${formatDate(event.date)}</strong>
          </div>
        </div>
        <div class="event-details">
          <h5>${event.title}</h5>
          <p>${event.description || ""}</p>
        </div>
      </div>
    `;
    container.innerHTML += eventItem;
  });

  console.log("✅ Rendered", events.length, "past events");
}

// ========== HELPER FUNCTIONS ==========

// Render appropriate button based on event timing
function renderEventButton(event) {
  if (isEventNear(event.date)) {
    // Show location button for events happening today/tomorrow
    return `<button class="btn btn-sm btn-get-location" onclick="openMap('${event.lat}', '${event.lng}', '${event.title}')">
      <i class="fas fa-map-marker-alt"></i> Get Location
    </button>`;
  } else if (event.registerLink && event.registerLink !== '#') {
    // Show register button with valid link
    return `<a href="${event.registerLink}" class="btn btn-sm btn-custom" target="_blank">
      <i class="fas fa-user-plus"></i> Register
    </a>`;
  } else {
    // Show disabled button if no registration link
    return `<button class="btn btn-sm btn-secondary" disabled>
      <i class="fas fa-clock"></i> Coming Soon
    </button>`;
  }
}

// Format date to readable string
function formatDate(dateStr) {
  let date;
  
  // Handle DD/MM/YYYY format
  if (dateStr.includes("/")) {
    const [dd, mm, yyyy] = dateStr.split("/");
    date = new Date(yyyy, mm - 1, dd);
  } else {
    // Handle ISO format
    date = new Date(dateStr);
  }

  // Validate date
  if (isNaN(date.getTime())) {
    console.error("❌ Invalid date string:", dateStr);
    return dateStr; // Return original string if invalid
  }

  // Format to Indian locale
  return date.toLocaleDateString("en-IN", { 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  });
}

// Check if event is happening today or tomorrow
function isEventNear(dateStr) {
  let eventDate;
  
  // Parse date
  if (dateStr.includes("/")) {
    const [dd, mm, yyyy] = dateStr.split("/");
    eventDate = new Date(yyyy, mm - 1, dd);
  } else {
    eventDate = new Date(dateStr);
  }

  // Validate date
  if (isNaN(eventDate.getTime())) {
    return false;
  }

  // Calculate days difference
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  
  const diffTime = eventDate - now;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // Return true if event is today or tomorrow
  return diffDays >= 0 && diffDays <= 1;
}

// Open Google Maps with directions
function openMap(lat, lng, eventTitle) {
  // Validate coordinates
  if (!lat || !lng || lat === 'undefined' || lng === 'undefined') {
    console.warn("⚠️ No valid coordinates for event:", eventTitle);
    alert("📍 Location coordinates not available for this event.");
    return;
  }

  // Parse coordinates as numbers
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // Validate parsed coordinates
  if (isNaN(latitude) || isNaN(longitude)) {
    console.warn("⚠️ Invalid coordinates:", { lat, lng });
    alert("📍 Invalid location coordinates.");
    return;
  }

  // Open Google Maps with directions
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  console.log("🗺️ Opening maps for:", eventTitle, "at", latitude, longitude);
  window.open(mapsUrl, "_blank");
}

// ========== TOGGLE PAST EVENTS VISIBILITY ==========
const eventsBtn = document.getElementById("eventsBtn");
const eventsList = document.getElementById("eventsList");

if (eventsBtn && eventsList) {
  eventsBtn.addEventListener("click", () => {
    eventsList.classList.toggle("active");
    eventsBtn.innerHTML = eventsList.classList.contains("active")
      ? '<i class="fas fa-times me-2"></i> Close Events'
      : '<i class="fas fa-calendar-alt me-2"></i> View Past Events';
    
    // Update button text and icon
    if (eventsList.classList.contains("active")) {
      eventsBtn.innerHTML = '<i class="fas fa-times me-2"></i> Close Past Events';
    } else {
      eventsBtn.innerHTML = '<i class="fas fa-calendar-alt me-2"></i> View Past Events';
    }
  });
} else {
  console.warn("⚠️ Events toggle button or list not found in DOM");
}

console.log("✅ Event system initialized successfully");

