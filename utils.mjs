import { spawn } from 'child_process';
import fs from 'fs';
import replace from 'replace-in-file';

const isWin = process.platform === 'win32';

(async function start() {
	let args = process.argv.slice(2);
	let command = args?.[0];
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
	let newVersion = await executeCommand(`node -p "require('./package.json').version"`);
	let styleCss = fs.existsSync('./style.css') ? './style.css' : '';
	let styleChildThemeCss = fs.existsSync('./style-child-theme.css') ? './style-child-theme.css' : '';
	let files = [styleCss, styleChildThemeCss].filter(Boolean);

	await replace({
		files,
		from: /(?<=Version:\s*).*?(?=\s*\r?\n|\rg)/gs,
		to: ` ${newVersion}`,
	});
}

/*
 Execute a command locally.
*/
async function executeCommand(command, logResponse) {
	return new Promise((resolove, reject) => {

		let child;
		let response = '';
		let errResponse = '';

		if (isWin) {
			child = spawn('cmd.exe', ['/s', '/c', '"' + command + '"'], {
				windowsVerbatimArguments: true,
				stdio: [process.stdin, 'pipe', 'pipe'],
			})
		} else {
			child = spawn(process.env.SHELL, ['-c', command]);
		}

		child.stdout.on('data', (data) => {
			response += data;
			if(logResponse){
				console.log(data.toString());
			}
		});

		child.stderr.on('data', (data) => {
			errResponse += data;
			if(logResponse){
				console.log(data.toString());
			}
		});

		child.on('exit', (code) => {
			if (code !== 0) {
				reject(errResponse.trim());
			}
			resolove(response.trim());
		});
	});
}
