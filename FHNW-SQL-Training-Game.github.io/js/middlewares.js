// Custom Router for Action Param
async function routeActionMiddleware(routeName, handler) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.has("action") && urlParams.get("action") === routeName) {
    await handler(urlParams);
  } else if (!urlParams.has("action") && routeName.length === 0) {
    await handler(urlParams);
  }
}
