import fs from 'fs';
import path from 'path';
import XLSX from "xlsx";
import express from 'express';
import Scraper from './scraper';

const router = express.Router();

router.get('/', async(req, res) => {

    const file = path.resolve('products1.xlsx');

    let fileData = XLSX.read(file, {
        type: "file"
    });

    const sheetName = fileData.SheetNames[0];

    const worksheet = fileData.Sheets[sheetName];

    const worksheetObj = XLSX.utils.sheet_to_json(worksheet, { raw: true });

    let dataOfProducts = [];

    for (const [index, data] of worksheetObj.entries()) {

        dataOfProducts.push(data["أسم المنتج"]);
    }

    const google = new Scraper();

    const images = [];

    const results = await google.scrape(dataOfProducts, 3);


    // return console.log(results);

    results.map((item) => {

        const itemImages = [];

        item.images.map((image, key) => {

            return itemImages.push(image.url);
        });

        return images.push({
            "اسم المنتج": item.query,
            "صورة المنتج": itemImages.join(',')
        });

    });

    if (images.length > 0) {

        const pro = XLSX.utils.json_to_sheet(images);

        const proImages = {
            Sheets: { "Porducts_images": pro },
            SheetNames: ["Porducts_images"],
        };

        if (fs.existsSync(path.join('images.xlsx'))) fs.rmdirSync(path.join('images.xlsx'), { recursive: true });

        XLSX.writeFile(proImages, path.join('images.xlsx'), {
            bookType: "xlsx",
            type: "array",
        });

        fs.writeFile("images.json", JSON.stringify(images), 'utf8', function(err) {

            console.log("JSON file has been saved.");

        });
    }

    res.send(images);
});

export default router;