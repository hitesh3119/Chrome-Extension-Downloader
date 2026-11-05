// Netlify Serverless Function: Chrome Extension CRX & ZIP Downloader
// Compatible with Netlify Functions v2 (Node 18+)

export default async (request, context) => {
  // Handle CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const url = new URL(request.url);
  const inputParam = url.searchParams.get("url") || url.searchParams.get("id") || "";
  const format = (url.searchParams.get("format") || "zip").toLowerCase();
  const nameParam = url.searchParams.get("name") || "";

  // Extract 32-character extension ID using regex
  // Chrome Extension IDs always consist of 32 characters between 'a' and 'p'
  const idMatch = inputParam.match(/([a-p]{32})/i);
  if (!idMatch) {
    return new Response(
      JSON.stringify({
        error: "Invalid extension ID or Chrome Web Store URL provided. Extension ID must be a 32-character string (e.g. lankjdlpcafockikacbnbdngppglhjim).",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  const extensionId = idMatch[1].toLowerCase();

  // Official Google Chrome Web Store CRX download endpoint
  const googleCrxUrl =
    `https://clients2.google.com/service/update2/crx?response=redirect` +
    `&prodversion=9999.0.0.0&os=win&arch=x86-64&nacl_arch=x86-64` +
    `&acceptformat=crx2,crx3&x=id%3D${extensionId}%26installsource%3Dondemand%26uc`;

  try {
    const fetchResponse = await fetch(googleCrxUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    if (!fetchResponse.ok || fetchResponse.status === 204) {
      return new Response(
        JSON.stringify({
          error:
            "Extension not found on Chrome Web Store or download unavailable for this item.",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const arrayBuffer = await fetchResponse.arrayBuffer();
    const crxBuffer = Buffer.from(arrayBuffer);

    if (crxBuffer.length < 16) {
      return new Response(
        JSON.stringify({ error: "Received incomplete or corrupt data from store." }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Determine filename
    const safeName = nameParam
      ? nameParam.replace(/[^a-zA-Z0-9_-]/g, "_")
      : extensionId;

    // If user wants raw CRX
    if (format === "crx") {
      const crxBytes = new Uint8Array(crxBuffer);
      return new Response(crxBytes, {
        status: 200,
        headers: {
          "Content-Type": "application/x-chrome-extension",
          "Content-Length": crxBytes.length.toString(),
          "Content-Disposition": `attachment; filename="${safeName}.crx"`,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Default: Extract ZIP payload from CRX binary
    let zipOffset = -1;

    // Check if it's already a standard zip (starts with PK\x03\x04)
    if (
      crxBuffer[0] === 0x50 &&
      crxBuffer[1] === 0x4b &&
      crxBuffer[2] === 0x03 &&
      crxBuffer[3] === 0x04
    ) {
      zipOffset = 0;
    } else {
      const magic = crxBuffer.subarray(0, 4).toString("utf8");
      if (magic === "Cr24") {
        const version = crxBuffer.readUInt32LE(4);
        if (version === 3) {
          const headerLength = crxBuffer.readUInt32LE(8);
          const candidate = 12 + headerLength;
          if (
            candidate + 3 < crxBuffer.length &&
            crxBuffer[candidate] === 0x50 &&
            crxBuffer[candidate + 1] === 0x4b &&
            crxBuffer[candidate + 2] === 0x03 &&
            crxBuffer[candidate + 3] === 0x04
          ) {
            zipOffset = candidate;
          }
        } else if (version === 2) {
          const pubKeyLength = crxBuffer.readUInt32LE(8);
          const sigLength = crxBuffer.readUInt32LE(12);
          const candidate = 16 + pubKeyLength + sigLength;
          if (
            candidate + 3 < crxBuffer.length &&
            crxBuffer[candidate] === 0x50 &&
            crxBuffer[candidate + 1] === 0x4b &&
            crxBuffer[candidate + 2] === 0x03 &&
            crxBuffer[candidate + 3] === 0x04
          ) {
            zipOffset = candidate;
          }
        }
      }

      // Fallback: Scan for the first PK\x03\x04 signature
      if (zipOffset === -1) {
        const pkMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
        zipOffset = crxBuffer.indexOf(pkMagic);
      }
    }

    if (zipOffset < 0 || zipOffset >= crxBuffer.length) {
      return new Response(
        JSON.stringify({ error: "Could not locate valid ZIP payload inside CRX file." }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Create a clean, independent Uint8Array for the ZIP payload
    const zipSlice = crxBuffer.subarray(zipOffset);
    const cleanZipBytes = new Uint8Array(zipSlice.length);
    cleanZipBytes.set(zipSlice);

    return new Response(cleanZipBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Length": cleanZipBytes.length.toString(),
        "Content-Disposition": `attachment; filename="${safeName}.zip"`,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Failed to download or unpack extension",
        details: err.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

