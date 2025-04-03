import * as constants from "./const.ts";

export const getUserPosts = async (
  serviceId: string,
  userId: string,
  offset: number = 0,
) => {
  const reqUrl = new URL(constants.BASE_API_URL);
  reqUrl.pathname += `${serviceId}/user/${userId}`;
  reqUrl.searchParams.append("o", offset.toString());

  return await fetch(reqUrl);
};

export const iterateUserPosts = async function* (
  userId: string,
  from: number = 0,
  to: number = 0,
  limit: number = -1,
): AsyncGenerator<{ pageIndex: number; page: object }> {
  for (let i = from; (to == -1 ? true : i <= to); i++) {
    if (limit == 0) break;

    const posts_res = await getUserPosts(
      constants.SERVICE_NAME,
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

export const makeFileLink = (path: string) => {
  const reqUrl = new URL(path, constants.BASE_URL);
  return reqUrl;
};
