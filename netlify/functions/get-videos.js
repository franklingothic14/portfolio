// netlify/functions/get-videos.js
// This runs on Netlify's server, not in the browser.
// The Vimeo token below is read from an environment variable
// you set in the Netlify dashboard — it never appears in your
// GitHub repository or in the page source seen by visitors.

exports.handler = async function (event, context) {
  const VIMEO_TOKEN = process.env.VIMEO_TOKEN;
  const VIMEO_USER_ID = "262005074";
  const PER_PAGE = 25;

  if (!VIMEO_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing VIMEO_TOKEN environment variable" })
    };
  }

  try {
    const res = await fetch(
      `https://api.vimeo.com/users/${VIMEO_USER_ID}/videos?per_page=${PER_PAGE}&sort=date&direction=desc`,
      {
        headers: {
          Authorization: `bearer ${VIMEO_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Vimeo API error: ${res.status}` })
      };
    }

    const data = await res.json();

    const simplified = (data.data || []).map((video) => ({
      id: video.uri.split("/").pop(),
      name: video.name,
      description: video.description,
      width: video.width,
      height: video.height
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videos: simplified })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
