exports.handler = async function(event) {
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    console.log("KEY LENGTH:", key ? key.length : "UNDEFINED");
    console.log("KEY START:", key ? key.substring(0, 15) : "UNDEFINED");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: event.body
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    return {
      statusCode: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch(e) {
    console.log("ERROR:", e.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: e.message } })
    };
  }
};
