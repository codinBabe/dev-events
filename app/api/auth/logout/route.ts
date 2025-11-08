export const POST = async () => {
  return new Response(JSON.stringify({ message: "Logged out successfully" }), {
    status: 200,
    headers: {
      "Set-Cookie": `admin_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
      "Content-Type": "application/json",
    },
  });
};
