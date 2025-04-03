# Nosori

![](https://i.imgur.com/CsbGEtk.png) ![](https://i.imgur.com/4it7c8c.jpeg)

Nosori is a web-server based image crawler for <https://coomer.su>. It displays
them in a separate page one after another very efficiently.

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
