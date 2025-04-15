import {
	AmbientLight,
	AnimationMixer,
	AxesHelper,
	Box3,
	Cache,
	Color,
	DirectionalLight,
	GridHelper,
	HemisphereLight,
	LoaderUtils,
	LoadingManager,
	PMREMGenerator,
	PerspectiveCamera,
	PointsMaterial,
	REVISION,
	Scene,
	SkeletonHelper,
	Vector3,
	WebGLRenderer,
	LinearToneMapping,
	ACESFilmicToneMapping,
} from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { GUI } from 'dat.gui';

import { environments } from './environments.js';

const DEFAULT_CAMERA = '[default]';

const MANAGER = new LoadingManager();
const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;
const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(
	`${THREE_PATH}/examples/jsm/libs/draco/gltf/`,
);
const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(
	`${THREE_PATH}/examples/jsm/libs/basis/`,
);

const IS_IOS = isIOS();

const Preset = { ASSET_GENERATOR: 'assetgenerator' };

Cache.enabled = true;

export class Viewer {
	constructor(el, options) {
		this.el = el;
		this.options = options;

		this.lights = [];
		this.content = null;
		this.mixer = null;
		this.clips = [];
		this.gui = null;

		this.state = {
			environment:
				options.preset === Preset.ASSET_GENERATOR
					? environments.find((e) => e.id === 'footprint-court').name
					: environments[1].name,
			background: false,
			playbackSpeed: 1.0,
			actionStates: {},
			camera: DEFAULT_CAMERA,
			wireframe: false,
			skeleton: false,
			grid: false,
			autoRotate: false,

			// Lights
			punctualLights: true,
			exposure: 0.0,
			toneMapping: LinearToneMapping,
			ambientIntensity: 0.3,
			ambientColor: '#FFFFFF',
			directIntensity: 0.8 * Math.PI, // TODO(#116)
			directColor: '#FFFFFF',
			bgColor: '#191919',

			pointSize: 1.0,
		};

		this.prevTime = 0;

		this.stats = new Stats();
		this.stats.dom.height = '48px';
		[].forEach.call(this.stats.dom.children, (child) => (child.style.display = ''));

		this.backgroundColor = new Color(this.state.bgColor);

		this.scene = new Scene();
		this.scene.background = this.backgroundColor;

		const fov = options.preset === Preset.ASSET_GENERATOR ? (0.8 * 180) / Math.PI : 60;
		const aspect = el.clientWidth / el.clientHeight;
		this.defaultCamera = new PerspectiveCamera(fov, aspect, 0.01, 1000);
		this.activeCamera = this.defaultCamera;
		this.scene.add(this.defaultCamera);

		this.renderer = window.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.setClearColor(0xcccccc);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(el.clientWidth, el.clientHeight);

		this.pmremGenerator = new PMREMGenerator(this.renderer);
		this.pmremGenerator.compileEquirectangularShader();

		this.neutralEnvironment = this.pmremGenerator.fromScene(new RoomEnvironment()).texture;

		this.controls = new OrbitControls(this.defaultCamera, this.renderer.domElement);
		this.controls.screenSpacePanning = true;

		this.el.appendChild(this.renderer.domElement);

		this.cameraCtrl = null;
		this.cameraFolder = null;
		this.animFolder = null;
		this.animCtrls = [];
		this.morphFolder = null;
		this.morphCtrls = [];
		this.skeletonHelpers = [];
		this.gridHelper = null;
		this.axesHelper = null;

		this.addAxesHelper();
		this.addGUI();
		if (options.kiosk) this.gui.close();

		this.animate = this.animate.bind(this);
		requestAnimationFrame(this.animate);
		window.addEventListener('resize', this.resize.bind(this), false);
	}

	animate(time) {
		requestAnimationFrame(this.animate);

		const dt = (time - this.prevTime) / 1000;

		this.controls.update();
		this.stats.update();
		this.mixer && this.mixer.update(dt);
		this.render();

		this.prevTime = time;
	}

	render() {
		this.renderer.render(this.scene, this.activeCamera);
		if (this.state.grid) {
			this.axesCamera.position.copy(this.defaultCamera.position);
			this.axesCamera.lookAt(this.axesScene.position);
			this.axesRenderer.render(this.axesScene, this.axesCamera);
		}
	}

	resize() {
		const { clientHeight, clientWidth } = this.el.parentElement;

		this.defaultCamera.aspect = clientWidth / clientHeight;
		this.defaultCamera.updateProjectionMatrix();
		this.renderer.setSize(clientWidth, clientHeight);

		this.axesCamera.aspect = this.axesDiv.clientWidth / this.axesDiv.clientHeight;
		this.axesCamera.updateProjectionMatrix();
		this.axesRenderer.setSize(this.axesDiv.clientWidth, this.axesDiv.clientHeight);
	}

	load(url, rootPath, assetMap) {
		const baseURL = LoaderUtils.extractUrlBase(url);

		// Load.
		return new Promise((resolve, reject) => {
			// Intercept and override relative URLs.
			MANAGER.setURLModifier((url, path) => {
				// URIs in a glTF file may be escaped, or not. Assume that assetMap is
				// from an un-escaped source, and decode all URIs before lookups.
				
				const normalizedURL =
					rootPath +
					decodeURI(url)
						.replace(baseURL, '')
						.replace(/^(\.?\/)/, '');

				if (assetMap.has(normalizedURL)) {
					const blob = assetMap.get(normalizedURL);
					const blobURL = URL.createObjectURL(blob);
					blobURLs.push(blobURL);
					return blobURL;
				}

				return (path || '') + url;
			});

			const loader = new GLTFLoader(MANAGER)
				.setCrossOrigin('anonymous')
				.setDRACOLoader(DRACO_LOADER)
				.setKTX2Loader(KTX2_LOADER.detectSupport(this.renderer))
				.setMeshoptDecoder(MeshoptDecoder);

			const blobURLs = [];

			loader.load(
				url,
				(gltf) => {
					window.VIEWER.json = gltf;

					const scene = gltf.scene || gltf.scenes[0];
					const clips = gltf.animations || [];

					if (!scene) {
						// Valid, but not supported by this viewer.
						throw new Error(
							'This model contains no scene, and cannot be viewed here. However,' +
								' it may contain individual 3D resources.',
						);
					}

					this.setContent(scene, clips);

					blobURLs.forEach(URL.revokeObjectURL);


					resolve(gltf);
				},
				undefined,
				reject,
			);
		});
	}

	/**
	 * @param {THREE.Object3D} object
	 * @param {Array<THREE.AnimationClip} clips
	 */
	setContent(object, clips) {
		this.clear();

		object.updateMatrixWorld(); //

		const box = new Box3().setFromObject(object);
		const size = box.getSize(new Vector3()).length();
		const center = box.getCenter(new Vector3());

		this.controls.reset();

		object.position.x -= center.x;
		object.position.y -= ( center.y + size / 10.0);
		object.position.z -= center.z;

		this.controls.maxDistance = size * 10;

		this.defaultCamera.near = size / 100;
		this.defaultCamera.far = size * 100;
		this.defaultCamera.updateProjectionMatrix();

		if (this.options.cameraPosition) {
			this.defaultCamera.position.fromArray(this.options.cameraPosition);
			this.defaultCamera.lookAt(new Vector3());
		} else {
			this.defaultCamera.position.copy(center);
			this.defaultCamera.position.x += size / 2.0;
			this.defaultCamera.position.y += size / 5.0;
			this.defaultCamera.position.z += size / 2.0;
			this.defaultCamera.lookAt(center);
		}

		this.setCamera(DEFAULT_CAMERA);

		this.axesCamera.position.copy(this.defaultCamera.position);
		this.axesCamera.lookAt(this.axesScene.position);
		this.axesCamera.near = size / 100;
		this.axesCamera.far = size * 100;
		this.axesCamera.updateProjectionMatrix();
		this.axesCorner.scale.set(size, size, size);

		this.controls.saveState();

		this.scene.add(object);
		this.content = object;

		this.state.punctualLights = true;

		this.content.traverse((node) => {
			if (node.isLight) {
				this.state.punctualLights = false;
			}
		});

		this.setClips(clips);

		this.updateLights();
		this.updateGUI();
		this.updateEnvironment();
		this.updateDisplay();

		window.VIEWER.scene = this.content;

		this.printGraph(this.content);
	}

	printGraph(node) {
		console.group(' <' + node.type + '> ' + node.name);
		node.children.forEach((child) => this.printGraph(child));
		console.groupEnd();
	}

	/**
	 * @param {Array<THREE.AnimationClip} clips
	 */
	setClips(clips) {
		if (this.mixer) {
			this.mixer.stopAllAction();
			this.mixer.uncacheRoot(this.mixer.getRoot());
			this.mixer = null;
		}

		this.clips = clips;
		if (!clips.length) return;

		this.mixer = new AnimationMixer(this.content);
	}

	playAllClips() {
		this.clips.forEach((clip) => {
			this.mixer.clipAction(clip).reset().play();
			this.state.actionStates[clip.name] = true;
		});
	}

	/**
	 * @param {string} name
	 */
	setCamera(name) {
		if (name === DEFAULT_CAMERA) {
			this.controls.enabled = true;
			this.activeCamera = this.defaultCamera;
		} else {
			this.controls.enabled = false;
			this.content.traverse((node) => {
				if (node.isCamera && node.name === name) {
					this.activeCamera = node;
				}
			});
		}
	}

	updateLights() {
		const state = this.state;
		const lights = this.lights;

		if (state.punctualLights && !lights.length) {
			this.addLights();
		} else if (!state.punctualLights && lights.length) {
			this.removeLights();
		}

		this.renderer.toneMapping = Number(state.toneMapping);
		this.renderer.toneMappingExposure = Math.pow(2, state.exposure);

		if (lights.length === 2) {
			lights[0].intensity = state.ambientIntensity;
			lights[0].color.set(state.ambientColor);
			lights[1].intensity = state.directIntensity;
			lights[1].color.set(state.directColor);
		}
	}

	addLights() {
		const state = this.state;

		if (this.options.preset === Preset.ASSET_GENERATOR) {
			const hemiLight = new HemisphereLight();
			hemiLight.name = 'hemi_light';
			this.scene.add(hemiLight);
			this.lights.push(hemiLight);
			return;
		}

		const light1 = new AmbientLight(state.ambientColor, state.ambientIntensity);
		light1.name = 'ambient_light';
		this.defaultCamera.add(light1);

		const light2 = new DirectionalLight(state.directColor, state.directIntensity);
		light2.position.set(0.5, 0, 0.866); // ~60º
		light2.name = 'main_light';
		this.defaultCamera.add(light2);

		this.lights.push(light1, light2);
	}

	removeLights() {
		this.lights.forEach((light) => light.parent.remove(light));
		this.lights.length = 0;
	}

	updateEnvironment() {
		const environment = environments.filter(
			(entry) => entry.name === this.state.environment,
		)[0];

		this.getCubeMapTexture(environment).then(({ envMap }) => {
			this.scene.environment = envMap;
			this.scene.background = this.state.background ? envMap : this.backgroundColor;
		});
	}

	getCubeMapTexture(environment) {
		const { id, path } = environment;

		// neutral (THREE.RoomEnvironment)
		if (id === 'neutral') {
			return Promise.resolve({ envMap: this.neutralEnvironment });
		}

		// none
		if (id === '') {
			return Promise.resolve({ envMap: null });
		}

		return new Promise((resolve, reject) => {
			new EXRLoader().load(
				path,
				(texture) => {
					const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
					this.pmremGenerator.dispose();

					resolve({ envMap });
				},
				undefined,
				reject,
			);
		});
	}

	updateDisplay() {
		if (this.skeletonHelpers.length) {
			this.skeletonHelpers.forEach((helper) => this.scene.remove(helper));
		}

		traverseMaterials(this.content, (material) => {
			material.wireframe = this.state.wireframe;

			if (material instanceof PointsMaterial) {
				material.size = this.state.pointSize;
			}
		});

		this.content.traverse((node) => {
			if (node.geometry && node.skeleton && this.state.skeleton) {
				const helper = new SkeletonHelper(node.skeleton.bones[0].parent);
				helper.material.linewidth = 3;
				this.scene.add(helper);
				this.skeletonHelpers.push(helper);
			}
		});

		if (this.state.grid !== Boolean(this.gridHelper)) {
			if (this.state.grid) {
				this.gridHelper = new GridHelper();
				this.axesHelper = new AxesHelper();
				this.axesHelper.renderOrder = 999;
				this.axesHelper.onBeforeRender = (renderer) => renderer.clearDepth();
				this.scene.add(this.gridHelper);
				this.scene.add(this.axesHelper);
			} else {
				this.scene.remove(this.gridHelper);
				this.scene.remove(this.axesHelper);
				this.gridHelper = null;
				this.axesHelper = null;
				this.axesRenderer.clear();
			}
		}

		this.controls.autoRotate = this.state.autoRotate;
	}

	updateBackground() {
		this.backgroundColor.set(this.state.bgColor);
	}

	/**
	 * Adds AxesHelper.
	 *
	 * See: https://stackoverflow.com/q/16226693/1314762
	 */
	addAxesHelper() {
		this.axesDiv = document.createElement('div');
		this.el.appendChild(this.axesDiv);
		this.axesDiv.classList.add('axes');

		const { clientWidth, clientHeight } = this.axesDiv;

		this.axesScene = new Scene();
		this.axesCamera = new PerspectiveCamera(50, clientWidth / clientHeight, 0.1, 10);
		this.axesScene.add(this.axesCamera);

		this.axesRenderer = new WebGLRenderer({ alpha: true });
		this.axesRenderer.setPixelRatio(window.devicePixelRatio);
		this.axesRenderer.setSize(this.axesDiv.clientWidth, this.axesDiv.clientHeight);

		this.axesCamera.up = this.defaultCamera.up;

		this.axesCorner = new AxesHelper(5);
		this.axesScene.add(this.axesCorner);
		this.axesDiv.appendChild(this.axesRenderer.domElement);
	}

	addGUI() {
		const gui = (this.gui = new GUI({
			autoPlace: false,
			width: 260,
			hideable: true,
		}));

		// Display controls.
		// const dispFolder = gui.addFolder('Display');
		const envBackgroundCtrl = gui.add(this.state, 'background');
		envBackgroundCtrl.onChange(() => this.updateEnvironment());
		const autoRotateCtrl = gui.add(this.state, 'autoRotate');
		autoRotateCtrl.onChange(() => this.updateDisplay());
		const wireframeCtrl = gui.add(this.state, 'wireframe');
		wireframeCtrl.onChange(() => this.updateDisplay());
		
		const envMapCtrl = gui.add(
			this.state,
			'environment',
			environments.map((env) => env.name),
		);
		envMapCtrl.onChange(() => this.updateEnvironment());
		[
			
			// gui.addColor(this.state, 'directColor'),
		].forEach((ctrl) => ctrl.onChange(() => this.updateLights()));

		// Animation controls.
		this.animFolder = gui.addFolder('Animation');
		this.animFolder.domElement.style.display = 'none';
		const playbackSpeedCtrl = this.animFolder.add(this.state, 'playbackSpeed', 0, 1);
		playbackSpeedCtrl.onChange((speed) => {
			if (this.mixer) this.mixer.timeScale = speed;
		});
		this.animFolder.add({ playAll: () => this.playAllClips() }, 'playAll');

		// Morph target controls.
		this.morphFolder = gui.addFolder('Morph Targets');
		this.morphFolder.domElement.style.display = 'none';

		// Camera controls.
		this.cameraFolder = gui.addFolder('Cameras');
		this.cameraFolder.domElement.style.display = 'none';

		

		const guiWrap = document.createElement('div');
		this.el.appendChild(guiWrap);
		guiWrap.classList.add('gui-wrap');
		guiWrap.appendChild(gui.domElement);
		gui.open();
	}

	updateGUI() {
		this.cameraFolder.domElement.style.display = 'none';

		this.morphCtrls.forEach((ctrl) => ctrl.remove());
		this.morphCtrls.length = 0;
		this.morphFolder.domElement.style.display = 'none';

		this.animCtrls.forEach((ctrl) => ctrl.remove());
		this.animCtrls.length = 0;
		this.animFolder.domElement.style.display = 'none';

		const cameraNames = [];
		const morphMeshes = [];
		this.content.traverse((node) => {
			if (node.geometry && node.morphTargetInfluences) {
				morphMeshes.push(node);
			}
			if (node.isCamera) {
				node.name = node.name || `VIEWER__camera_${cameraNames.length + 1}`;
				cameraNames.push(node.name);
			}
		});

		if (cameraNames.length) {
			this.cameraFolder.domElement.style.display = '';
			if (this.cameraCtrl) this.cameraCtrl.remove();
			const cameraOptions = [DEFAULT_CAMERA].concat(cameraNames);
			this.cameraCtrl = this.cameraFolder.add(this.state, 'camera', cameraOptions);
			this.cameraCtrl.onChange((name) => this.setCamera(name));
		}

		if (morphMeshes.length) {
			this.morphFolder.domElement.style.display = '';
			morphMeshes.forEach((mesh) => {
				if (mesh.morphTargetInfluences.length) {
					const nameCtrl = this.morphFolder.add(
						{ name: mesh.name || 'Untitled' },
						'name',
					);
					this.morphCtrls.push(nameCtrl);
				}
				for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
					const ctrl = this.morphFolder
						.add(mesh.morphTargetInfluences, i, 0, 1, 0.01)
						.listen();
					Object.keys(mesh.morphTargetDictionary).forEach((key) => {
						if (key && mesh.morphTargetDictionary[key] === i) ctrl.name(key);
					});
					this.morphCtrls.push(ctrl);
				}
			});
		}

		if (this.clips.length) {
			this.animFolder.domElement.style.display = '';
			const actionStates = (this.state.actionStates = {});
			this.clips.forEach((clip, clipIndex) => {
				clip.name = `${clipIndex + 1}. ${clip.name}`;

				// Autoplay the first clip.
				let action;
				if (clipIndex === 0) {
					actionStates[clip.name] = true;
					action = this.mixer.clipAction(clip);
					action.play();
				} else {
					actionStates[clip.name] = false;
				}

				// Play other clips when enabled.
				const ctrl = this.animFolder.add(actionStates, clip.name).listen();
				ctrl.onChange((playAnimation) => {
					action = action || this.mixer.clipAction(clip);
					action.setEffectiveTimeScale(1);
					playAnimation ? action.play() : action.stop();
				});
				this.animCtrls.push(ctrl);
			});
		}
	}



	clear() {
		if (!this.content) return;

		this.scene.remove(this.content);

		// dispose geometry
		this.content.traverse((node) => {
			if (!node.geometry) return;

			node.geometry.dispose();
		});

		// dispose textures
		traverseMaterials(this.content, (material) => {
			for (const key in material) {
				if (key !== 'envMap' && material[key] && material[key].isTexture) {
					material[key].dispose();
				}
			}
		});
	}
}


//a color picker on select vehicle changes color
function createColorPicker(callback) {
	const colorInput = document.createElement('input');
	colorInput.type = 'color';
	colorInput.style.position = 'absolute';
	colorInput.style.top = '30px';
	colorInput.style.left = '10px';
	colorInput.style.zIndex = 1000;

	colorInput.oninput = () => {
		callback(colorInput.value);
	};

	document.body.appendChild(colorInput);
}

createColorPicker((color) => {
	const selectedObject = window.VIEWER.scene;
	if (selectedObject) {
		selectedObject.traverse((node) => {
			if (node.isMesh) {
				node.material.color.set(color);
			}
		});
	}
});


	// help me create a button on screen
	function createButton(text, callback) {
		const container = document.createElement('div');
		container.style.position = 'absolute';
		container.style.top = '70px';
		container.style.left = '10px';
		container.style.zIndex = 1000;
	
		const button = document.createElement('button');
		button.innerText = text;
		button.style.padding = '8px';
		button.style.cursor = 'pointer';
		button.style.backgroundColor = 'black';
		button.style.color = 'white';
	
		const dropdown = document.createElement('div');
		dropdown.style.display = 'none';
		dropdown.style.position = 'absolute';
		dropdown.style.backgroundColor = 'white';
		dropdown.style.color = 'black';
		dropdown.style.border = '1px solid #ccc';
		dropdown.style.boxShadow = '0px 2px 5px rgba(0,0,0,0.2)';
		dropdown.style.marginTop = '5px';
	
		const options = [
			'Benz GLE',
			'G-Wagon',
			'Ford Master NG',
			'Russian Army Truck'
		];

		 let numberOfOptions = 0;
	
		options.forEach(option => {
			const item = document.createElement('div');
			item.innerText = option;
			item.style.padding = '8px';
			item.style.cursor = 'pointer';
			item.value = numberOfOptions;
			numberOfOptions++;
	
			item.onmouseenter = () => item.style.backgroundColor = '#f0f0f0';
			item.onmouseleave = () => item.style.backgroundColor = '#fff';
	
			item.onclick = () => {
				dropdown.style.display = 'none';
				callback(option);  // Call the callback with selected option
			};
	
			dropdown.appendChild(item);
		});
	
		button.onclick = () => {
			dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
		};
	
		container.appendChild(button);
		container.appendChild(dropdown);
		document.body.appendChild(container);
	}
	
// how do i use this button?
createButton('Select Vehicle', (selectedOption) => {
	console.log('Selected:', selectedOption);
	// You can trigger your vehicle loading or viewer logic here
	if (selectedOption === 'Benz GLE') {
		createDropzone2('mercedes_glb_amg.glb');
		let specs = {
			make: 'Mercedes-Benz',
			model: 'GLE',
			mileage: '30,000 km',
			price: '$60,000',
			driveType: 'AWD',
		};
		createSpecsBox(specs);
	} else if (selectedOption === 'G-Wagon') {
		createDropzone2('2020_mercedes-benz_g-class_amg_g_63.glb');
		let specs = {
			make: 'Mercedes-Benz',
			model: 'G-Wagon',
			mileage: '20,000 km',
			price: '$150,000',
			driveType: 'AWD',
		};
		createSpecsBox(specs);
	} else if (selectedOption === 'Ford Master NG') {
		createDropzone2('car_glb.glb');
		let specs = {
			make: 'Ford',
			model: 'Master NG',
			mileage: '40,000 km',
			price: '$25,000',
			driveType: 'FWD',
		};
		createSpecsBox(specs);
	} else if (selectedOption === 'Russian Army Truck') {
		createDropzone2('unnecessarily_ridiculous_truck.glb');
		let specs = {
			make: 'Russian Army',
			model: 'Truck',
			mileage: '100,000 km',
			price: '$15,000',
			driveType: 'AWD',
		};
		createSpecsBox(specs);
	}
});


//crete a text box show the cars specs Make: Toyota
// Model: 2002
// Mileage: 40000
// Price: 12000.0
// Drive type: 4WD
// function shoul take in the car specs and create a text box

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

function createImage(imagePath) {
	const image = document.createElement('img');
	image.src = imagePath;
	image.style.position = 'absolute';
	image.style.top = '100px';
	image.style.left = '10px';
	image.style.zIndex = 1000;
	image.style.cursor = 'grab';
	image.style.width = '150px'; // default size
	image.style.height = 'auto';
	image.style.userSelect = 'none';
	//float image to the left
	image.style.float = 'left';

	let isDragging = false;
	let offsetX = 0;
	let offsetY = 0;

	// Mouse down: start dragging
	image.addEventListener('mousedown', (e) => {
		isDragging = true;
		offsetX = e.clientX - image.offsetLeft;
		offsetY = e.clientY - image.offsetTop;
		image.style.cursor = 'grabbing';
	});

	// Mouse up: stop dragging
	document.addEventListener('mouseup', () => {
		isDragging = false;
		image.style.cursor = 'grab';
	});

	// Mouse move: handle drag
	document.addEventListener('mousemove', (e) => {
		if (isDragging) {
			image.style.left = `${e.clientX - offsetX}px`;
			image.style.top = `${e.clientY - offsetY}px`;
		}
	});

	// Scroll to resize
	image.addEventListener('wheel', (e) => {
		e.preventDefault();
		const currentWidth = parseFloat(image.style.width);
		const delta = e.deltaY > 0 ? -10 : 10;
		const newWidth = Math.max(50, currentWidth + delta);
		image.style.width = `${newWidth}px`;
	});

	document.body.appendChild(image);
}

function createImage2(imagePath) {
	const image = document.createElement('img');
	image.src = imagePath;
	image.style.position = 'absolute';
	image.style.top = '100px';
	image.style.left = '10px';
	image.style.zIndex = 1000;
	image.style.cursor = 'grab';
	image.style.width = '150px'; // default size
	image.style.height = 'auto';
	image.style.userSelect = 'none';

	let isDragging = false;
	let offsetX = 0;
	let offsetY = 0;

	// Mouse down: start dragging
	image.addEventListener('mousedown', (e) => {
		isDragging = true;
		offsetX = e.clientX - image.offsetLeft;
		offsetY = e.clientY - image.offsetTop;
		image.style.cursor = 'grabbing';
	});

	// Mouse up: stop dragging
	document.addEventListener('mouseup', () => {
		isDragging = false;
		image.style.cursor = 'grab';
	});

	// Mouse move: handle drag
	document.addEventListener('mousemove', (e) => {
		if (isDragging) {
			image.style.left = `${e.clientX - offsetX}px`;
			image.style.top = `${e.clientY - offsetY}px`;
		}
	});

	// Scroll to resize
	image.addEventListener('wheel', (e) => {
		e.preventDefault();
		const currentWidth = parseFloat(image.style.width);
		const delta = e.deltaY > 0 ? -10 : 10;
		const newWidth = Math.max(50, currentWidth + delta);
		image.style.width = `${newWidth}px`;
	});

	document.body.appendChild(image);
}
function createImage3(imagePath) {
	const image = document.createElement('img');
	image.src = imagePath;
	image.style.position = 'absolute';
	image.style.top = '100px';
	image.style.left = '10px';
	image.style.zIndex = 1000;
	image.style.cursor = 'grab';
	image.style.width = '150px'; // default size
	image.style.height = 'auto';
	image.style.userSelect = 'none';

	let isDragging = false;
	let offsetX = 0;
	let offsetY = 0;

	// Mouse down: start dragging
	image.addEventListener('mousedown', (e) => {
		isDragging = true;
		offsetX = e.clientX - image.offsetLeft;
		offsetY = e.clientY - image.offsetTop;
		image.style.cursor = 'grabbing';
	});

	// Mouse up: stop dragging
	document.addEventListener('mouseup', () => {
		isDragging = false;
		image.style.cursor = 'grab';
	});

	// Mouse move: handle drag
	document.addEventListener('mousemove', (e) => {
		if (isDragging) {
			image.style.left = `${e.clientX - offsetX}px`;
			image.style.top = `${e.clientY - offsetY}px`;
		}
	});

	// Scroll to resize
	image.addEventListener('wheel', (e) => {
		e.preventDefault();
		const currentWidth = parseFloat(image.style.width);
		const delta = e.deltaY > 0 ? -10 : 10;
		const newWidth = Math.max(50, currentWidth + delta);
		image.style.width = `${newWidth}px`;
	});

	document.body.appendChild(image);
}


createImage("models/3d-flower.png");
createImage2("models/close-up-colorful.png");
createImage3("models/beautiful-flower.png");

//how do add event listener to the button?
async function createDropzone2(fil0Path) {
	const filePath = 'models/' + fil0Path; // Path to the saved file in the models folder
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
		//this.showSpinner();
		var app = window.VIEWER.app;
		app.load(fileMap);
		//this.hideSpinner();
	} catch (error) {
		console.error(error);
		app.hideSpinner();
	}
}

function traverseMaterials(object, callback) {
	object.traverse((node) => {
		if (!node.geometry) return;
		const materials = Array.isArray(node.material) ? node.material : [node.material];
		materials.forEach(callback);
	});
}

// https://stackoverflow.com/a/9039885/1314762
function isIOS() {
	return (
		['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(
			navigator.platform,
		) ||
		// iPad on iOS 13 detection
		(navigator.userAgent.includes('Mac') && 'ontouchend' in document)
	);
}
