// URL вашого Cloudflare Worker, який ховатиме Vimeo API ключі
const API_URL = "https://your-cloudflare-worker-url.workers.dev/videos";

// Бажані категорії (папки)
const TARGET_CATEGORIES = ["ADVERTISING", "NGO", "DOCUMENTARY"];

async function loadPortfolioVideos() {
  const gridContainer = document.getElementById("work-grid");

  try {
    // В майбутньому, якщо буде 2 канали, Cloudflare Worker має збирати відео з обох і віддавати сюди одним масивом.
    const res = await fetch(API_URL);

    if (!res.ok) {
      throw new Error(`SYS.ERROR: ${res.status}`);
    }

    // Очікується, що API повертає масив об'єктів відео
    // Кожне відео має мати поле .folder або .tags, щоб скрипт міг його відсортувати
    const videos = await res.json();

    if (!videos || videos.length === 0) {
      gridContainer.innerHTML = "<p class=\"loading-msg\">NO_DATA_FOUND</p>";
      return;
    }

    gridContainer.innerHTML = ""; // Очищуємо лоадер

    // Сортуємо відео по категоріях
    TARGET_CATEGORIES.forEach((categoryName) => {
      // Фільтруємо відео. Припускаємо, що Cloudflare повертає поле folderName (або адаптуйте під вашу логіку тегів)
      const categoryVideos = videos.filter(v =>
        (v.folderName && v.folderName.toUpperCase() === categoryName) ||
        (v.tags && v.tags.includes(categoryName))
      );

      // Якщо у папці є відео, рендеримо секцію
      if (categoryVideos.length > 0) {
        const section = document.createElement("div");
        section.className = "category-section";

        const heading = document.createElement("h3");
        heading.className = "category-title";
        heading.textContent = `DIR: /${categoryName}`;
        section.appendChild(heading);

        const categoryGrid = document.createElement("div");
        categoryGrid.className = "grid";

        categoryVideos.forEach((video) => {
          const videoId = video.id; // ID відео з Vimeo
          // Стандартні пропорції 16:9
          const paddingTop = 56.25;

          const title = video.name || "UNTITLED_FILE";
          const description = video.description
            ? video.description.slice(0, 100) + "..."
            : "No description provided.";

          const playerParams = "title=0&byline=0&portrait=0&color=FF5722";

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
        gridContainer.appendChild(section);
      }
    });

  } catch (err) {
    console.error(err);
    gridContainer.innerHTML = `<p class="loading-msg" style="color: #FF5722;">[ CONNECTION_FAILED ]</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadPortfolioVideos);
