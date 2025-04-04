export const getUserPosts = async (
  base_domain: string,
  base_api_path: string,
  serviceId: string,
  userId: string,
  offset: number = 0,
) => {
  const reqUrl = new URL(base_api_path.trim(), base_domain.trim());

  if (reqUrl.pathname.charAt(reqUrl.pathname.length - 1) != "/") {
    reqUrl.pathname += "/";
  }

  reqUrl.pathname += `${serviceId.trim()}/user/${userId.trim()}`;
  reqUrl.searchParams.append("o", offset.toString());

  return await fetch(reqUrl);
};

export const iterateUserPosts = async function* (
  base_domain: string,
  base_api_path: string,
  service_name: string,
  userId: string,
  from: number = 0,
  to: number = 0,
  limit: number = -1,
): AsyncGenerator<{ pageIndex: number; page: object }> {
  for (let i = from; (to == -1 ? true : i <= to); i++) {
    if (limit == 0) break;

    const posts_res = await getUserPosts(
      base_domain,
      base_api_path,
      service_name,
      userId,
      50 * i,
    );
    const posts = await posts_res.json();

    if (posts.length == 0) break;

    for (const post of posts) {
      if (limit == 0) break;
      yield { pageIndex: i, page: post };
      if (limit != -1) --limit;
    }
  }
};

export const makeFileLink = (base_domain: string, path: string) => {
  // TODO: Support for thumbnails

  if (path.slice(0, 5) != "/data") path = "/data" + path;

  const reqUrl = new URL(path, base_domain);

  return reqUrl;
};
