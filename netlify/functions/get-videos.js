// netlify/functions/get-videos.js
// Fetches all folders and groups videos by folder name.
// Requires a Vimeo token with "private" scope (folders are
// a private organizational feature, not public data).

exports.handler = async function (event, context) {
  const VIMEO_TOKEN = process.env.VIMEO_TOKEN;

  if (!VIMEO_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing VIMEO_TOKEN environment variable" })
    };
  }

  const headers = {
    Authorization: `bearer ${VIMEO_TOKEN}`,
    "Content-Type": "application/json"
  };

  try {
    const foldersRes = await fetch(
      "https://api.vimeo.com/me/folders?per_page=50",
      { headers }
    );

    if (!foldersRes.ok) {
      return {
        statusCode: foldersRes.status,
        body: JSON.stringify({ error: `Vimeo folders error: ${foldersRes.status}` })
      };
    }

    const foldersData = await foldersRes.json();
    const folders = foldersData.data || [];

    const categories = [];
    const categorizedIds = new Set();

    for (const folder of folders) {
      const videosUri = folder.metadata?.connections?.videos?.uri;
      if (!videosUri) continue;

      const videosRes = await fetch(
        `https://api.vimeo.com${videosUri}?per_page=50`,
        { headers }
      );

      if (!videosRes.ok) continue;

      const videosData = await videosRes.json();
      const videos = (videosData.data || []).map((video) => {
        const id = video.uri.split("/").pop();
        categorizedIds.add(id);
        return {
          id,
          name: video.name,
          description: video.description,
          width: video.width,
          height: video.height
        };
      });

      if (videos.length > 0) {
        categories.push({ name: folder.name, videos });
      }
    }

    const allVideosRes = await fetch(
      "https://api.vimeo.com/me/videos?per_page=50&sort=date&direction=desc",
      { headers }
    );

    if (allVideosRes.ok) {
      const allVideosData = await allVideosRes.json();
      const uncategorized = (allVideosData.data || [])
        .filter((video) => !categorizedIds.has(video.uri.split("/").pop()))
        .map((video) => ({
          id: video.uri.split("/").pop(),
          name: video.name,
          description: video.description,
          width: video.width,
          height: video.height
        }));

      if (uncategorized.length > 0) {
        categories.push({ name: "Other", videos: uncategorized });
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
