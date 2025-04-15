import WebGL from 'three/addons/capabilities/WebGL.js';
import { Viewer } from './viewer.js';
import { SimpleDropzone } from 'simple-dropzone';
import { Validator } from './validator.js';
import { Footer } from './components/footer';
import queryString from 'query-string';
import fs from 'fs';
import path from 'path';

window.VIEWER = {};

if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
	console.error('The File APIs are not fully supported in this browser.');
} else if (!WebGL.isWebGLAvailable()) {
	console.error('WebGL is not supported in this browser.');
}




class App {
	/**
	 * @param  {Element} el
	 * @param  {Location} location
	 */
	constructor(el, location) {
		const hash = location.hash ? queryString.parse(location.hash) : {};
		this.options = {
			kiosk: Boolean(hash.kiosk),
			model: hash.model || '',
			preset: hash.preset || '',
			cameraPosition: hash.cameraPosition ? hash.cameraPosition.split(',').map(Number) : null,
		};

		this.el = el;
		this.viewer = null;
		this.viewerEl = null;
		this.spinnerEl = el.querySelector('.spinner');
		this.dropEl = el.querySelector('.dropzone');
		this.inputEl = el.querySelector('#file-input');
		this.validator = new Validator(el);

		this.createDropzone();
		this.hideSpinner();

		const options = this.options;

		if (options.kiosk) {
			const headerEl = document.querySelector('header');
			headerEl.style.display = 'none';
		}

		if (options.model) {
			this.view(options.model, '', new Map());
		}
	}
	/**
 * Sets up the file loader to read from the 'models' folder.
 */
	async createDropzone() {
		const filePath = 'models/ram.glb'; // Path to the saved file in the models folder
		const fileMap = new Map();

		try {
			// Fetch the file from the server
			const response = await fetch(filePath);
			if (!response.ok) {
				throw new Error(`Failed to fetch file at ${filePath}: ${response.statusText}`);
			}

			// Convert the response to a Blob
			const blob = await response.blob();

			// Create a File object and add it to the fileMap
			const file = new File([blob], 'cra.glb');
			fileMap.set(filePath, file);

			// Call the load method with the fileMap
			this.showSpinner();
			this.load(fileMap);
			this.hideSpinner();
		} catch (error) {
			console.error(error);
			this.hideSpinner();
		}
	}

	/**
	 * Sets up the view manager.
	 * @return {Viewer}
	 */
	createViewer() {
		this.viewerEl = document.createElement('div');
		this.viewerEl.classList.add('viewer');
		this.dropEl.innerHTML = '';
		this.dropEl.appendChild(this.viewerEl);
		this.viewer = new Viewer(this.viewerEl, this.options);
		return this.viewer;
	}

	
	


	/**
	 * Loads a fileset provided by user action.
	 * @param  {Map<string, File>} fileMap
	 */
	load(fileMap) {
		let rootFile;
		let rootPath;
		Array.from(fileMap).forEach(([path, file]) => {
			if (file.name.match(/\.(gltf|glb)$/)) {
				rootFile = file;
				rootPath = path.replace(file.name, '');
			}
		});

		if (!rootFile) {
			this.onError('No .gltf or .glb asset found.');
		}

		this.view(rootFile, rootPath, fileMap);
	}

	/**
	 * Passes a model to the viewer, given file and resources.
	 * @param  {File|string} rootFile
	 * @param  {string} rootPath
	 * @param  {Map<string, File>} fileMap
	 */
	view(rootFile, rootPath, fileMap) {
		if (this.viewer) this.viewer.clear();

		const viewer = this.viewer || this.createViewer();

		const fileURL = typeof rootFile === 'string' ? rootFile : URL.createObjectURL(rootFile);

		const cleanup = () => {
			this.hideSpinner();
			if (typeof rootFile === 'object') URL.revokeObjectURL(fileURL);
		};

		viewer
			.load(fileURL, rootPath, fileMap)
			.catch((e) => this.onError(e))
			.then((gltf) => {
				// TODO: GLTFLoader parsing can fail on invalid files. Ideally,
				// we could run the validator either way.
				if (!this.options.kiosk) {
					this.validator.validate(fileURL, rootPath, fileMap, gltf);
				}
				cleanup();
			});
	}

	/**
	 * @param  {Error} error
	 */
	onError(error) {
		let message = (error || {}).message || error.toString();
		if (message.match(/ProgressEvent/)) {
			message = 'Unable to retrieve this file. Check JS console and browser network tab.';
		} else if (message.match(/Unexpected token/)) {
			message = `Unable to parse file content. Verify that this file is valid. Error: "${message}"`;
		} else if (error && error.target && error.target instanceof Image) {
			message = 'Missing texture: ' + error.target.src.split('/').pop();
		}
		window.alert(message);
		console.error(error);
	}

	showSpinner() {
		this.spinnerEl.style.display = '';
	}

	hideSpinner() {
		this.spinnerEl.style.display = 'none';
	}
}



function createSpecsBox(specs) {
	const specsBox = document.createElement('div');
	specsBox.style.position = 'absolute';
	specsBox.style.top = '300px';
	specsBox.style.left = '10px';
	specsBox.style.zIndex = 1000;
	specsBox.style.backgroundColor = 'black';
	specsBox.style.color = 'white';
	specsBox.style.border = '1px solid #ccc';
	specsBox.style.padding = '10px';
	specsBox.style.boxShadow = '0px 2px 5px rgba(0,0,0,0.2)';
	specsBox.innerText = `
		Make: ${specs.make}
		Model: ${specs.model}
		Mileage: ${specs.mileage}
		Price: ${specs.price}
		Drive type: ${specs.driveType}
	`;

	document.body.appendChild(specsBox);
}



document.addEventListener('DOMContentLoaded', () => {
	const app = new App(document.body, location);

	app.createDropzone();
	let specs = {
		make:'Ford',
		model:'F-550',
		mileage:'10000',
		price:'$100000',
		driveType:'4WD',
	};
	createSpecsBox(specs);
	window.VIEWER.app = app;

	console.info('[glTF Viewer] Debugging data exported as `window.VIEWER`.');
});
