// Custom Router for Action Param
async function routeActionMiddleware(routeName, handler) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.has("action") && urlParams.get("action") === routeName) {
    handler(urlParams);
  }
}
