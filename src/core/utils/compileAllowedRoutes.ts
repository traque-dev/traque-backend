import { pathToRegexp } from 'core/utils/pathToRegexp';

import { HttpRequestMethod } from 'models/types/HttpRequestMethod';

import type { Request } from 'express';

type AllowedRouteBase = {
  method: HttpRequestMethod;
  path: string;
};

export type AllowedRoute = AllowedRouteBase & {
  regex: RegExp;
};

export function compileAllowedRoutes(
  routes: AllowedRouteBase[],
): AllowedRoute[] {
  return routes.map((route) => ({
    ...route,
    regex: pathToRegexp(route.path).regexp,
  }));
}

export function isAllowedRoute(allowedRoutes: AllowedRoute[], req: Request) {
  return allowedRoutes.some((route) => {
    return (
      route.method === (req.method as HttpRequestMethod) &&
      route.regex.test(req.path)
    );
  });
}
