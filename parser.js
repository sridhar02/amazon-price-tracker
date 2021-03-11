require("dotenv").config();

const nightmare = require("nightmare")();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const args = process.argv.slice(2);
const url =
  args[0] ||
  "https://www.amazon.in/Lenovo-IdeaPad-15-6-inch-Graphics-82EY00JTIN/dp/B08SK1CVFG";
const minPrice = args[1] || 850000;

async function checkPrice() {
  try {
    const priceString = await nightmare
      .goto(url)
      .wait("#priceblock_ourprice")
      .evaluate(() => document.getElementById("priceblock_ourprice").innerText)
      .end();

    const priceNumber = parseFloat(
      priceString.replace("₹", "").replace(",", "").trim()
    );

    console.log(priceNumber);

    if (priceNumber < minPrice) {
      await sendEmail(
        "Price is Low",
        `The Price on ${url} has dropped below ${minPrice}`
      );
    }
  } catch (e) {
    await sendEmail("Amazon Price Checker Error", e.message);
    throw e;
  }
}

function sendEmail(subject, body) {
  const email = {
    to: "jelot91590@ichkoch.com",
    from: "kattasridhar02@gmail.com",
    subject: subject,
    text: body,
    html: body,
  };

  return sgMail.send(email);
}

checkPrice();
