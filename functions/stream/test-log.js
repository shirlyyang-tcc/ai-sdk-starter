export function onRequest(context) {
  console.log("test-log");
  return new Response("test-log");
}