const EVENTS_API = "https://sheetdb.io/api/v1/7yce9hq14amiv";

fetch(EVENTS_API)
  .then(res => res.json())
  .then(data => {
    const upcomingEvents = [];
    const pastEvents = [];

    data.forEach(event => {
      if (new Date(event.date) >= new Date()) {
        upcomingEvents.push(event);
      } else {
        pastEvents.push(event);
      }
    });

    renderUpcomingEvents(upcomingEvents);
    renderPastEvents(pastEvents);
  })
  .catch(err => console.error("Events loading failed", err));

/* ---------------- UPCOMING EVENTS ---------------- */

function renderUpcomingEvents(events) {
  const container = document.getElementById("upcomingEventsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (events.length === 0) {
    container.innerHTML = "<p>No upcoming events</p>";
    return;
  }

  events.forEach(event => {
    container.innerHTML += `
      <div class="event-card">
        <img src="${event.image}" alt="${event.title}">
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <small>${event.date}</small><br>

        ${
          isEventNear(event.date)
          ? `<button onclick="openMap(${event.lat}, ${event.lng})">Get Location</button>`
          : `<a href="${event.registerLink}" target="_blank">Register</a>`
        }
        <p class="card-text">${event.description || "Event details will be updated soon."}</p>

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
    container.innerHTML = "<p>No past events</p>";
    return;
  }

  container.innerHTML = events.map(e => `
    <div class="past-event">
      <strong>${e.title}</strong><br>
      <small>${e.date} – ${e.location}</small>
    </div>
  `).join("");
}

/* ---------------- HELPERS ---------------- */

function isEventNear(date) {
  const diff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
  return diff <= 1 && diff >= 0;
}

function openMap(lat, lng) {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    "_blank"
  );
}
