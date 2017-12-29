const {minify} = require("uglify-js");
const util = require("util");
const fs = require("fs");

const fsp = {
	stat: util.promisify(fs.stat),
	readFile: util.promisify(fs.readFile),
	writeFile: util.promisify(fs.writeFile),
};


exports.build = async function() {
	const jsFiles = ["es6-promise.auto.js", "jquery.js", "bootstrap.js", "databind.js", "components.js"].map(file => `web/js/${file}`);
	const outFile = "web/js/pack.js";
	const outFileMin = "web/js/pack.min.js";

	const areNewer = await Promise.all(jsFiles.map(file => isNewer(file, outFile)));
	if (!areNewer.some(x => x)) {
		console.log("No changes");
		return;
	}

	const str = fs.createWriteStream(outFile);
	for (const file of jsFiles) await copyStream(fs.createReadStream(file), str);
	str.end();

	const {error, code} = minify(await fsp.readFile(outFile, "utf8"));
	if (error) {
		console.log(error);
		return;
	}
	await fsp.writeFile(outFileMin, code);
}


async function isNewer(srcFile, dstFile) {
	const srcStat = await fsp.stat(srcFile);
	try {
		const dstStat = await fsp.stat(dstFile);
		return srcStat.mtime > dstStat.mtime;
	}
	catch (err) {
		return true;
	}
}

function copyStream(src, dst) {
	return new Promise(function(fulfill, reject) {
		src.pipe(dst, {end: false});
		src.on("error", reject);
		src.on("end", fulfill);
	})
}

if (require.main == module) {
	const task = process.argv[2];
	if (task) exports[task]();
	else console.error("No task specified");
}
