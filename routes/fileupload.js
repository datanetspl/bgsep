var express = require('express');

var multer = require('multer');

var router = express.Router();

const axios = require('axios');
var os = require("os");
var path = require('path');
const { writeFileSync } = require("fs")

const FormData = require('form-data');

const fetch = require("node-fetch");
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
console.log(appDir);
async function getImageFileFromUrl(url) {
	let response = await fetch(url);
	let data = await response.blob();
	let metadata = {
		type: "image/jpeg"
	};
	return new File([data], "result.jpg", metadata);
}

router.get("/", function (request, response, next) {

	response.render('fileupload', { title: '', message: request.flash('success') });

});

router.post("/", function (request, response, next) {
	//console.log(request);
	var storage = multer.diskStorage({

		destination: function (request, file, callback) {
			callback(null, './upload');
		},
		filename: function (request, file, callback) {
			var temp_file_arr = file.originalname.split(".");

			var temp_file_name = temp_file_arr[0];

			var temp_file_extension = temp_file_arr[1];

			callback(null, temp_file_name + '-' + Date.now() + '.' + temp_file_extension);
		}

	});

	var upload = multer({ storage: storage }).single('sample_image');

	upload(request, response, function (error) {

		if (error) {
			return response.end('Error Uploading File');
		}
		else {
			//request.flash('success', request.file.filename);
			console.log(request.file.filename);
			//console.log("uploaded", Object.keys(request));
			let data = new FormData();
			//data.append('uploaded-file', request.file);
			data.append('uploaded-file', path.join(request.headers.host, request.file.path));

			//data.append("uploaded-file", "http://localhost:3000/upload/CaptureC4-1688283339151.JPG")

			//console.log("data", path.join(request.headers.host, request.file.path));
			axios.post("http://127.0.0.1:5000/post", data, {
				headers: {
					'accept': 'application/json',
					'Accept-Language': 'en-US,en;q=0.8',
					'Content-Type': `text/plain`,
				}
			}).then((res) => {
				//console.log("res", Object.keys(res), res.data.img);
				const image = Buffer.from(res.data.img, "base64")
				writeFileSync("upload/image.png", image)
				request.flash('success', "image.png");
				response.redirect("/fileupload");
			});
			//response.redirect("/fileupload");

			//response.redirect("/fileupload");

			//return response.end('File is uploaded successfully');
		}

	});




});

module.exports = router;