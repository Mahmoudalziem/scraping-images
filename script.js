import dotenv from 'dotenv'
import path from 'path'
import Scraper from 'images-scraper';
import XLSX from "xlsx";
import fs from 'fs'

dotenv.config();


fs.readFile('./products.xlsx', 'utf8', async(err, data) => {

    if (err) throw (err);

    // console.log(data);

    let fileData = XLSX.read(data, {
        type: "base64"
    });

    const sheetName = fileData.SheetNames[0];

    const worksheet = fileData.Sheets[sheetName];

    const worksheetObj = XLSX.utils.sheet_to_json(worksheet, { raw: true });

    let dataOfProducts = [];

    for (const [index, data] of worksheetObj.entries()) {

        dataOfProducts.push(data['أسم المنتج']);
    }

    const google = new Scraper();

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

        if (fs.existsSync(path.join('images.xlsx'))) fs.rmdirSync(path.join('images.xlsx'), { recursive: true });

        XLSX.writeFile(proImages, path.join('images.xlsx'), {
            bookType: "xlsx",
            type: "array",
        });

        fs.writeFile("images.json", JSON.stringify(images), 'utf8', function(err) {

            console.log("JSON file has been saved.");

        });

    }
});