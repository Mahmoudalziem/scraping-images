import fs from 'fs';
import path from 'path';
import XLSX from "xlsx";
import express from 'express';
import Scraper from '../lib/scraper';

const router = express.Router();

router.get('/', async(req, res) => {

    console.log("start");

    const file = path.resolve('products1.xlsx');

    let fileData = XLSX.read(file, {
        type: "file"
    });

    const lengthItems = 20;

    const sheetName = fileData.SheetNames[0];

    const worksheet = fileData.Sheets[sheetName];

    const worksheetObj = XLSX.utils.sheet_to_json(worksheet, { raw: true });

    let dataOfProducts = [];

    for (const [index, data] of worksheetObj.entries()) {

        dataOfProducts.push(data["أسم المنتج"]);
    }

    dataOfProducts = new Array(Math.ceil(dataOfProducts.length / lengthItems)).fill().map(_ => dataOfProducts.splice(0, lengthItems));

    // return console.log(dataOfProducts);

    const google = new Scraper();

    const images = [];

    for (let i = 0; i < dataOfProducts.length; i++) {

        const results = await google.scrape(dataOfProducts[i], 3);

        results.map((item) => {

            const itemImages = [];

            item.images.map(image => itemImages.push(image.url));

            return images.push({
                "اسم المنتج": item.query,
                "صورة المنتج": itemImages.join(',')
            });

        });
    }



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

    // return console.log(results);


});

export default router;