/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: 'Frog Frame',
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

const base_url = "http://localhost:8000";

//to acess frame - ?theatre=PVR Cinemas&movieTitle=Inception&showTime=19:00.
app.frame("/", async (c) => {
  const urlParams = new URLSearchParams(c.req.url.split("?")[1]);
  const theatre = urlParams.get("theatre") || "INOX";
  const movieTitle = urlParams.get("movieTitle") || "Inception";
  const showTime = urlParams.get("showTime") || "19:00";

  const { buttonValue, inputText, status } = c;

  const response = await fetch(
    `${base_url}/available-seats?movieTitle=${encodeURIComponent(
      movieTitle
    )}&theatreName=${encodeURIComponent(theatre)}&showTime=${encodeURIComponent(
      showTime
    )}`
  );
  const availableSeats = response.ok
    ? (await response.json()).availableSeats
    : [];
  const selectedSeats = inputText
    ? inputText.split(",").map((s) => s.trim())
    : [];

  return c.res({
    action: "/summary",
    image: (
      <div
        style={{
          alignItems: "center",
          background: "white",
          display: "flex",
          flexWrap: "wrap",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          padding: "24px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "12px",
            padding: "16px",
            width: "90%",
            display: "flex",
            flexDirection: "column",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              color: "#0f172a",
              fontSize: "35px",
              fontWeight: "700",
              marginBottom: "4px",
            }}
          >
            {movieTitle}
          </div>
          <div
            style={{
              color: "#64748b",
              fontSize: "30px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🕒 {showTime}</span>
            <span>•</span>
            <span>{theatre}</span>
          </div>
        </div>

        {/* Screen */}
        <div
          style={{
            width: "80%",
            height: "8px",
            background: "linear-gradient(to right, #e2e8f0, #94a3b8, #e2e8f0)",
            borderRadius: "40px",
            display: "flex",
            marginBottom: "32px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "50%",
              display: "flex",
              transform: "translateX(-50%)",
              color: "#64748b",
              fontSize: "25px",
              fontWeight: "500",
            }}
          >
            SCREEN
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "24px",
            marginBottom: "24px",
            fontSize: "20px",
            fontWeight: "500",
          }}
        >
          {[
            { color: "#3b82f6", label: "Available" },
            { color: "#22c55e", label: "Selected" },
          ].map((item) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#475569",
              }}
            >
              <div
                style={{
                  width: "12px",
                  display: "flex",
                  height: "12px",
                  background: item.color,
                  borderRadius: "4px",
                }}
              ></div>
              {item.label}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            padding: "24px",
            background: "#f8fafc",
            borderRadius: "16px",
            width: "80%",
            maxWidth: "600px",
            justifyContent: "center",
          }}
        >
          {availableSeats.slice(0, 10).map((seat: { id: any; price: any }) => (
            <div
              key={seat.id}
              style={{
                padding: "10px 8px",
                background: selectedSeats.includes(seat.id)
                  ? "#4CAF50"
                  : "#3b82f6",
                borderRadius: "8px",
                color: "white",
                fontSize: "20px",
                fontWeight: "800",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                minWidth: "60px",
                maxWidth: "60px",
                flexBasis: "60px",
                flexGrow: 1,
              }}
            >
              {`${seat.id}\n₹${seat.price}`}
            </div>
          ))}
        </div>

        {status === "response" && (
          <div
            style={{
              padding: "12px 20px",
              marginTop: "5px",
              background: "#f0fdf4",
              borderRadius: "8px",
              color: "#166534",
              fontSize: "25px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Selected: {selectedSeats.join(", ")}
          </div>
        )}
      </div>
    ),
    intents: [
      <TextInput key="input" placeholder="Enter seats (e.g., A1,A2)" />,
      <Button key="confirm" value="confirm" action="/">
        Confirm
      </Button>,
      <Button key="book">Book</Button>,
      // <Button.Transaction value="confirm">Confirm Booking</Button.Transaction>,
      <Button.Reset>Reset Selection</Button.Reset>,
    ],
  });
});

app.frame("/summary", async (c) => {
  const theatre = "INOX";
  const movieTitle = "Inception";
  const showTime = "19:00";
  const selectedSeats = ["A1", "A5"];

  const ticketPrice = 200;
  const totalAmount = ticketPrice * selectedSeats.length;
  const convenienceFee = Math.round(totalAmount * 0.0175);
  const finalAmount = totalAmount + convenienceFee;

  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          padding: "24px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: "12px",
            padding: "16px",
            width: "90%",
            display: "flex",
            flexDirection: "column",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              color: "#0f172a",
              fontSize: "35px",
              fontWeight: "700",
              marginBottom: "4px",
            }}
          >
            {movieTitle}
          </div>
          <div
            style={{
              color: "#64748b",
              fontSize: "30px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🕒 {showTime}</span>
            <span>•</span>
            <span>{theatre}</span>
          </div>
        </div>

        {/* Summary Card */}
        <div
          style={{
            width: "90%",
            maxWidth: "600px",
            background: "#f8fafc",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Selected Seats */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "20px",
              color: "#475569",
            }}
          >
            <span>Selected Seats</span>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>
              {selectedSeats.join(", ")}
            </span>
          </div>

          {/* Price Breakdown */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              borderTop: "1px solid #e2e8f0",
              borderBottom: "1px solid #e2e8f0",
              padding: "16px 0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "20px",
                color: "#475569",
              }}
            >
              <span>
                Ticket Price ({selectedSeats.length} tickets * ₹{ticketPrice})
              </span>
              <span style={{ color: "#0f172a" }}>₹{totalAmount}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "20px",
                color: "#475569",
              }}
            >
              <span>Convenience Fee (1.75%)</span>
              <span style={{ color: "#0f172a" }}>₹{convenienceFee}</span>
            </div>
          </div>

          {/* Total Amount */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "24px",
              fontWeight: "700",
              color: "#0f172a",
              padding: "8px 0",
            }}
          >
            <span>Total Amount</span>
            <span>₹{finalAmount}</span>
          </div>
        </div>
      </div>
    ),
    intents: [
      // <Button.Transaction >Pay ₹{finalAmount.toString()}</Button.Transaction>,
      <Button>Pay ₹{finalAmount.toString()}</Button>,
    ],
  });
});


devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)

// NOTE: That if you are using the devtools and enable Edge Runtime, you will need to copy the devtools
// static assets to the public folder. You can do this by adding a script to your package.json:
// ```json
// {
//   scripts: {
//     "copy-static": "cp -r ./node_modules/frog/_lib/ui/.frog ./public/.frog"
//   }
// }
// ```
// Next, you'll want to set up the devtools to use the correct assets path:
// ```ts
// devtools(app, { assetsPath: '/.frog' })
// ```
