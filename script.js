import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import Scraper from 'images-scraper';
import XLSX from "xlsx";
import fs from 'fs'

const app = express();

dotenv.config();

app.use(express.urlencoded({ extended: true }));

app.use(express.json({ limit: '500MB' }));

app.use(async(req, res, next) => {

    const file = path.resolve('products.xlsx');

    let fileData = XLSX.read(file, {
        type: "file"
    });

    const sheetName = fileData.SheetNames[0];

    const worksheet = fileData.Sheets[sheetName];

    const worksheetObj = XLSX.utils.sheet_to_json(worksheet, { raw: true });

    let dataOfProducts = [];

    // console.log(worksheetObj);

    for (const [index, data] of worksheetObj.entries()) {

        dataOfProducts.push(data['أسم المنتج']);
    }

    const google = new Scraper({
        puppeteer: {}
    });

    const images = [];

    const results = await google.scrape(dataOfProducts, 3);

    results.map((item) => {

        const itemImages = {};

        item.images.map((image, key) => {

            return itemImages[key] = image ? image.url : null;
        });

        return images.push(itemImages);

    });

    if (images.length > 0) {

        const pro = XLSX.utils.json_to_sheet(images);

        const proImages = {
            Sheets: { "Porducts_images": pro },
            SheetNames: ["Porducts_images"],
        };

        if (fs.existsSync(path.resolve('images.xlsx'))) fs.rmdirSync(path.resolve('images.xlsx'), { recursive: true });

        XLSX.writeFile(proImages, path.resolve('images.xlsx'), {
            bookType: "xlsx",
            type: "array",
        });

        fs.writeFile("images.json", images, 'utf8', function(err) {

            console.log("JSON file has been saved.");

        });

    }

    next();
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {

    console.log(`Example app listening on PORT ${PORT}`)
})