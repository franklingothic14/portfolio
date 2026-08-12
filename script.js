async function loadPortfolioVideos() {
  const grid = document.getElementById("work-grid");

  try {
    const res = await fetch("/.netlify/functions/get-videos");

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    const categories = data.categories || [];

    if (categories.length === 0) {
      grid.innerHTML = "<p class=\"loading-msg\">No videos found.</p>";
      return;
    }

    grid.innerHTML = "";

    categories.forEach((category) => {
      const section = document.createElement("div");
      section.className = "category-section";

      const heading = document.createElement("h3");
      heading.className = "category-title";
      heading.textContent = category.name;
      section.appendChild(heading);

      const categoryGrid = document.createElement("div");
      categoryGrid.className = "grid";

      category.videos.forEach((video) => {
        const videoId = video.id;
        const width = video.width || 16;
        const height = video.height || 9;
        const paddingTop = (height / width) * 100;

        const title = video.name || "Untitled project";
        const description = video.description
          ? video.description.slice(0, 140)
          : "Short project description goes here.";

        const playerParams = "title=0&byline=0&portrait=0&dnt=1";

        const card = document.createElement("article");
        card.className = "project-card";
        card.innerHTML = `
          <div class="video-wrap" style="padding-top: ${paddingTop}%;">
            <iframe src="https://player.vimeo.com/video/${videoId}?${playerParams}"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen></iframe>
          </div>
          <div class="card-body">
            <h3>${title}</h3>
            <p>${description}</p>
          </div>
        `;
        categoryGrid.appendChild(card);
      });

      section.appendChild(categoryGrid);
      grid.appendChild(section);
    });

    layoutAllMasonry();
    setTimeout(layoutAllMasonry, 300);
    setTimeout(layoutAllMasonry, 1000);
    window.addEventListener("load", layoutAllMasonry);
    window.addEventListener("resize", debounce(layoutAllMasonry, 150));
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p class="loading-msg">Could not load videos.</p>`;
  }
}

function layoutAllMasonry() {
  document.querySelectorAll(".category-section .grid").forEach((g) => {
    layoutMasonry(g);
  });
}

function layoutMasonry(gridEl) {
  const rowHeight = 8;
  const rowGap = 24;
  const safetyBuffer = 2;

  const cards = gridEl.querySelectorAll(".project-card");
  cards.forEach((card) => {
    card.style.gridRowEnd = "";
  });

  requestAnimationFrame(() => {
    cards.forEach((card) => {
      const contentHeight = card.scrollHeight;
      const rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap)) + safetyBuffer;
      card.style.gridRowEnd = `span ${rowSpan}`;
    });
  });
}

function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

document.addEventListener("DOMContentLoaded", loadPortfolioVideos);
