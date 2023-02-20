const qr = require("qrcode");
const { createCanvas, loadImage, Image } = require("canvas");
const fs = require("fs");
const path = require("path");
const express = require("express");
const jsPDF = require("jspdf");

const app = express();
const filenames = [];
const urls = [];

for (let i = 1; i <= 50; i++) {
  urls.push(
    "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.theguardian.com%2Flifeandstyle%2F2020%2Fsep%2F05%2Fwhat-cats-mean-by-miaow-japans-pet-guru-knows-just-what-your-feline-friend-wants&psig=AOvVaw0wtz5S_FOqgombTeKV4ZvL&ust=1676775925752000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCJD3rp2Lnv0CFQAAAAAdAAAAABAE"
  );
}
async function generateQRCodes(urls) {
    const directoryPath = './qrcodes';
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }
  
    for (let i = 0; i < urls.length; i++) {
      try {
        const qrCode = await qr.toDataURL(urls[i]);
        const filePath = path.join(directoryPath, `qr${i}.png`);
        await fs.writeFileSync(filePath, qrCode.replace(/^data:image\/png;base64,/, ''), 'base64');
      } catch (err) {
        console.error(`Error generating QR code for ${urls[i]}`, err);
      }
    }
  }
async function drawQRCodesOnA4(qrCodesDirectory) {
  const qrCodeWidth = 150; // pixels
  const qrCodeHeight = 150; // pixels
  const qrCodesPerPage = 35;
  const qrCodesPerRow = 5;
  const qrCodePadding = 5; // pixels
  const a4Width = 794; // pixels
  const a4Height = 1123; // pixels

  const canvas = createCanvas(a4Width, a4Height);
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const files = fs.readdirSync(qrCodesDirectory);
  const qrCodeCount = Math.min(files.length, qrCodesPerPage);
  const rows = Math.ceil(qrCodeCount / qrCodesPerRow);
  const cols = Math.min(qrCodeCount, qrCodesPerRow);

  for (let i = 0; i < qrCodeCount; i++) {
    const file = files[i];
    const row = Math.floor(i / qrCodesPerRow);
    const col = i % qrCodesPerRow;
    const x = (a4Width - cols * (qrCodeWidth + qrCodePadding) + qrCodePadding) / 2 + col * (qrCodeWidth + qrCodePadding);
    const y = (a4Height - rows * (qrCodeHeight + qrCodePadding) + qrCodePadding) / 2 + row * (qrCodeHeight + qrCodePadding);

    try {
      const image = await loadImage(path.join(qrCodesDirectory, file));
      context.drawImage(image, x, y, qrCodeWidth, qrCodeHeight);
    } catch (err) {
      console.error(`Error loading image ${file}`, err);
    }
  }
  const dataUrl = canvas.toBuffer("image/png");
  fs.writeFileSync("./output/output.png", dataUrl);
}
app.get("/makesheets", async (req, res) => {
  await generateQRCodes(urls);
  await drawQRCodesOnA4('./qrcodes');
  console.log(filenames);
  res.send("success");
});

app.listen(4000, () => {
  console.log("Serving on port 4000");
});
