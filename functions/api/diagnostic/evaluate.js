export const onRequestPost = async (context) => {
  try {
    const body = await context.request.json();

    return new Response(JSON.stringify({
      ok: true,
      message: "API funcionando",
      received: body
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "Invalid request"
    }), { status: 400 });
  }
};