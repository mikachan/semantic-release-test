import fs from 'fs';
import replace from 'replace-in-file';

(async function start() {
	let args = process.argv.slice(2);
	let command = args[0];
	switch (command) {
		case "version-bump-stylecss": return versionBumpStyleCss();
	}
	return showHelp();
})();


/*
 Update version number in style.css and style-child-theme.css for each theme
 after version bump from conventional commits (via Lerna)
 Used by Lerna via update-stylecss command
*/
async function versionBumpStyleCss() {
	let packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
	let newVersion = packageJson.version;
	let styleCss = fs.existsSync('./style.css') ? './style.css' : '';
	let styleChildThemeCss = fs.existsSync('./style-child-theme.css') ? './style-child-theme.css' : '';
	let files = [styleCss, styleChildThemeCss].filter(Boolean);

	await replace({
		files,
		from: /(?<=Version:\s*).*?(?=\s*\r?\n|\rg)/gs,
		to: ` ${newVersion}`,
	});
}
