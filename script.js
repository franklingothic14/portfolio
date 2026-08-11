async function loadPortfolioVideos() {
  const grid = document.getElementById("work-grid");

  try {
    const res = await fetch("/.netlify/functions/get-videos");

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    const videos = data.videos || [];

    if (videos.length === 0) {
      grid.innerHTML = "<p class=\"loading-msg\">No videos found.</p>";
      return;
    }

    grid.innerHTML = "";

    videos.forEach((video) => {
      const videoId = video.id;
      const width = video.width || 16;
      const height = video.height || 9;
      const paddingTop = (height / width) * 100;

      const title = video.name || "Untitled project";
      const description = video.description
        ? video.description.slice(0, 140)
        : "Short project description goes here.";

      const card = document.createElement("article");
      card.className = "project-card";
      card.innerHTML = `
        <div class="video-wrap" style="padding-top: ${paddingTop}%;">
          <iframe src="https://player.vimeo.com/video/${videoId}"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen></iframe>
        </div>
        <div class="card-body">
          <h3>${title}</h3>
          <p>${description}</p>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p class="loading-msg">Could not load videos.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadPortfolioVideos);
