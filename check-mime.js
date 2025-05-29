// Simple script to check MIME types of deployed files
const url = "https://f.github.io/nist-beacon-rng/assets/";

async function checkMimeType() {
  try {
    // Get the current deployed file
    const response = await fetch(url);
    const html = await response.text();

    // Extract the JS file name from the HTML
    const jsMatch = html.match(/assets\/(index-[^"]+\.js)/);
    if (jsMatch) {
      const jsFile = jsMatch[1];
      const jsUrl = url + jsFile;

      console.log("Checking:", jsUrl);

      const jsResponse = await fetch(jsUrl, { method: "HEAD" });
      const contentType = jsResponse.headers.get("content-type");

      console.log("Content-Type:", contentType);
      console.log("Status:", jsResponse.status);

      if (contentType && contentType.includes("video/mp2t")) {
        console.log("❌ MIME type issue detected!");
      } else if (
        contentType &&
        (contentType.includes("javascript") ||
          contentType.includes("text/plain"))
      ) {
        console.log("✅ MIME type looks correct");
      } else {
        console.log("⚠️ Unexpected MIME type");
      }
    }
  } catch (error) {
    console.error("Error checking MIME type:", error);
  }
}

checkMimeType();
