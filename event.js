

const CONFIG = {
  // Replace these with your actual SheetDB API URLs
  INSTAGRAM_API: "https://sheetdb.io/api/v1/cs62l4m6ba366",
  EVENTS_API: "https://sheetdb.io/api/v1/7yce9hq14amiv",
  DEBUG: true // Set to false in production
};

// ========== UTILITY FUNCTIONS ==========
function log(...args) {
  if (CONFIG.DEBUG) console.log(...args);
}

function logError(...args) {
  console.error(...args);
}

// Date parsing with multiple format support
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  let date;
  
  // Handle YYYY-MM-DD format (from your sheet)
  if (dateStr.includes("-")) {
    date = new Date(dateStr);
  }
  // Handle DD/MM/YYYY format
  else if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      date = new Date(yyyy, mm - 1, dd);
    }
  }
  // Other formats
  else {
    date = new Date(dateStr);
  }
  
  return (date && !isNaN(date)) ? date : null;
}

// Format date for display
function formatDate(dateStr, customDisplay) {
  // Use custom display if provided
  if (customDisplay && customDisplay.trim()) {
    return customDisplay;
  }
  
  if (!dateStr) return "Date TBD";
  
  const date = parseDate(dateStr);
  if (!date) return dateStr;
  
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// Extract Instagram post ID from URL and convert to embed URL
function getInstagramEmbedUrl(url) {
  if (!url) return null;
  
  // Clean the URL - remove query parameters and trailing slashes
  let cleanUrl = url.trim();
  cleanUrl = cleanUrl.split('?')[0].replace(/\/$/, '');
  
  log("🔍 Processing Instagram URL:", url);
  log("🧹 Cleaned URL:", cleanUrl);
  
  // Extract post ID from various Instagram URL formats
  const patterns = [
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,      // Posts
    /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,   // Reels
    /instagram\.com\/tv\/([A-Za-z0-9_-]+)/      // IGTV
  ];
  
  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match) {
      const postId = match[1];
      const embedUrl = `https://www.instagram.com/p/${postId}/embed`;
      log("✅ Extracted post ID:", postId);
      log("🎯 Embed URL:", embedUrl);
      return embedUrl;
    }
  }
  
  logError("❌ Could not extract Instagram post ID from:", url);
  return null;
}

// Get location coordinates for map
function getLocationUrl(lat, lng) {
  if (lat && lng) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  return "https://www.google.com/maps?q=Fakhri+Manzil+Pune";
}

// ========== UI INITIALIZATION ==========
(function initializeUI() {
  log("✅ Event.js loaded successfully");
  
  // Initialize AOS (Animate On Scroll)
  if (window.AOS) {
    AOS.init({ 
      duration: 800, 
      easing: 'ease-in-out', 
      once: true 
    });
    log("✅ AOS initialized");
  }

  // Navbar scroll effect
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
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
        window.scrollTo({ 
          top: targetElement.offsetTop - 80, 
          behavior: 'smooth' 
        });
      }
    });
  });
})();

// Footer location function
function openFooterLocation() {
  window.open("https://www.google.com/maps?q=Fakhri+Manzil+Pune", "_blank");
}

// ========== INSTAGRAM FEED ==========
async function loadInstagramFeed() {
  const container = document.getElementById("instagramFeed");
  if (!container) {
    log("ℹ️ Instagram feed container not found");
    return;
  }

  log("📸 Loading Instagram feed...");
  
  try {
    const response = await fetch(CONFIG.INSTAGRAM_API);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    log("✅ Instagram data loaded:", data.length, "posts");
    
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center">
          <p>No Instagram posts available</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = '';
    
    // Filter valid posts (using "share link" column name from your sheet)
    const validPosts = data.filter(post => 
      post['share link'] && post['share link'].trim() !== ''
    );
    
    if (validPosts.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center">
          <p>No Instagram posts available</p>
        </div>
      `;
      return;
    }
    
    validPosts.forEach((post, index) => {
      const embedUrl = getInstagramEmbedUrl(post['share link']);
      
      if (!embedUrl) {
        log("⚠️ Invalid Instagram URL:", post['share link']);
        return;
      }
      
      container.innerHTML += `
        <div class="col-md-4 mb-4" data-aos="zoom-in" data-aos-delay="${index * 100}">
          <div class="instagram-post">
            <iframe 
              src="${embedUrl}" 
              frameborder="0" 
              scrolling="no" 
              allowtransparency="true"
              style="width: 100%; min-height: 480px; border: none; overflow: hidden;"
              loading="lazy">
            </iframe>
          </div>
        </div>
      `;
    });
    
    // Reinitialize AOS for new elements
    if (window.AOS) AOS.refresh();
    
  } catch (error) {
    logError("❌ Error loading Instagram feed:", error);
    container.innerHTML = `
      <div class="col-12 text-center text-danger">
        <p>Failed to load Instagram feed</p>
        <small>${error.message}</small>
      </div>
    `;
  }
}

// ========== EVENTS (UPCOMING & PAST) ==========
async function loadAllEvents() {
  const upcomingContainer = document.getElementById("upcomingEventsContainer");
  const pastContainer = document.getElementById("eventsList");
  const toggleBtn = document.getElementById("eventsBtn");
  
  if (!upcomingContainer && !pastContainer) {
    log("ℹ️ No event containers found");
    return;
  }

  log("📅 Loading all events...");
  
  try {
    const response = await fetch(CONFIG.EVENTS_API);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    log("✅ Events data loaded:", data.length, "events");
    
    if (!Array.isArray(data)) {
      throw new Error("Invalid data format");
    }
    
    // Filter valid events
    const validEvents = data.filter(event => 
      event.title && event.title.trim() !== '' && 
      event.date && event.date.trim() !== ''
    );
    
    log("📊 Valid events found:", validEvents.length);
    
    // Separate upcoming and past events
    const now = new Date();
    
    const upcomingEvents = [];
    const pastEvents = [];
    
    validEvents.forEach(event => {
      const eventDate = parseDate(event.date);
      if (!eventDate) {
        log("⚠️ Could not parse date for event:", event.title, event.date);
        return;
      }
      
      // Add 24 hours to event date to move it to past events after the event day
      const eventEndTime = new Date(eventDate);
      eventEndTime.setHours(23, 59, 59, 999);
      
      if (now <= eventEndTime) {
        upcomingEvents.push(event);
      } else {
        pastEvents.push(event);
      }
    });
    
    // Sort events
    upcomingEvents.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    pastEvents.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    
    // Limit past events to only 3 most recent
    const limitedPastEvents = pastEvents.slice(0, 3);
    
    log("✅ Upcoming events:", upcomingEvents.length);
    log(" Past events:", limitedPastEvents.length, "(limited to 3 most recent)");
    
    // Render upcoming events
    if (upcomingContainer) {
      renderUpcomingEvents(upcomingContainer, upcomingEvents);
    }
    
    // Render past events (limited to 3)
    if (pastContainer) {
      renderPastEvents(pastContainer, limitedPastEvents, toggleBtn);
    }
    
  } catch (error) {
    logError("❌ Error loading events:", error);
    
    if (upcomingContainer) {
      upcomingContainer.innerHTML = `
        <div class="col-12 text-center text-danger">
          <h5>Failed to load events</h5>
          <p>${error.message}</p>
          <button class="btn btn-primary mt-2" onclick="loadAllEvents()">Retry</button>
        </div>
      `;
    }
    
    if (pastContainer) {
      pastContainer.innerHTML = `
        <div class="text-center text-danger py-4">
          <p>Failed to load past events</p>
          <small>${error.message}</small>
        </div>
      `;
    }
  }
}

// Render upcoming events
function renderUpcomingEvents(container, events) {
  container.innerHTML = '';
  
  if (events.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="card text-center border-0 shadow-sm">
          <div class="card-body py-5">
            <i class="bi bi-calendar-x" style="font-size: 3rem; color: #ccc;"></i>
            <h5 class="mt-3">No Upcoming Events</h5>
            <p class="text-muted">Check back soon for new events!</p>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  events.forEach((event, index) => {
    const imageUrl = event.image || 'https://via.placeholder.com/400x250?text=Event+Image';
    const description = event.description || "Details coming soon";
    const displayDate = formatDate(event.date, event.dateDisplay);
    const hasRegistration = event.registerLink && event.registerLink.trim() !== '';
    const locationUrl = getLocationUrl(event.lat, event.lng);
    
    container.innerHTML += `
      <div class="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="${index * 100}">
        <div class="card h-100 border-0 shadow-sm hover-lift">
          <img src="${imageUrl}" 
               class="card-img-top" 
               alt="${event.title}"
               onerror="this.src='https://via.placeholder.com/400x250?text=Event+Image'"
               style="height: 250px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">${event.title}</h5>
            <p class="card-text text-muted">${description}</p>
            <div class="mt-3">
              <p class="mb-2">
                <i class="bi bi-calendar-event"></i> 
                <strong>${displayDate}</strong>
              </p>
              <a href="${locationUrl}" 
                 target="_blank" 
                 class="btn btn-sm mt-2"
                 style="background-color: #90EE90; color: #333; border: 1px solid #7CCD7C; font-size: 0.875rem; display: inline-block; width: auto;">
                <i class="bi bi-geo-alt"></i> View Location
              </a>
              ${hasRegistration ? `
                <a href="${event.registerLink}" 
                   target="_blank" 
                   class="btn btn-primary btn-sm w-100 mt-2">
                  <i class="bi bi-box-arrow-up-right"></i> Register Now
                </a>
              ` : ''}
            </div>
          </div>
          <div class="card-footer bg-transparent border-0">
            <small class="text-primary fw-bold">📅 ${displayDate}</small>
          </div>
        </div>
      </div>
    `;
  });
  
  // Reinitialize AOS
  if (window.AOS) AOS.refresh();
}

// Render past events
function renderPastEvents(container, events, toggleBtn) {
  if (events.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4">
        <p class="text-muted">No past events to display</p>
      </div>
    `;
    if (toggleBtn) toggleBtn.style.display = 'none';
    return;
  }
  
  container.innerHTML = '';
  
  events.forEach(event => {
    const displayDate = formatDate(event.date, event.dateDisplay);
    const description = event.description || "";
    
    container.innerHTML += `
      <div class="event-item">
        <div class="event-date">📅 ${displayDate}</div>
        <h4 class="event-title">${event.title}</h4>
        ${description ? `<p class="event-description text-muted">${description}</p>` : ''}
      </div>
    `;
  });
  
  // Setup toggle button
  // Setup toggle button
  if (toggleBtn) {
    toggleBtn.style.display = 'block';
    
    // Remove old listeners
    const newBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
    
    newBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      container.classList.toggle('active');
      this.textContent = container.classList.contains('active') 
        ? '✖ Close Events' 
        : ' View Past Events';
    });
    
    // Close past events when clicking anywhere outside
    document.addEventListener('click', function(e) {
      if (container.classList.contains('active')) {
        // Check if click is outside both the container and the button
        if (!container.contains(e.target) && !newBtn.contains(e.target)) {
          container.classList.remove('active');
          newBtn.textContent = ' View Past Events';
        }
      }
    });
    
    // Prevent clicks inside the container from closing it
    container.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
}
// ========== INITIALIZE ALL DATA ==========
function initializeAllData() {
  log("🚀 Initializing all data sources...");
  log("⏰ Current time:", new Date().toLocaleString());
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loadInstagramFeed();
      loadAllEvents();
    });
  } else {
    loadInstagramFeed();
    loadAllEvents();
  }
}

// Start initialization
initializeAllData();

// Make functions globally available
window.openFooterLocation = openFooterLocation;
window.loadInstagramFeed = loadInstagramFeed;
window.loadAllEvents = loadAllEvents;