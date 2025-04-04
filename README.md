# Nosori

![](https://i.imgur.com/FNjIHE4.png) ![](https://i.imgur.com/9GSXx0f.png)
![](https://i.imgur.com/4it7c8c.jpeg)

Nosori is a HTTP and WebSocket server based online image viewer for <https://coomer.su> and
<https://kemono.su>. It embeds all images and videos from a user in a single
page--making it a very convenient experience to view them all.

# Docker

```bash
docker compose -p nosori up
```

You can export `PORT` environment variable. By default it is `9898`.

# Without Docker

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src
```

This project was created using `bun init` in [Bun](https://bun.sh) v1.1.43.
