/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { createTicketAttestation } from "./attestation";
import QRCode from "qrcode";
// import { User } from "./index";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: "Frog Frame",
});

const userDetails = new Map();

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

const base_url = "http://localhost:8000";

//to acess frame - ?movieTitle=Avengers:%20Endgame&theatreName=PVR%20Cinemas&showTime=19:00
app.frame("/movie", async (c) => {
  const urlParams = new URLSearchParams(c.req.url.split("?")[1]);
  console.log("URL params: ", urlParams);
  const theatre = urlParams.get("theatreName") || "PVR Cinemas";
  const movieTitle = urlParams.get("movieTitle") || "Avengers: Endgame";
  const showTime = urlParams.get("showTime") || "19:00";

  userDetails.set("theatre", theatre);
  userDetails.set("movie", movieTitle);
  userDetails.set("showTime", showTime);

  // const existingUser = await User.findOne({ "user1" });
  // if (!existingUser) {
  //   const newUser = new User({
  //     "user1",
  //     theatre: '',
  //     movie: '',
  //     showTime: '',
  //     selectedSeats: [],
  //     attestationId: '',
  //     txHash: '',
  //     indexingValue: ''
  //   });
  //   await newUser.save();
  // }

  // // update user theatre, movie and showtime
  // await User.updateOne(
  //   { "user1 "},

  // );

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

  userDetails.set("selectedSeats", selectedSeats);

  return c.res({
    action: "/movie/summary",
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
      <Button
        action={`/movie?movieTitle=${movieTitle}&theatreName=${theatre}&showTime=${showTime}`}
      >
        Confirm
      </Button>,
      <Button key="book">Book</Button>,
      // <Button.Transaction value="confirm">Confirm Booking</Button.Transaction>,
      <Button.Reset>Reset Selection</Button.Reset>,
    ],
  });
});

app.frame("/movie/summary", async (c) => {
  // const theatre = "INOX";
  // const movieTitle = "Inception";
  // const showTime = "19:00";
  // const selectedSeats = ["A1", "A5"];

  const theatre = userDetails.get("theatre");
  const movieTitle = userDetails.get("movie");
  const showTime = userDetails.get("showTime");
  const selectedSeats = userDetails.get("selectedSeats");

  const ticketPrice = 200;
  const totalAmount = ticketPrice * selectedSeats.length;
  const convenienceFee = Math.round(totalAmount * 0.0175);
  const finalAmount = totalAmount + convenienceFee;

  const res = await createTicketAttestation(
    theatre,
    movieTitle,
    showTime,
    selectedSeats,
    finalAmount
  );

  userDetails.set("attestationId", res.attestationId);
  userDetails.set("txHash", res.txHash);
  userDetails.set("indexingValue", res.indexingValue);

  console.log("attestationId", res.attestationId);
  console.log("txHash", res.txHash);
  console.log("indexingValue", res.indexingValue);

  return c.res({
    action: "/movie/username",
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
      // <Button>Pay ₹{finalAmount.toString()}</Button>,
      <Button key="pay">Pay ₹{finalAmount.toString()}</Button>,
    ],
  });
});

app.frame("/movie/username", async (c) => {
  const { buttonValue, inputText, status } = c;

  userDetails.set("name", inputText);

  return c.res({
    action: "/movie/phone",
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          We Need Your Name, Please!!
        </div>
      </div>
    ),
    intents: [
      <TextInput key="input" placeholder="Enter Name (e.g., Andy)" />,
      <Button value="submit" action="/movie/phone">
        Submit
      </Button>,
      status === "response" && <Button.Reset>Reset</Button.Reset>,
    ],
  });
});

app.frame("/movie/phone", async (c) => {
  const { buttonValue, inputText, status } = c;

  userDetails.set("phone", inputText);

  return c.res({
    action: "/movie/ticket",
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          We Need Your Phone Number, Please!!
        </div>
      </div>
    ),
    intents: [
      <TextInput key="input" placeholder="Enter your phone (e.g., 12345)" />,
      <Button value="submit" action="/movie/ticket">
        Submit
      </Button>,
      status === "response" && <Button.Reset>Reset Phone</Button.Reset>,
    ],
  });
});

app.frame("/movie/ticket", async (c) => {
  const long_url = `https://testnet-scan.sign.global/attestation/onchain_evm_534351_${userDetails.get(
    "attestationId"
  )}`;

  console.log("Long url: ", long_url);

  const response = await fetch(
    `https://s.squizee.in/short/formResponse?url=${long_url}&email=&format=json&suffix=`
  );
  const result = await response.json();
  const short_url = result.shortened_url;
  // Generate QR code as a data URL (base64 image)
  const qrCodeDataURL = await QRCode.toDataURL(short_url, {
    width: 256,
    margin: 4,
  });
  console.log(qrCodeDataURL);
  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "white",
          color: "#e0e0e0",
          display: "flex",
          flexWrap: "wrap",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          padding: "16px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "20px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            marginBottom: "16px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              color: "black",
              fontSize: "40px",
              fontWeight: "700",
              marginBottom: "6px",
            }}
          >
            {userDetails.get("movie")}
          </div>
          <div
            style={{
              color: "black",
              fontSize: "30px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>🕒 {userDetails.get("showTime")}</span>
            <span>•</span>
            <span>{userDetails.get("selectedSeats").join(", ")}</span>
          </div>
        </div>

        {/* QR Code */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "20px",
            padding: "12px",
            background: "#2d2d2d",
            borderRadius: "12px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <img
            src={qrCodeDataURL}
            alt="QR Code"
            style={{
              border: "1px solid #444",
              borderRadius: "10px",
              height: "200px",
              width: "200px",
            }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            padding: "16px",
            background: "#2d2d2d",
            borderRadius: "16px",
            width: "90%",
            marginTop: "20px",
            justifyContent: "center",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{ color: "#22c55e", fontWeight: "800", fontSize: "20px" }}
          >
            ✓ Ticket Confirmed for Manvith
          </div>
        </div>
      </div>
    ),
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);

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
