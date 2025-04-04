async function* iterateNosoriWS(kind, args) {
  const socket = new WebSocket("/ws");
  const queue = [];
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      console.log("Connected to WebSocket server");
      socket.send(JSON.stringify({ kind: kind, args: args }));
      resolve();
    });

    socket.addEventListener("error", (err) => reject(err));
  });

  socket.addEventListener("message", (event) => {
    queue.push(event.data.toString());
  });

  while (true) {
    if (queue.length > 0) {
      yield queue.shift();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

async function* iterateUserMedia(
  baseDomain,
  baseApiPath,
  serviceName,
  userId,
  from,
  to,
  limit,
) {
  const data = {
    kind: "iterateUserMedia",
    args: {
      userId: userId,
      from: from,
      to: to,
      limit: limit,
      baseDomain: baseDomain,
      baseApiPath: baseApiPath,
      serviceName: serviceName,
    },
  };

  for await (const url of iterateNosoriWS(...Object.values(data))) {
    yield url;
  }
}

async function* take(ait, n) {
  chunk = [];
  iterations = 0;
  for await (const entry of ait) {
    if (iterations % n == 0) {
      yield chunk;
      chunk = [];
    }
    chunk.push(entry);
    iterations++;
  }
  if (chunk.length > 0) yield chunk;
}

function asleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMediaType(fileName, includeMime = false) {
  const mimeTypes = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "svg": "image/svg+xml",

    "mp4": "video/mp4",
    "mov": "video/quicktime",
    "avi": "video/x-msvideo",
    "mkv": "video/x-matroska",
    "webm": "video/webm",
    "flv": "video/x-flv",
    "wmv": "video/x-ms-wmv",
  };

  const extension = fileName
    .split(/[#?]/)[0]
    .split(".")
    .pop()
    ?.toLowerCase();

  if (!extension || !mimeTypes[extension]) return null;

  return includeMime
    ? { type: mimeTypes[extension].split("/")[0], mime: mimeTypes[extension] }
    : mimeTypes[extension].split("/")[0];
}

async function showMedia(
  baseDomain,
  baseApiPath,
  serviceName,
  userId,
  from,
  to,
  limit,
  lookahead,
) {
  console.log(
    "Showing for baseDomain=%s baseApiPath=%s serviceName=%s userId=%s from=%s to=%s limit=%s",
    baseDomain,
    baseApiPath,
    serviceName,
    userId,
    from,
    to,
    limit,
  );

  media_container = document.querySelector("div.media");
  if (!media_container) {
    console.warn("Media container not found.");
    return;
  }

  let cycle = 0;
  const k = lookahead;

  for await (
    const urls of take(
      iterateUserMedia(
        baseDomain,
        baseApiPath,
        serviceName,
        userId,
        from,
        to,
        limit,
      ),
      k,
    )
  ) {
    console.log("Cycle: %s", cycle);

    let loaded = urls.length;

    for (url of urls) {
      const media_type = getMediaType(url);

      console.log("URL: %s", url);
      console.log("media type: %s", media_type);

      const ele = document.createElement(
        media_type == "image" ? "img" : "video",
      );
      ele.src = url;

      if (media_type == "image") {
        ele.loading = "eager";

        ele.onload = () => {
          console.log(`(${cycle}) (${loaded}) An image has been loaded.`);
          loaded--;
        };

        ele.onerror = () => {
          console.log(`(${cycle}) (${loaded}) An image has failed to load.`);
          loaded--;
        };
      } else {
        ele.autoplay = false;
        ele.controls = true;

        console.log("Found a video, sourcing it and continuing...");

        loaded--;
      }

      media_container.appendChild(ele);
    }

    while (loaded > 0) {
      await asleep(100);
    }

    cycle++;
  }
}
