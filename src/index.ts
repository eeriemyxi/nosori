import * as api from "./api.ts";
import * as constants from "./const.ts";
import * as utils from "./utils.ts";
import * as pug from "pug";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { createBunWebSocket } from "hono/bun";
import {getCookie,setCookie} from 'hono/cookie'

const { upgradeWebSocket, websocket } = createBunWebSocket();
const app = new Hono();

app.use("/static/*", serveStatic({ root: constants.STATIC_FILES_PATH }));

const ws = app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      async onMessage(event, ws) {
        const req = JSON.parse(event.data.toString());
        console.log(req);

        const args = req.args;

        switch (req.kind) {
          case "iterateUserMedia":
            for await (
              const post of api.iterateUserPosts(
                args.userId,
                args.from,
                args.to,
                args.limit,
              )
            ) {
              console.log(post);

              if (!utils.isObjEmpty(post.page.file)) {
                ws.send(api.makeFileLink(post.page.file.path).toString());
              }
              for (const attachment of post.page.attachments) {
                ws.send(api.makeFileLink(attachment.path).toString());
              }
            }
            break;
        }
      },
      onClose: () => {
        console.log("Connection closed");
      },
    };
  }),
);

app.get("/", async (c) => {
  const from_ = getCookie(c, 'from') || 0
  const to = getCookie(c, 'to') || -1
  const limit = getCookie(c, 'limit') || -1
  const lookahead = getCookie(c, 'lookahead') || 5

  return c.html(
    pug.compileFile(`${constants.TEMPLATES_PATH}/main.pug`)({
      from: from_,
      to: to,
      limit: limit,
      lookahead: lookahead,
    }
    ),
  );
});

app.get("/media", async (c) => {
  const query = c.req.query();
  const oneYearInSeconds = 60 * 60 * 24 * 365

  setCookie(c, 'from', query.from || 0, { maxAge: oneYearInSeconds })
  setCookie(c, 'to', query.to || -1, { maxAge: oneYearInSeconds })
  setCookie(c, 'limit', query.limit || -1, { maxAge: oneYearInSeconds })
  setCookie(c, 'lookahead', query.lookahead || 5, { maxAge: oneYearInSeconds })

  return c.html(
    pug.compileFile(`${constants.TEMPLATES_PATH}/show-media.pug`)({
      userId: query.userId,
      from: query.from,
      to: query.to,
      limit: query.limit,
      lookahead: query.lookahead,
    }),
  );
});

export default {
  host: Bun.env.HOST ?? "0.0.0.0",
  port: Bun.env.PORT ?? 9090,
  fetch: app.fetch,
  websocket,
};
